import { withResponsiveContainer } from '../chart-container';
import { useChartTheme, withChartTheme } from '../chart-theme.context';
import { axisTooltipShowContentFlag } from '../cartesian/tooltip';
import { scrollFriendlyGesture } from '../gesture';
import { echartsLegendLayoutFragment } from '../legend/echarts-legend-layout';
import type {
  StackChartEdge,
  StackChartLayout,
  StackChartProps,
  StackChartSelectEvent,
  StackChartView,
  StackDataItem,
} from './stack-chart.props';
import { createStackTooltipPreset, stackSharePercent, useStackItemTooltip } from './tooltip';
import type { StackItemTooltipContext } from './tooltip/stack-item-tooltip.types';
import { SkiaChart, SkiaRenderer } from '@wuba/react-native-echarts';
import { BarChart as EChartsBarChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  PolarComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import React, { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';

// Re-export types for backward compatibility
export type {
  StackChartEdge,
  StackChartLayout,
  StackChartProps,
  StackChartSelectEvent,
  StackChartView,
  StackDataItem,
} from './stack-chart.props';

echarts.use([
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  GridComponent,
  PolarComponent,
  SkiaRenderer,
  EChartsBarChart,
]);

/** Sweep of each arc view, in degrees: [start, end]. */
const VIEW_ANGLES: Record<Exclude<StackChartView, 'bar'>, [number, number]> = {
  'semi-circle': [180, 0],
  arc: [225, -45],
};

/** Scale labels drawn along an arc, when `interval` is not set. */
const DEFAULT_ARC_SPLIT_NUMBER = 4;

/** Fraction of the outer radius an arc reaches below its center: sin 45°, for the 225°→-45° sweep. */
const ARC_BELOW_CENTER = Math.sin(Math.PI / 4);

/** Height of a scale label, added on both sides of the ring when sizing it. */
const ARC_LABEL_PX = 14;

/** Name of the series that draws the unfilled track; kept out of the legend. */
const TRACK_SERIES_NAME = '__stack_track__';

/**
 * Rough legend metrics. ECharts lays the legend out itself; these only size the space the plot
 * gives up, so a single track sits next to its legend instead of a plot-sized gap away from it.
 */
const LEGEND_ITEM_PX = 32;
const LEGEND_CHAR_PX = 6.5;
const LEGEND_ROW_PX = 20;
/** The legend's own 8px offset from the edge, plus a little breathing room. */
const LEGEND_EDGE_PX = 14;
/** Space between the track and its legend. */
const LEGEND_GAP_PX = 10;

/** Breathing room above and below the bar inside its plot area. */
const BAR_BLOCK_PAD_PX = 12;
/** Share of the width a vertical legend may take. */
const LEGEND_SIDE_MAX = 0.42;
/** Matches the `width: '92%'` a horizontal legend is laid out in. */
const LEGEND_BAND_WIDTH = 0.92;

function legendItemWidths(labels: string[]): number[] {
  return labels.map((label) => LEGEND_ITEM_PX + label.length * LEGEND_CHAR_PX);
}

/** Height a top/bottom legend needs, counting the rows its items wrap onto. */
function legendBandReservePx(labels: string[], width: number): number {
  const available = Math.max(width * LEGEND_BAND_WIDTH, 1);
  let rows = 1;
  let used = 0;
  for (const itemWidth of legendItemWidths(labels)) {
    if (used > 0 && used + itemWidth > available) {
      rows += 1;
      used = itemWidth;
    } else {
      used += itemWidth;
    }
  }
  return rows * LEGEND_ROW_PX + LEGEND_EDGE_PX;
}

/**
 * Width a left/right legend needs, capped so the track keeps most of the chart. Includes the gap,
 * since the scale's end label is aligned hard against the plot edge facing the legend.
 */
function legendSideReservePx(labels: string[], width: number): number {
  const widest = legendItemWidths(labels).reduce((peak, w) => Math.max(peak, w), 0);
  return Math.min(width * LEGEND_SIDE_MAX, widest + LEGEND_EDGE_PX + LEGEND_GAP_PX);
}

/**
 * Places the track and a horizontal legend as one centered block, so the leftover height falls
 * outside the pair instead of between them.
 */
function packWithLegend(
  height: number,
  contentHeight: number,
  legendHeight: number,
  legendAtTop: boolean
): { contentTop: number; legendTop: number } {
  const gap = legendHeight > 0 ? LEGEND_GAP_PX : 0;
  const top = Math.max(0, (height - (contentHeight + gap + legendHeight)) / 2);
  return legendAtTop
    ? { contentTop: top + legendHeight + gap, legendTop: top }
    : { contentTop: top, legendTop: top + contentHeight + gap };
}

/** A ring radius in pixels; ECharts reads a percentage against half the smaller chart side. */
function radiusPx(radius: string | number, minDimension: number): number {
  if (typeof radius === 'number') return radius;
  const percent = parseFloat(radius);
  return Number.isFinite(percent) ? (percent / 100) * (minDimension / 2) : 0;
}

/** Applies the fit scale, keeping the unit the caller passed in. */
function scaleRingRadius(radius: string | number, scale: number): string | number {
  if (scale === 1) return radius;
  if (typeof radius === 'number') return radius * scale;
  const percent = parseFloat(radius);
  return Number.isFinite(percent) ? `${percent * scale}%` : radius;
}

/**
 * Sizes the ring to whatever the legend leaves, rather than nudging a fixed-size ring away from it
 * — a nudge leaves the slack pooled on one side as a gap. Returns the ink box so the caller can sit
 * the legend against it. A semi circle stops at its center line; a 270° arc also hangs below it.
 */
function polarLayout(params: {
  view: Exclude<StackChartView, 'bar'>;
  width: number;
  height: number;
  reserve: { top: number; bottom: number; left: number; right: number };
  outerRadius: string | number;
  labelOverhang: number;
}): { scale: number; centerX: number; inkAbove: number; inkHeight: number } {
  const { view, width, height, reserve, outerRadius, labelOverhang } = params;
  const availableWidth = Math.max(width - reserve.left - reserve.right, 1);
  const availableHeight = Math.max(height - reserve.top - reserve.bottom, 1);
  const unscaled = radiusPx(outerRadius, Math.min(width, height));
  const belowCenter = view === 'semi-circle' ? 0 : ARC_BELOW_CENTER;

  const heightForRing = availableHeight - 2 * labelOverhang;
  const widthForRing = availableWidth - 2 * labelOverhang;
  const scale =
    unscaled > 0 && heightForRing > 0 && widthForRing > 0
      ? Math.min(1, heightForRing / ((1 + belowCenter) * unscaled), widthForRing / (2 * unscaled))
      : 1;

  const outer = unscaled * scale;
  return {
    scale,
    centerX: reserve.left + availableWidth / 2,
    inkAbove: outer + labelOverhang,
    inkHeight: (1 + belowCenter) * outer + 2 * labelOverhang,
  };
}

/**
 * Rounds only the outer ends of the filled run: the start of its first segment and the end of its
 * last. Joints in between stay square.
 *
 * The two coordinate systems order their corners differently, and a uniform radius hides it:
 * - cartesian bar: `[top-left, top-right, bottom-right, bottom-left]`, so start, end, end, start.
 * - polar sector: `[start-inner, end-inner, start-outer, end-outer]`, so start, end, start, end —
 *   it is not the cartesian ring order, and reusing that puts a cap on the far end of the segment.
 */
function segmentCornerRadius(params: {
  index: number;
  firstIndex: number;
  lastIndex: number;
  radius: number | string;
  polar: boolean;
}): Array<number | string> {
  const { index, firstIndex, lastIndex, radius, polar } = params;
  if (radius === 0) return [0, 0, 0, 0];
  const start = index === firstIndex ? radius : 0;
  const end = index === lastIndex ? radius : 0;
  return polar ? [start, end, start, end] : [start, end, end, start];
}

const ChartComponent = ({
  data,
  view = 'bar',
  layout = 'overlap',
  width = 220,
  height = 350,
  min = 0,
  max,
  interval,
  trackColor = '#e8e8e899',
  thickness = 24,
  innerRadius = '58%',
  outerRadius = '82%',
  edge = 'curve',
  startAngle,
  endAngle,
  showAxisLabels = true,
  axisLabelFormatter,
  axisLabelMargin = 8,
  showSegmentLabels = false,
  segmentLabelFormatter,
  centerText,
  centerSubtext,
  showLegend = true,
  legendPosition = 'bottom',
  tooltip = 'card',
  renderTooltip,
  onSelect,
  ...props
}: StackChartProps) => {
  const { theme } = useChartTheme(props.theme, props.colors);
  const chartRef = useRef<any>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const stackContextRef = useRef<StackItemTooltipContext>({
    seriesSegments: [],
    shareBase: 0,
    span: 0,
  });

  const tooltipOverlayActive = renderTooltip != null || tooltip !== 'none';

  const renderTooltipFn = useMemo(() => {
    if (renderTooltip != null) return renderTooltip;
    if (tooltip === 'none') return () => null;
    return createStackTooltipPreset(tooltip);
  }, [renderTooltip, tooltip]);

  const { attachStackItemTooltipListeners, renderStackTooltipOverlay } = useStackItemTooltip({
    active: tooltipOverlayActive,
    renderTooltip: renderTooltipFn,
    contextRef: stackContextRef,
    width,
    height,
  });

  const segments = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return [] as Array<{ label: string; value: number; color?: string }>;
    }
    return (data as Array<StackDataItem | number>).map((item, index) => {
      const raw = typeof item === 'number' ? { value: item } : item;
      const value = Number(raw?.value);
      return {
        label: raw?.label != null && raw.label !== '' ? String(raw.label) : `Segment ${index + 1}`,
        value: Number.isFinite(value) ? Math.max(0, value) : 0,
        ...(typeof raw?.color === 'string' && raw.color !== '' ? { color: raw.color } : {}),
      };
    });
  }, [data]);

  const colored = useMemo(
    () =>
      segments.map((segment, index) => ({
        ...segment,
        color: segment.color ?? theme.series[index % theme.series.length].color,
      })),
    [segments, theme]
  );

  const isOverlap = layout === 'overlap';

  const total = useMemo(() => colored.reduce((sum, s) => sum + s.value, 0), [colored]);
  const longest = useMemo(() => colored.reduce((peak, s) => Math.max(peak, s.value), 0), [colored]);

  /** Track length the segments occupy: end to end when stacked, the longest one when overlaid. */
  const filled = isOverlap ? longest : total;

  /** Scale end: the segments fill the track unless the caller reserves headroom with `max`. */
  const resolvedMax = useMemo(() => {
    const candidate = max != null && Number.isFinite(max) ? Number(max) : min + filled;
    return candidate > min ? candidate : min + 1;
  }, [max, min, filled]);

  const span = resolvedMax - min;

  /**
   * Draw order. Overlaid segments run longest first so the shorter ones stay on top and visible;
   * `data` order is preserved elsewhere (legend, select events) via each segment's `dataIndex`.
   */
  const drawOrder = useMemo(() => {
    const indexed = colored.map((segment, dataIndex) => ({ ...segment, dataIndex }));
    return isOverlap ? [...indexed].sort((a, b) => b.value - a.value) : indexed;
  }, [colored, isOverlap]);

  const { option, seriesSegments } = useMemo(() => {
    if (colored.length === 0) return { option: { series: [] }, seriesSegments: [] };

    const isPolar = view !== 'bar';
    const barWidth = isPolar ? '100%' : thickness;
    const showLabels = showSegmentLabels || segmentLabelFormatter != null;

    /** Space the legend takes on its own side; the track gets the rest. */
    const legendReserve = { top: 0, bottom: 0, left: 0, right: 0 };
    const legendBand = legendPosition === 'top' || legendPosition === 'bottom';
    const labels = colored.map((s) => s.label);
    if (showLegend) {
      legendReserve[legendPosition] = legendBand
        ? legendBandReservePx(labels, width)
        : legendSideReservePx(labels, width);
    }

    // Sized before the series: the ring band sets the corner radius the segments are built with.
    const ring = isPolar
      ? polarLayout({
          view,
          width,
          height,
          reserve: legendReserve,
          outerRadius,
          // Scale labels sit outside the ring, unless a negative margin tucks them inside it.
          labelOverhang: showAxisLabels ? Math.max(axisLabelMargin, 0) + ARC_LABEL_PX : 4,
        })
      : null;

    /**
     * Corner radius in pixels for both coordinate systems. A percentage reads as zero on a
     * *stacked* polar sector — it survives only on the unstacked bars an overlap builds — so the
     * ring band is measured instead of handed to ECharts as `'50%'`.
     */
    const ringBandPx = ring
      ? Math.max(
          0,
          (radiusPx(outerRadius, Math.min(width, height)) -
            radiusPx(innerRadius, Math.min(width, height))) *
            ring.scale
        )
      : 0;
    const cornerRadius = edge === 'flat' ? 0 : isPolar ? ringBandPx / 2 : thickness / 2;

    /** The track runs the whole scale from `min`, in both layouts, so it is drawn first and behind. */
    const showTrack = span - filled > 0;

    /**
     * The filled run and the unfilled track are capped independently: the run rounds at the start
     * of its first segment and the end of its last, joints between segments stay square, and the
     * track is a shape of its own rounded at both ends. Every overlaid bar is its own pill.
     */
    const pill: Array<number | string> = [cornerRadius, cornerRadius, cornerRadius, cornerRadius];
    const filledIndexes = drawOrder
      .map((segment, index) => (segment.value > 0 ? index : -1))
      .filter((index) => index >= 0);
    const firstFilled = filledIndexes[0] ?? 0;
    const lastFilled = filledIndexes[filledIndexes.length - 1] ?? 0;
    const cornersFor = (index: number): Array<number | string> =>
      isOverlap
        ? pill
        : segmentCornerRadius({
            index,
            firstIndex: firstFilled,
            lastIndex: lastFilled,
            radius: cornerRadius,
            polar: isPolar,
          });

    /**
     * Bars that share an origin have to be laid out on top of each other rather than side by side:
     * on a cartesian grid `barGap: '-100%'` collapses the group, and on polar — where that gap
     * zeroes a bar's thickness — each overlapping bar takes a `polar` of its own. A stack needs two
     * such layers, the track behind and the stacked run in front; an overlap needs one per bar.
     */
    const trackLayer = 0;
    const segmentLayerBase = showTrack ? 1 : 0;
    let layerCount = segmentLayerBase + 1;

    const barSeries = (params: {
      name: string;
      value: number;
      color: string;
      corners: Array<number | string>;
      stacked: boolean;
      layer: number;
    }): Record<string, unknown> => {
      layerCount = Math.max(layerCount, params.layer + 1);
      return {
        type: 'bar',
        name: params.name,
        data: [params.value],
        barWidth,
        itemStyle: { color: params.color, borderRadius: params.corners },
        ...(params.stacked ? { stack: 'stack' } : {}),
        ...(isPolar
          ? { coordinateSystem: 'polar', polarIndex: params.layer }
          : { barGap: '-100%' }),
      };
    };

    /** Series order doubles as z-order: the track first, then the segments over it. */
    const seriesList: any[] = [];
    /** Segment per series index; holes mark the track, which is not interactive. */
    const seriesSegments: Array<{ label: string; value: number; color?: string; dataIndex: number } | undefined> = [];

    if (showTrack) {
      seriesList.push({
        ...barSeries({
          name: TRACK_SERIES_NAME,
          value: span,
          color: trackColor,
          corners: pill,
          stacked: false,
          layer: trackLayer,
        }),
        silent: true,
        animation: false,
        legendHoverLink: false,
        tooltip: { show: false },
        emphasis: { disabled: true },
      });
      seriesSegments.push(undefined);
    }

    drawOrder.forEach((segment, index) => {
      const series: any = {
        ...barSeries({
          name: segment.label,
          value: segment.value,
          color: segment.color,
          corners: cornersFor(index),
          stacked: !isOverlap,
          layer: segmentLayerBase + (isOverlap ? index : 0),
        }),
        emphasis: {
          focus: 'none',
          itemStyle: {
            shadowBlur: 8,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)',
          },
        },
      };
      if (showLabels) {
        series.label = {
          show: true,
          // Overlaid bars share their start, so labels sit at each end rather than piling up.
          position: isOverlap ? (isPolar ? 'insideEnd' : 'insideRight') : 'inside',
          color: '#fff',
          fontSize: 11,
          formatter: () =>
            segmentLabelFormatter
              ? segmentLabelFormatter(segment.value, segment.label, segment.dataIndex)
              : String(segment.value),
        };
      }
      seriesList.push(series);
      seriesSegments.push(segment);
    });

    const valueAxisFragment = {
      type: 'value' as const,
      min,
      max: resolvedMax,
      ...(interval != null ? { interval } : {}),
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: {
        show: showAxisLabels,
        margin: axisLabelMargin,
        color: theme.axis.x.tickLabelColor,
        ...(axisLabelFormatter != null
          ? { formatter: (value: number) => axisLabelFormatter(value) }
          : {}),
      },
    };

    const tooltipConfig: any = tooltipOverlayActive
      ? { trigger: 'item', ...axisTooltipShowContentFlag(true) }
      : { show: false };

    const legendConfig: any = showLegend
      ? {
          show: true,
          data: labels,
          ...echartsLegendLayoutFragment(legendPosition),
          textStyle: {
            color: theme.legend.textColor,
            fontSize: theme.legend.fontSize,
          },
          backgroundColor: theme.legend.backgroundColor,
        }
      : undefined;

    const config: any = {
      tooltip: tooltipConfig,
      series: seriesList,
    };
    if (legendConfig) config.legend = legendConfig;

    /** Anchors a horizontal legend just past the track instead of at the chart edge. */
    const placeLegendBand = (contentHeight: number): number => {
      const legendHeight = legendReserve[legendPosition] - LEGEND_EDGE_PX;
      const { contentTop, legendTop } = packWithLegend(
        height,
        contentHeight,
        showLegend && legendBand ? legendHeight : 0,
        legendPosition === 'top'
      );
      if (legendConfig && legendBand) {
        delete legendConfig.top;
        delete legendConfig.bottom;
        legendConfig.top = legendTop;
      }
      return contentTop;
    };

    if (isPolar && ring) {
      const [defaultStart, defaultEnd] = VIEW_ANGLES[view];
      const { scale: ringScale, centerX, inkAbove, inkHeight } = ring;
      const centerY = placeLegendBand(inkHeight) + inkAbove;
      const center: [string, string] = [
        `${(centerX / width) * 100}%`,
        `${(centerY / height) * 100}%`,
      ];
      const radius = [
        scaleRingRadius(innerRadius, ringScale),
        scaleRingRadius(outerRadius, ringScale),
      ];
      // One coordinate system per overlapping layer; identical geometry makes the rings coincide.
      const polarCount = layerCount;

      config.polar = Array.from({ length: polarCount }, () => ({ center, radius }));
      config.angleAxis = Array.from({ length: polarCount }, (_unused, index) => ({
        ...valueAxisFragment,
        // An angle axis defaults to 12 splits, which crowds the arc; 4 reads like a gauge scale.
        ...(interval != null ? {} : { splitNumber: DEFAULT_ARC_SPLIT_NUMBER }),
        polarIndex: index,
        startAngle: startAngle ?? defaultStart,
        endAngle: endAngle ?? defaultEnd,
        clockwise: true,
        axisLabel: {
          ...valueAxisFragment.axisLabel,
          // Coincident rings would otherwise draw the same scale once per series.
          show: showAxisLabels && index === 0,
          color: theme.axis.r.tickLabelColor,
        },
        z: 10,
      }));
      config.radiusAxis = Array.from({ length: polarCount }, (_unused, index) => ({
        type: 'category',
        data: ['stack'],
        polarIndex: index,
        show: false,
        z: 10,
      }));

      if ((centerText != null && centerText !== '') || (centerSubtext != null && centerSubtext !== '')) {
        config.title = {
          text: centerText ?? '',
          subtext: centerSubtext ?? '',
          left: center[0],
          top: center[1],
          textAlign: 'center',
          textVerticalAlign: 'middle',
          textStyle: {
            fontSize: 18,
            color: theme.legend.textColor,
            fontWeight: 'bold',
          },
          subtextStyle: {
            fontSize: 12,
            color: theme.legend.textColor,
            align: 'center',
          },
          itemGap: 4,
          z: 100,
        };
      }
      return { option: config, seriesSegments };
    }

    config.xAxis = {
      ...valueAxisFragment,
      axisLabel: {
        ...valueAxisFragment.axisLabel,
        // Keeps the first and last scale labels inside the chart instead of centered on the ends.
        alignMinLabel: 'left',
        alignMaxLabel: 'right',
      },
    };
    config.yAxis = {
      type: 'category',
      data: [''],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      splitLine: { show: false },
    };
    /**
     * The grid is sized to the bar rather than filling the chart: a single category would otherwise
     * center the bar in a tall plot area and strand its scale labels far below it.
     * `containLabel` keeps those labels inside the box.
     */
    const labelHeight = showAxisLabels ? Math.max(axisLabelMargin, 0) + ARC_LABEL_PX : 0;
    const barBlockHeight = Math.min(thickness + BAR_BLOCK_PAD_PX + labelHeight, height);
    config.grid = {
      left: Math.max(12, legendReserve.left),
      right: Math.max(12, legendReserve.right),
      top: placeLegendBand(barBlockHeight),
      height: barBlockHeight,
      containLabel: true,
    };
    return { option: config, seriesSegments };
  }, [
    colored,
    drawOrder,
    view,
    isOverlap,
    min,
    resolvedMax,
    span,
    filled,
    interval,
    trackColor,
    thickness,
    innerRadius,
    outerRadius,
    edge,
    startAngle,
    endAngle,
    showAxisLabels,
    axisLabelFormatter,
    axisLabelMargin,
    showSegmentLabels,
    segmentLabelFormatter,
    centerText,
    centerSubtext,
    showLegend,
    legendPosition,
    theme,
    tooltipOverlayActive,
    width,
    height,
  ]);

  stackContextRef.current = { seriesSegments, shareBase: isOverlap ? span : total, span };

  useEffect(() => {
    let chart: any;
    let detachStackTooltip = () => {};
    if (chartRef.current) {
      try {
        chart = echarts.init(chartRef.current, 'light', { width, height });
        chart.setOption(option, true);

        detachStackTooltip = attachStackItemTooltipListeners(chart);

        const handleSegmentClick = (params: {
          componentType?: string;
          seriesType?: string;
          seriesIndex?: number;
          seriesName?: string;
        }) => {
          const cb = onSelectRef.current;
          if (typeof cb !== 'function') return;
          if (params.componentType !== 'series') return;
          if (params.seriesType !== 'bar') return;
          const si = params.seriesIndex;
          if (typeof si !== 'number' || si < 0) return;
          const ctx = stackContextRef.current;
          // A hole means the unfilled track, which is not selectable.
          const segment = ctx.seriesSegments[si];
          if (!segment) return;
          cb({
            seriesIndex: segment.dataIndex,
            dataIndex: 0,
            label: segment.label,
            value: segment.value,
            percent: stackSharePercent(segment.value, ctx.shareBase),
          } satisfies StackChartSelectEvent);
        };

        chart.on('click', handleSegmentClick);
      } catch (error) {
        console.warn('Stack chart initialization error:', error);
      }
    }
    return () => {
      detachStackTooltip();
      if (chart) {
        try {
          chart.dispose();
        } catch (error) {
          console.warn('Stack chart disposal error:', error);
        }
      }
    };
  }, [option, width, height, attachStackItemTooltipListeners]);

  return (
    <View style={{ width, height, position: 'relative' }}>
      <SkiaChart ref={chartRef} useRNGH gesture={scrollFriendlyGesture} />
      {renderStackTooltipOverlay()}
    </View>
  );
};

const StackChartComponent = withResponsiveContainer(withChartTheme(ChartComponent));
export const StackChart = Object.assign(StackChartComponent, {
  displayName: 'StackChart',
});
