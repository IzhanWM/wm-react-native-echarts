import { withResponsiveContainer } from '../chart-container';
import { useChartTheme, withChartTheme } from '../chart-theme.context';
import type { BubbleChartProps } from './bubble-chart.props';
import { SkiaChart, SkiaRenderer } from '@wuba/react-native-echarts';
import { scrollFriendlyGesture } from '../gesture';
import { ScatterChart as EChartsScatterChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import React, { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import type { CartesianChartSelectEvent } from '../props/cartesian';
import { valueAxisBoundsFromProps, xAxisBoundsFromProps } from '../axis';
import {
  echartsLegendLayoutFragment,
  mergeCartesianGridForLegend,
} from '../legend/echarts-legend-layout';
import { axisTooltipShowContentFlag } from '../cartesian/tooltip';
import { createScatterTooltipPreset, useScatterItemTooltip } from '../scatter/tooltip';
import type { ScatterItemTooltipContext } from '../scatter/tooltip/scatter-item-tooltip.types';

/** common -> cartesian -> scatter -> bubble */
export type { BubbleChartProps, BubbleSeriesData } from './bubble-chart.props';

echarts.use([
  TooltipComponent,
  GridComponent,
  LegendComponent,
  SkiaRenderer,
  EChartsScatterChart,
]);

function scaleSize(value: number, dataMin: number, dataMax: number, outMin: number, outMax: number): number {
  if (dataMax <= dataMin) return outMin;
  const t = (value - dataMin) / (dataMax - dataMin);
  return outMin + t * (outMax - outMin);
}

const DEFAULT_SIZE_RANGE: [number, number] = [8, 50];

const ChartComponent = ({
  data,
  width = 220,
  height = 350,
  symbol = 'circle',
  sizeRange = DEFAULT_SIZE_RANGE,
  showXAxis = true,
  showXAxisTicks = true,
  showYAxis = true,
  showYAxisTicks = true,
  showXAxisSplitLines = true,
  showYAxisSplitLines = true,
  boundaryGap = false,
  grid,
  showLegend = true,
  legendPosition = 'bottom',
  showHighlighter = true,
  tooltip = 'card',
  xAxisTickLabelFormatter,
  yAxisTickLabelFormatter,
  xAxisLabel,
  yAxisLabel,
  xAxisNameGap,
  yAxisNameGap,
  minX,
  maxX,
  intervalX,
  minY,
  maxY,
  intervalY,
  onSelect,
  renderTooltip,
  ...props
}: BubbleChartProps) => {
  const { theme } = useChartTheme(props.theme, props.colors);
  const chartRef = useRef<any>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const selectContextRef = useRef<ScatterItemTooltipContext>({ normalizedSeries: [] });
  const themeSeriesRef = useRef(theme.series);
  themeSeriesRef.current = theme.series;

  const tooltipOverlayActive = renderTooltip != null || tooltip !== 'none';

  const renderTooltipFn = useMemo(() => {
    if (renderTooltip != null) return renderTooltip;
    if (tooltip === 'none') return () => null;
    return createScatterTooltipPreset(tooltip);
  }, [renderTooltip, tooltip]);

  const { attachScatterItemTooltipListeners, renderScatterTooltipOverlay } = useScatterItemTooltip({
      active: tooltipOverlayActive,
      renderTooltip: renderTooltipFn,
      contextRef: selectContextRef,
      themeSeriesRef,
      width,
      height,
    });

  const normalizedSeries = useMemo((): Array<{ name?: string; data: [number, number, number][] }> => {
    if (!Array.isArray(data) || data.length === 0) return [];
    const first = data[0];
    if (Array.isArray(first) && first.length >= 2 && typeof first[0] === 'number') {
      const rows = data as (number[])[];
      const normalized = rows.map((row) => {
        const x = Number(row[0]);
        const y = Number(row[1]);
        const size = row.length >= 3 && typeof row[2] === 'number' ? Number(row[2]) : 10;
        return [x, y, size] as [number, number, number];
      });
      return [{ data: normalized }];
    }
    if (typeof first === 'object' && first !== null && 'data' in first) {
      return (data as Array<{ name: string; data: (number[])[] }>).map((s) => ({
        name: s.name,
        data: s.data.map((row) => {
          const x = Number(row[0]);
          const y = Number(row[1]);
          const size = row.length >= 3 && typeof row[2] === 'number' ? Number(row[2]) : 10;
          return [x, y, size] as [number, number, number];
        }),
      }));
    }
    return [];
  }, [data]);

  const hasNamedSeries = useMemo(
    () => normalizedSeries.some((s) => 'name' in s && s.name),
    [normalizedSeries]
  );

  selectContextRef.current = {
    normalizedSeries: normalizedSeries as ScatterItemTooltipContext['normalizedSeries'],
  };

  const valueAxisBounds = useMemo(
    () => valueAxisBoundsFromProps({ minY, maxY, intervalY }),
    [minY, maxY, intervalY]
  );

  const xAxisBounds = useMemo(
    () => xAxisBoundsFromProps({ minX, maxX, intervalX }),
    [minX, maxX, intervalX]
  );

  const option = useMemo(() => {
    const tooltipConfig: any = tooltipOverlayActive
      ? {
          trigger: 'item',
          ...axisTooltipShowContentFlag(true),
          ...(showHighlighter && {
            axisPointer: {
              type: 'line',
              lineStyle: {
                type: 'line',
                width: 1,
                color: '#00000000',
              },
              label: {
                show: false,
              },
            },
          }),
        }
      : { show: false };

    const xAxisConfig: any = {
      type: 'value',
      boundaryGap,
      ...(xAxisBounds ?? {}),
      ...(xAxisLabel != null && xAxisLabel !== '' && {
        name: xAxisLabel,
        nameLocation: 'middle',
        nameGap: xAxisNameGap ?? 25,
        nameTextStyle: { color: theme.axis.x.tickLabelColor },
      }),
      axisLabel: {
        show: showXAxis || xAxisTickLabelFormatter != null,
        color: theme.axis.x.tickLabelColor,
        ...(xAxisTickLabelFormatter && { formatter: xAxisTickLabelFormatter }),
      },
      axisLine: showXAxis
        ? {
            show: true,
            lineStyle: {
              color: theme.axis.x.lineColor,
              width: theme.axis.x.lineWidth,
            },
          }
        : { show: false },
      axisTick: {
        show: showXAxis && showXAxisTicks,
        lineStyle: {
          color: theme.axis.x.tickColor,
          width: theme.axis.x.tickWidth,
        },
      },
      splitLine: {
        show: showXAxisSplitLines,
        lineStyle: {
          color: theme.axis.x.splitLineColor,
          width: theme.axis.x.splitLineWidth,
        },
      },
    };

    const yAxisConfig: any = {
      type: 'value',
      ...(valueAxisBounds ?? {}),
      ...(yAxisLabel != null && yAxisLabel !== '' && {
        name: yAxisLabel,
        nameLocation: 'middle',
        nameGap: yAxisNameGap ?? 40,
        nameTextStyle: { color: theme.axis.y.tickLabelColor },
      }),
      axisLabel: {
        show: showYAxis || yAxisTickLabelFormatter != null,
        color: theme.axis.y.tickLabelColor,
        ...(yAxisTickLabelFormatter && { formatter: yAxisTickLabelFormatter }),
      },
      axisLine: showYAxis
        ? {
            show: true,
            lineStyle: {
              color: theme.axis.y.lineColor,
              width: theme.axis.y.lineWidth,
            },
          }
        : { show: false },
      axisTick: {
        show: showYAxis && showYAxisTicks,
        lineStyle: {
          color: theme.axis.y.tickColor,
          width: theme.axis.y.tickWidth,
        },
      },
      splitLine: {
        show: showYAxisSplitLines,
        lineStyle: {
          color: theme.axis.y.splitLineColor,
          width: theme.axis.y.splitLineWidth,
        },
      },
    };

    const legendConfig: any =
      showLegend && hasNamedSeries
        ? {
            data: normalizedSeries
              .filter((s) => 'name' in s && s.name)
              .map((s) => (s as { name: string }).name),
            ...echartsLegendLayoutFragment(legendPosition),
            textStyle: {
              color: theme.legend.textColor,
              fontSize: theme.legend.fontSize,
            },
            backgroundColor: theme.legend.backgroundColor,
          }
        : undefined;

    const [sizeMinPx, sizeMaxPx] = sizeRange;
    const seriesConfig: any[] = [];

    normalizedSeries.forEach((s, index) => {
      const seriesColor = theme.series[index % theme.series.length].color;
      const seriesData = 'data' in s ? s.data : [];
      const seriesName = 'name' in s && s.name ? s.name : undefined;

      const sizes = seriesData.map((d) => d[2]);
      const dataSizeMin = sizes.length ? Math.min(...sizes) : 0;
      const dataSizeMax = sizes.length ? Math.max(...sizes) : 10;

      const scatterSeries: any = {
        type: 'scatter',
        data: seriesData,
        symbol: symbol === 'none' ? 'circle' : symbol,
        symbolSize: (value: number, params: any) => {
          const d = params.data;
          const sizeVal = Array.isArray(d) && typeof d[2] === 'number' ? d[2] : 10;
          return scaleSize(sizeVal, dataSizeMin, dataSizeMax, sizeMinPx, sizeMaxPx);
        },
        itemStyle: { color: seriesColor },
        emphasis: showHighlighter
          ? {
              focus: 'none',
              scale: true,
              itemStyle: {
                color: seriesColor,
                borderColor: '#FFFFFF',
                borderWidth: 2,
              },
            }
          : { focus: 'none', scale: false },
      };
      if (seriesName) scatterSeries.name = seriesName;
      seriesConfig.push(scatterSeries);
    });

    const config: any = {
      tooltip: tooltipConfig,
      xAxis: xAxisConfig,
      yAxis: yAxisConfig,
      series: seriesConfig,
    };
    if (legendConfig) config.legend = legendConfig;
    const mergedGrid = mergeCartesianGridForLegend(
      grid,
      legendPosition,
      showLegend,
      hasNamedSeries
    );
    if (mergedGrid !== undefined && Object.keys(mergedGrid).length > 0) {
      config.grid = mergedGrid;
    }
    return config;
  }, [
    theme,
    normalizedSeries,
    symbol,
    sizeRange,
    showXAxis,
    showXAxisTicks,
    showYAxis,
    showYAxisTicks,
    showXAxisSplitLines,
    showYAxisSplitLines,
    boundaryGap,
    grid,
    showLegend,
    legendPosition,
    hasNamedSeries,
    showHighlighter,
    tooltipOverlayActive,
    xAxisTickLabelFormatter,
    yAxisTickLabelFormatter,
    xAxisLabel,
    yAxisLabel,
    xAxisNameGap,
    yAxisNameGap,
    valueAxisBounds,
    xAxisBounds,
  ]);

  useEffect(() => {
    let chart: any;
    let detachScatterTooltip = () => {};
    if (chartRef.current) {
      try {
        chart = echarts.init(chartRef.current, 'light', { width, height });
        chart.setOption(option);

        detachScatterTooltip = attachScatterItemTooltipListeners(chart);

        const handleSeriesClick = (params: {
          componentType?: string;
          seriesType?: string;
          seriesIndex?: number;
          dataIndex?: number;
        }) => {
          const cb = onSelectRef.current;
          if (typeof cb !== 'function') return;
          if (params.componentType !== 'series') return;
          if (params.seriesType !== 'scatter') return;
          const seriesIndex = params.seriesIndex;
          const dataIndex = params.dataIndex;
          if (
            typeof seriesIndex !== 'number' ||
            typeof dataIndex !== 'number' ||
            dataIndex < 0
          ) {
            return;
          }
          const { normalizedSeries: ns } = selectContextRef.current;
          const s = ns[seriesIndex];
          if (!s?.data || !Array.isArray(s.data)) return;
          const point = s.data[dataIndex];
          if (!point || point.length < 2) return;
          const seriesName =
            s.name != null && s.name !== ''
              ? String(s.name)
              : `Series ${seriesIndex + 1}`;
          const event: CartesianChartSelectEvent = {
            seriesIndex,
            dataIndex,
            seriesName,
            x: point[0],
            y: Number(point[1]),
            ...(typeof point[2] === 'number' ? { z: point[2] } : {}),
          };
          cb(event);
        };

        chart.on('click', handleSeriesClick);
      } catch (error) {
        console.warn('Chart initialization error:', error);
      }
    }
    return () => {
      detachScatterTooltip();
      if (chart) {
        try {
          chart.dispose();
        } catch (error) {
          console.warn('Chart disposal error:', error);
        }
      }
    };
  }, [option, width, height, attachScatterItemTooltipListeners]);

  return (
    <View style={{ width, height, position: 'relative' }}>
      <SkiaChart ref={chartRef} useRNGH gesture={scrollFriendlyGesture} />
      {renderScatterTooltipOverlay()}
    </View>
  );
};

const BubbleChartComponent = withResponsiveContainer(withChartTheme(ChartComponent));
export const BubbleChart = Object.assign(BubbleChartComponent, {
  displayName: 'BubbleChart',
});
