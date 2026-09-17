import { withResponsiveContainer } from '../chart-container';
import { useChartTheme, withChartTheme } from '../chart-theme.context';
import type { ScatterChartProps } from './scatter-chart.props';
import { SkiaChart, SkiaRenderer } from '@wuba/react-native-echarts';
import { scrollFriendlyGesture } from '../gesture';
import { LineChart as EChartsLineChart, ScatterChart as EChartsScatterChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import React, { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { getAxis, valueAxisBoundsFromProps, categoryAxisBoundsFromProps } from '../axis';
import {
  echartsLegendLayoutFragment,
  mergeCartesianGridForLegend,
} from '../legend/echarts-legend-layout';
import { axisTooltipShowContentFlag } from '../cartesian/tooltip';
import type { CartesianChartSelectEvent } from '../props/cartesian';
import { createScatterTooltipPreset, useScatterItemTooltip } from './tooltip';
import type { ScatterItemTooltipContext } from './tooltip/scatter-item-tooltip.types';

/** common -> cartesian -> scatter */
export type { ScatterChartProps, ScatterSeriesData } from './scatter-chart.props';

echarts.use([
  TooltipComponent,
  GridComponent,
  LegendComponent,
  SkiaRenderer,
  EChartsScatterChart,
  EChartsLineChart,
]);

/** Linear regression: returns [slope, intercept] for y = slope * x + intercept. */
function linearRegression(points: number[][]): { slope: number; intercept: number } {
  const n = points.length;
  if (n === 0) return { slope: 0, intercept: 0 };
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (const [x, y] of points) {
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }
  const denom = n * sumX2 - sumX * sumX;
  const slope = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

const ChartComponent = ({
  data,
  width = 220,
  height = 350,
  symbol = 'circle',
  symbolSize = 8,
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
  showRegressionLine = false,
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
}: ScatterChartProps) => {
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

  const normalizedSeries = useMemo((): Array<{ name?: string; data: number[][] }> => {
    if (!Array.isArray(data) || data.length === 0) return [];
    const first = data[0];
    if (Array.isArray(first) && first.length >= 2 && typeof first[0] === 'number') {
      return [{ data: data as number[][] }];
    }
    if (typeof first === 'object' && first !== null && 'data' in first) {
      return data as Array<{ name: string; data: number[][] }>;
    }
    return [];
  }, [data]);

  const hasNamedSeries = useMemo(
    () => normalizedSeries.some((s) => 'name' in s && s.name),
    [normalizedSeries]
  );

  selectContextRef.current = { normalizedSeries };

  const valueAxisBounds = useMemo(
    () => valueAxisBoundsFromProps({ minY, maxY, intervalY }),
    [minY, maxY, intervalY]
  );

  const categoryAxisBounds = useMemo(
    () => categoryAxisBoundsFromProps({ minX, maxX, intervalX }),
    [minX, maxX, intervalX]
  );

  const option = useMemo(() => {
    const dataPoints = normalizedSeries.map(s => s.data.map(item => item[0] as number)).flat();
    const xAxisData = getAxis(dataPoints).map(String);
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

    // X: category from binned coordinates; Y: value (data is [x, y] pairs)
    const xAxisConfig: any = {
      type: 'category',
      boundaryGap,
      data: xAxisData,
      ...(categoryAxisBounds?.min !== undefined && { min: categoryAxisBounds.min }),
      ...(categoryAxisBounds?.max !== undefined && { max: categoryAxisBounds.max }),
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
        ...(categoryAxisBounds?.axisLabelInterval !== undefined
          ? { interval: categoryAxisBounds.axisLabelInterval }
          : {}),
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

    const seriesConfig: any[] = [];
    normalizedSeries.forEach((s, index) => {
      const seriesColor = theme.series[index % theme.series.length].color;
      const seriesData = 'data' in s ? s.data : [];
      const seriesName = 'name' in s && s.name ? s.name : undefined;

      const scatterSeries: any = {
        type: 'scatter',
        data: seriesData,
        symbol: symbol === 'none' ? 'circle' : symbol,
        symbolSize: symbol === 'none' ? 8 : symbolSize,
        itemStyle: { color: seriesColor },
        emphasis: showHighlighter
          ? {
              focus: 'none',
              scale: true,
              symbol: 'circle',
              symbolSize: 8,
              itemStyle: {
                color: seriesColor,
                borderColor: '#FFFFFF',
                borderWidth: 2,
              },
            }
          : { focus: 'none', scale: false, symbolSize: 0 },
      };
      if (seriesName) scatterSeries.name = seriesName;
      seriesConfig.push(scatterSeries);

      if (showRegressionLine && seriesData.length >= 2) {
        const { slope, intercept } = linearRegression(seriesData);
        const xs = seriesData.map((p) => p[0]);
        const xMin = Math.min(...xs);
        const xMax = Math.max(...xs);
        const regressionData: number[][] = [
          [xMin, slope * xMin + intercept],
          [xMax, slope * xMax + intercept],
        ];
        const lineSeries: any = {
          type: 'line',
          data: regressionData,
          symbol: 'none',
          lineStyle: {
            color: seriesColor,
            width: 2,
            type: 'solid',
          },
          showSymbol: false,
        };
        if (seriesName) lineSeries.name = seriesName;
        seriesConfig.push(lineSeries);
      }
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
    symbolSize,
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
    showRegressionLine,
    xAxisTickLabelFormatter,
    yAxisTickLabelFormatter,
    xAxisLabel,
    yAxisLabel,
    xAxisNameGap,
    yAxisNameGap,
    valueAxisBounds,
    categoryAxisBounds,
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

const ScatterChartComponent = withResponsiveContainer(withChartTheme(ChartComponent));
export const ScatterChart = Object.assign(ScatterChartComponent, {
  displayName: 'ScatterChart',
});
