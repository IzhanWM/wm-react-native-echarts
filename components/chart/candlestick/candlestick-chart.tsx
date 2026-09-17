import { withResponsiveContainer } from '../chart-container';
import { useChartTheme, withChartTheme } from '../chart-theme.context';
import type { CandlestickChartProps, CandlestickData } from './candlestick-chart.props';
import { SkiaChart, SkiaRenderer } from '@wuba/react-native-echarts';
import { scrollFriendlyGesture } from '../gesture';
import { BarChart, CandlestickChart as EChartsCandlestickChart, LineChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import React, { useEffect, useMemo, useRef } from 'react';
import type { CartesianChartSelectEvent } from '../props/cartesian';
import { valueAxisBoundsFromProps, categoryAxisBoundsFromProps } from '../axis';
import { echartsLegendLayoutFragment } from '../legend/echarts-legend-layout';

export type { CandlestickChartProps, CandlestickData, CandlestickItem } from './candlestick-chart.props';

echarts.use([
  TooltipComponent,
  GridComponent,
  LegendComponent,
  SkiaRenderer,
  EChartsCandlestickChart,
  BarChart,
  LineChart,
]);

const ChartComponent = ({
  data,
  xAxisData,
  volumeData,
  ma5,
  ma10,
  ma20,
  width = 220,
  height = 350,
  boundaryGap = true,
  showXAxis = true,
  showXAxisTicks = true,
  showYAxis = true,
  showYAxisTicks = true,
  showXAxisSplitLines = true,
  showYAxisSplitLines = true,
  grid,
  showLegend = true,
  legendPosition = 'bottom',
  showHighlighter = true,
  positiveColor = '#008000',
  negativeColor = '#FF2C2C',
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
  ...props
}: CandlestickChartProps) => {
  const { theme } = useChartTheme(props.theme, undefined);
  const chartRef = useRef<any>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const selectContextRef = useRef<{
    categories: (string | number)[];
    ohlcData: CandlestickData;
  }>({ categories: [], ohlcData: [] });

  const categories = useMemo(() => {
    if (xAxisData?.length) return xAxisData.map(String);
    return data.map((_, i) => String(i));
  }, [xAxisData, data]);

  const hasVolume = volumeData != null && volumeData.length > 0;
  const hasMA = (ma5?.length ?? 0) > 0 || (ma10?.length ?? 0) > 0 || (ma20?.length ?? 0) > 0;

  selectContextRef.current = { categories, ohlcData: data };

  const option = useMemo(() => {
    if (!data?.length) return { series: [] };

    const valueAxisBounds = valueAxisBoundsFromProps({ minY, maxY, intervalY });
    const categoryAxisBounds = categoryAxisBoundsFromProps({ minX, maxX, intervalX });

    const tooltipConfig: any = showHighlighter
      ? {
          trigger: 'axis',
          axisPointer: { type: 'cross' },
        }
      : { trigger: 'axis' };

    const volumeColorUp = positiveColor + '40';
    const volumeColorDown = negativeColor + '40';

    const mainGrid: any = hasVolume
      ? { left: '10%', right: '8%', top: '8%', height: '55%' }
      : grid ?? { left: '10%', right: '8%', top: '8%', bottom: '15%' };
    const volumeGrid: any = hasVolume
      ? { left: '10%', right: '8%', top: '72%', height: '18%' }
      : undefined;

    if (showLegend && hasMA) {
      if (legendPosition === 'left') {
        mainGrid.left = '30%';
        if (volumeGrid) volumeGrid.left = '30%';
      } else if (legendPosition === 'right') {
        mainGrid.right = '30%';
        if (volumeGrid) volumeGrid.right = '30%';
      } else if (legendPosition === 'top') {
        mainGrid.top = hasVolume ? '18%' : '14%';
      } else if (legendPosition === 'bottom' && !hasVolume) {
        mainGrid.bottom = '24%';
      }
    }

    const xAxisMain: any = {
      type: 'category',
      data: categories,
      boundaryGap,
      ...(xAxisLabel != null && xAxisLabel !== '' && {
        name: xAxisLabel,
        nameLocation: 'middle',
        nameGap: xAxisNameGap ?? 25,
        nameTextStyle: { color: theme.axis.x.tickLabelColor },
      }),
      axisLabel: {
        show: showXAxis || xAxisTickLabelFormatter != null,
        color: theme.axis.x.tickLabelColor,
        formatter: xAxisTickLabelFormatter ?? undefined,
        ...(categoryAxisBounds?.axisLabelInterval !== undefined
          ? { interval: categoryAxisBounds.axisLabelInterval }
          : {}),
      },
      axisLine: showXAxis
        ? { show: true, lineStyle: { color: theme.axis.x.lineColor, width: theme.axis.x.lineWidth } }
        : { show: false },
      axisTick: {
        show: showXAxis && showXAxisTicks,
        lineStyle: { color: theme.axis.x.tickColor, width: theme.axis.x.tickWidth },
      },
      splitLine: {
        show: showXAxisSplitLines,
        lineStyle: { color: theme.axis.x.splitLineColor, width: theme.axis.x.splitLineWidth },
      },
      ...(categoryAxisBounds?.min !== undefined && { min: categoryAxisBounds.min }),
      ...(categoryAxisBounds?.max !== undefined && { max: categoryAxisBounds.max }),
    };
    if (hasVolume) {
      xAxisMain.gridIndex = 0;
      xAxisMain.axisLabel = { ...xAxisMain.axisLabel, show: false };
    }

    const yAxisMain: any = {
      type: 'value',
      ...(valueAxisBounds ?? { scale: true }),
      ...(yAxisLabel != null && yAxisLabel !== '' && {
        name: yAxisLabel,
        nameLocation: 'middle',
        nameGap: yAxisNameGap ?? 40,
        nameTextStyle: { color: theme.axis.y.tickLabelColor },
      }),
      axisLabel: {
        show: showYAxis || yAxisTickLabelFormatter != null,
        color: theme.axis.y.tickLabelColor,
        formatter: yAxisTickLabelFormatter ?? undefined,
      },
      axisLine: showYAxis
        ? { show: true, lineStyle: { color: theme.axis.y.lineColor, width: theme.axis.y.lineWidth } }
        : { show: false },
      axisTick: {
        show: showYAxis && showYAxisTicks,
        lineStyle: { color: theme.axis.y.tickColor, width: theme.axis.y.tickWidth },
      },
      splitLine: {
        show: showYAxisSplitLines,
        lineStyle: { color: theme.axis.y.splitLineColor, width: theme.axis.y.splitLineWidth },
      },
    };
    if (hasVolume) yAxisMain.gridIndex = 0;

    const candlestickSeries: any = {
      type: 'candlestick',
      data,
      itemStyle: {
        color: positiveColor,
        color0: negativeColor,
        borderColor: positiveColor,
        borderColor0: negativeColor,
      },
      emphasis: showHighlighter ? { focus: 'self' } : { focus: 'none' },
    };
    if (hasVolume) {
      candlestickSeries.xAxisIndex = 0;
      candlestickSeries.yAxisIndex = 0;
    }

    const series: any[] = [candlestickSeries];

    if (ma5?.length) {
      series.push({
        type: 'line',
        name: 'MA5',
        data: ma5,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: theme.series[2]?.color ?? '#ff9800' },
        xAxisIndex: hasVolume ? 0 : undefined,
        yAxisIndex: hasVolume ? 0 : undefined,
      });
    }
    if (ma10?.length) {
      series.push({
        type: 'line',
        name: 'MA10',
        data: ma10,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: theme.series[3]?.color ?? '#2196f3' },
        xAxisIndex: hasVolume ? 0 : undefined,
        yAxisIndex: hasVolume ? 0 : undefined,
      });
    }
    if (ma20?.length) {
      series.push({
        type: 'line',
        name: 'MA20',
        data: ma20,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: theme.series[4]?.color ?? '#9c27b0' },
        xAxisIndex: hasVolume ? 0 : undefined,
        yAxisIndex: hasVolume ? 0 : undefined,
      });
    }

    const config: any = {
      tooltip: tooltipConfig,
      grid: hasVolume ? [mainGrid, volumeGrid] : mainGrid,
      xAxis: hasVolume ? [xAxisMain, { ...xAxisMain, gridIndex: 1, axisLabel: { ...xAxisMain.axisLabel, show: true } }] : xAxisMain,
      yAxis: hasVolume
        ? [
            yAxisMain,
            {
              type: 'value',
              gridIndex: 1,
              axisLabel: { show: true, color: theme.axis.y.tickLabelColor },
              axisLine: { show: false },
              axisTick: { show: false },
              splitLine: { show: showYAxisSplitLines, lineStyle: { color: theme.axis.y.splitLineColor } },
            },
          ]
        : yAxisMain,
      series,
    };

    if (hasVolume) {
      const volumeBarData = volumeData!.map((v, i) => {
        const ohlc = data[i];
        const isUp = ohlc && ohlc[1] >= ohlc[0];
        return { value: v, itemStyle: { color: isUp ? volumeColorUp : volumeColorDown } };
      });
      series.push({
        type: 'bar',
        name: 'Volume',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: volumeBarData,
        emphasis: showHighlighter ? { focus: 'self' } : { focus: 'none' },
      });
    }

    if (showLegend && hasMA) {
      config.legend = {
        data: ['MA5', 'MA10', 'MA20'].filter((name) => {
          if (name === 'MA5') return ma5?.length;
          if (name === 'MA10') return ma10?.length;
          return ma20?.length;
        }),
        ...echartsLegendLayoutFragment(legendPosition),
        textStyle: { color: theme.legend.textColor, fontSize: theme.legend.fontSize },
        backgroundColor: theme.legend.backgroundColor,
      };
    }

    return config;
  }, [
    data,
    categories,
    volumeData,
    ma5,
    ma10,
    ma20,
    hasVolume,
    hasMA,
    theme,
    boundaryGap,
    showXAxis,
    showXAxisTicks,
    showYAxis,
    showYAxisTicks,
    showXAxisSplitLines,
    showYAxisSplitLines,
    grid,
    showLegend,
    legendPosition,
    hasMA,
    showHighlighter,
    positiveColor,
    negativeColor,
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
  ]);

  useEffect(() => {
    let chart: any;
    if (chartRef.current) {
      try {
        chart = echarts.init(chartRef.current, 'light', { width, height });
        chart.setOption(option);

        const handleSeriesClick = (params: {
          componentType?: string;
          seriesType?: string;
          seriesIndex?: number;
          dataIndex?: number;
        }) => {
          const cb = onSelectRef.current;
          if (typeof cb !== 'function') return;
          if (params.componentType !== 'series') return;
          if (params.seriesType !== 'candlestick') return;
          const dataIndex = params.dataIndex;
          if (typeof dataIndex !== 'number' || dataIndex < 0) return;
          const { categories: cats, ohlcData } = selectContextRef.current;
          const row = ohlcData[dataIndex];
          if (!row || row.length < 4) return;
          const [open, close, low, high] = row;
          const x = cats[dataIndex] ?? dataIndex;
          const event: CartesianChartSelectEvent = {
            seriesIndex: params.seriesIndex ?? 0,
            dataIndex,
            seriesName: 'Candlestick',
            x,
            y: close,
            ohlc: { open, close, low, high },
          };
          cb(event);
        };

        chart.on('click', handleSeriesClick);
      } catch (error) {
        console.warn('Candlestick chart initialization error:', error);
      }
    }
    return () => {
      if (chart) {
        try {
          chart.dispose();
        } catch (error) {
          console.warn('Candlestick chart disposal error:', error);
        }
      }
    };
  }, [option, width, height]);

  return <SkiaChart ref={chartRef} useRNGH gesture={scrollFriendlyGesture} />;
};

const CandlestickChartComponent = withResponsiveContainer(withChartTheme(ChartComponent));
export const CandlestickChart = Object.assign(CandlestickChartComponent, {
  displayName: 'CandlestickChart',
});
