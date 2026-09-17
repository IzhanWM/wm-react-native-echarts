import { withResponsiveContainer } from '../chart-container';
import { useChartTheme, withChartTheme } from '../chart-theme.context';
import { axisTooltipShowContentFlag } from '../cartesian/tooltip';
import type { RadialChartProps, RadialChartSelectEvent, RadialDataItem } from './radial-chart.props';
import { echartsLegendLayoutFragment } from '../legend/echarts-legend-layout';
import { createRadialTooltipPreset, useRadialItemTooltip } from './tooltip';
import type { RadialItemTooltipContext } from './tooltip/radial-item-tooltip.types';
import { SkiaChart, SkiaRenderer } from '@wuba/react-native-echarts';
import { scrollFriendlyGesture } from '../gesture';
import { PieChart as EChartsPieChart } from 'echarts/charts';
import { LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import React, { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';

// Re-export types for backward compatibility
export type { RadialChartProps, RadialChartSelectEvent, RadialDataItem } from './radial-chart.props';

echarts.use([TooltipComponent, TitleComponent, LegendComponent, SkiaRenderer, EChartsPieChart]);

/** Percent of height reserved for horizontal legend (top/bottom) to avoid overlap */
const LEGEND_RESERVE_PCT = 22;
/** Percent of width reserved for vertical legend (left/right) to avoid overlap */
const LEGEND_RESERVE_WIDTH_PCT = 26;

/** Default blue gradient (outer dark → inner light) for concentric rings */
const DEFAULT_RING_COLORS = [
  '#1e3a8a',
  '#1e40af',
  '#2563eb',
  '#3b82f6',
  '#60a5fa',
  '#93c5fd',
  '#bfdbfe',
];

const ChartComponent = ({
  data,
  width = 220,
  height = 350,
  innerRadius = '20%',
  backgroundColor = '#e8e8e899',
  centerText,
  centerSubtext,
  showLegend = true,
  legendPosition = 'bottom',
  startAngle = 0,
  clockwise = false,
  ringGap = '4%',
  tooltip = 'card',
  renderTooltip,
  onSelect,
  ...props
}: RadialChartProps) => {
  const { theme } = useChartTheme(props.theme, props.colors);
  const chartRef = useRef<any>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const radialContextRef = useRef<RadialItemTooltipContext>({ normalizedSeries: [] });
  const themeSeriesRef = useRef(theme.series);
  themeSeriesRef.current = theme.series;

  const tooltipOverlayActive = renderTooltip != null || tooltip !== 'none';

  const renderTooltipFn = useMemo(() => {
    if (renderTooltip != null) return renderTooltip;
    if (tooltip === 'none') return () => null;
    return createRadialTooltipPreset(tooltip);
  }, [renderTooltip, tooltip]);

  const { attachRadialItemTooltipListeners, renderRadialTooltipOverlay } = useRadialItemTooltip({
    active: tooltipOverlayActive,
    renderTooltip: renderTooltipFn,
    contextRef: radialContextRef,
    themeSeriesRef,
    width,
    height,
  });

  const normalizedData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [] as RadialDataItem[];
    return data.map((d) => ({
      label: d.label,
      value: Math.min(100, Math.max(0, Number(d.value))),
    }));
  }, [data]);

  radialContextRef.current = { normalizedSeries: normalizedData };

  const option = useMemo(() => {
    if (normalizedData.length === 0) return { series: [] };

    const seriesColors =
      props.colors && props.colors.length > 0
        ? props.colors
        : theme.series.map((s) => s.color);
    const ringColors =
      seriesColors.length >= normalizedData.length
        ? seriesColors
        : DEFAULT_RING_COLORS.slice(0, normalizedData.length);

    const innerPct =
      typeof innerRadius === 'number'
        ? innerRadius
        : typeof innerRadius === 'string' && innerRadius.endsWith('%')
          ? parseFloat(innerRadius)
          : 20;
    const gapPct =
      typeof ringGap === 'number'
        ? ringGap
        : typeof ringGap === 'string' && ringGap.endsWith('%')
          ? parseFloat(ringGap)
          : 0;
    const n = normalizedData.length;
    const totalGap = (n - 1) * gapPct;
    const available = 100 - innerPct - totalGap;
    const ringStep = n > 0 ? available / n : 0;

    const legendTopBottom =
      showLegend && (legendPosition === 'top' || legendPosition === 'bottom');
    const legendLeftRight =
      showLegend && (legendPosition === 'left' || legendPosition === 'right');
    const radiusScaleY = legendTopBottom
      ? (100 - LEGEND_RESERVE_PCT) / 100
      : 1;
    const radiusScaleX = legendLeftRight
      ? (100 - LEGEND_RESERVE_WIDTH_PCT) / 100
      : 1;
    const radiusScale = Math.min(radiusScaleY, radiusScaleX);
    const centerY = legendTopBottom
      ? legendPosition === 'bottom'
        ? (100 - LEGEND_RESERVE_PCT) / 2
        : 100 - (100 - LEGEND_RESERVE_PCT) / 2
      : 50;
    const centerX = legendLeftRight
      ? legendPosition === 'left'
        ? 100 - (100 - LEGEND_RESERVE_WIDTH_PCT) / 2
        : (100 - LEGEND_RESERVE_WIDTH_PCT) / 2
      : 50;

    const seriesConfigs = normalizedData.map((item, index) => {
      const fillPct = item.value;
      const restPct = 100 - fillPct;
      const ringInner = innerPct + index * (ringStep + gapPct);
      const ringOuter = ringInner + ringStep;
      const color = ringColors[index % ringColors.length];
      const name = item.label ?? `Ring ${index + 1}`;
      const scaledInner = ringInner * radiusScale;
      const scaledOuter = ringOuter * radiusScale;

      return {
        type: 'pie',
        radius: [`${scaledInner}%`, `${scaledOuter}%`],
        center: [`${centerX}%`, `${centerY}%`],
        startAngle,
        clockwise,
        data: [
          {
            name: `${name} (${fillPct}%)`,
            value: fillPct,
            itemStyle: { color },
          },
          {
            name: '',
            value: restPct,
            itemStyle: { color: backgroundColor },
            label: { show: false },
            labelLine: { show: false },
          },
        ],
        label: { show: false },
        labelLine: { show: false },
        emphasis: {
          focus: 'none',
          scale: false,
          itemStyle: {
            shadowBlur: 8,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)',
          },
        },
      };
    });

    const legendData = normalizedData.map((item, index) =>
      `${item.label ?? `Ring ${index + 1}`} (${item.value}%)`
    );

    const tooltipConfig: any = tooltipOverlayActive
      ? {
          trigger: 'item',
          ...axisTooltipShowContentFlag(true),
        }
      : { show: false };

    const config: any = {
      tooltip: tooltipConfig,
      series: seriesConfigs,
    };

    if (showLegend) {
      config.legend = {
        show: true,
        data: legendData,
        ...echartsLegendLayoutFragment(legendPosition),
        textStyle: {
          color: theme.legend?.textColor ?? '#333333',
          fontSize: theme.legend?.fontSize ?? 11,
        },
      };
    }

    if (centerText != null && centerText !== '' || centerSubtext != null && centerSubtext !== '') {
      const textColor = theme.legend?.textColor ?? '#333333';
      config.title = {
        text: centerText ?? '',
        subtext: centerSubtext ?? '',
        left: 'center',
        top: 'middle',
        textStyle: {
          fontSize: 16,
          color: textColor,
          fontWeight: 'bold',
        },
        subtextStyle: {
          fontSize: 12,
          color: textColor,
        },
        itemGap: 4,
        z: 100,
      };
    }

    return config;
  }, [
    normalizedData,
    theme,
    innerRadius,
    backgroundColor,
    centerText,
    centerSubtext,
    showLegend,
    legendPosition,
    startAngle,
    clockwise,
    ringGap,
    props.colors,
    tooltipOverlayActive,
  ]);

  useEffect(() => {
    let chart: any;
    let detachRadialTooltip = () => {};
    if (chartRef.current) {
      try {
        chart = echarts.init(chartRef.current, 'light', {
          width,
          height,
        });
        chart.setOption(option);

        detachRadialTooltip = attachRadialItemTooltipListeners(chart);

        const handlePieClick = (params: {
          componentType?: string;
          seriesType?: string;
          seriesIndex?: number;
          dataIndex?: number;
          value?: number;
        }) => {
          const cb = onSelectRef.current;
          if (typeof cb !== 'function') return;
          if (params.componentType !== 'series') return;
          if (params.seriesType !== 'pie') return;
          if (params.dataIndex !== 0) return;
          const ringIndex = params.seriesIndex;
          if (typeof ringIndex !== 'number' || ringIndex < 0) return;
          const row = radialContextRef.current.normalizedSeries[ringIndex];
          if (!row) return;
          const event: RadialChartSelectEvent = {
            seriesIndex: ringIndex,
            dataIndex: 0,
            label: row.label ?? `Ring ${ringIndex + 1}`,
            value: row.value,
          };
          cb(event);
        };

        chart.on('click', handlePieClick);
      } catch (error) {
        console.warn('Radial chart initialization error:', error);
      }
    }
    return () => {
      detachRadialTooltip();
      if (chart) {
        try {
          chart.dispose();
        } catch (error) {
          console.warn('Radial chart disposal error:', error);
        }
      }
    };
  }, [option, width, height, attachRadialItemTooltipListeners]);

  return (
    <View style={{ width, height, position: 'relative' }}>
      <SkiaChart ref={chartRef} useRNGH gesture={scrollFriendlyGesture} />
      {renderRadialTooltipOverlay()}
    </View>
  );
};

const RadialChartComponent = withResponsiveContainer(withChartTheme(ChartComponent));
export const RadialChart = Object.assign(RadialChartComponent, {
  displayName: 'RadialChart',
});
