import { withResponsiveContainer } from '../chart-container';
import { useChartTheme, withChartTheme } from '../chart-theme.context';
import type { HeatmapChartProps, HeatmapChartSelectEvent } from './heatmap-chart.props';
import { SkiaChart, SkiaRenderer } from '@wuba/react-native-echarts';
import { scrollFriendlyGesture } from '../gesture';
import { HeatmapChart as EChartsHeatmapChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  VisualMapComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import React, { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { axisTooltipShowContentFlag } from '../cartesian/tooltip';
import { createHeatmapTooltipPreset, useHeatmapItemTooltip } from './tooltip';
import type { HeatmapItemTooltipContext } from './tooltip/heatmap-item-tooltip.types';

/** common -> heatmap */
export type {
  HeatmapChartProps,
  HeatmapDataPoint,
  HeatmapChartSelectEvent,
} from './heatmap-chart.props';

echarts.use([
  TooltipComponent,
  GridComponent,
  VisualMapComponent,
  SkiaRenderer,
  EChartsHeatmapChart,
]);

const SERIES_NAME = 'Heatmap';

const ChartComponent = ({
  xAxisData,
  yAxisData,
  data,
  width = 320,
  height = 300,
  showLabel = false,
  labelFormatter,
  showXAxis = true,
  showYAxis = true,
  showHighlighter = true,
  tooltip = 'card',
  onSelect,
  renderTooltip,
  ...props
}: HeatmapChartProps) => {
  const { theme } = useChartTheme(props.theme, props.colors);
  const chartRef = useRef<any>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const selectContextRef = useRef<HeatmapItemTooltipContext>({
    xAxisData: [],
    yAxisData: [],
    data: [],
    seriesName: SERIES_NAME,
  });
  const themeSeriesRef = useRef(theme.series);
  themeSeriesRef.current = theme.series;

  const tooltipOverlayActive = renderTooltip != null || tooltip !== 'none';

  const renderTooltipFn = useMemo(() => {
    if (renderTooltip != null) return renderTooltip;
    if (tooltip === 'none') return () => null;
    return createHeatmapTooltipPreset(tooltip);
  }, [renderTooltip, tooltip]);

  const { attachHeatmapItemTooltipListeners, renderHeatmapTooltipOverlay } = useHeatmapItemTooltip({
    active: tooltipOverlayActive,
    renderTooltip: renderTooltipFn,
    contextRef: selectContextRef,
    themeSeriesRef,
    width,
    height,
  });

  const normalizedData = useMemo((): Array<[number, number, number]> => {
    if (!Array.isArray(data)) return [];
    return data.filter(
      (row): row is [number, number, number] =>
        Array.isArray(row) &&
        row.length >= 3 &&
        Number.isFinite(Number(row[0])) &&
        Number.isFinite(Number(row[1])) &&
        Number.isFinite(Number(row[2]))
    );
  }, [data]);

  selectContextRef.current = {
    xAxisData: xAxisData ?? [],
    yAxisData: yAxisData ?? [],
    data: normalizedData,
    seriesName: SERIES_NAME,
  };

  const valueRange = useMemo(() => {
    if (normalizedData.length === 0) return { min: 0, max: 10 };
    const values = normalizedData.map((d) => Number(d[2]));
    const min = Math.min(...values);
    const max = Math.max(...values);
    return { min: min === max ? min - 1 : min, max: min === max ? max + 1 : max };
  }, [normalizedData]);

  const option = useMemo(() => {
    const seriesColor = theme.series[0]?.color ?? '#3b82f6';

    const tooltipConfig: any = tooltipOverlayActive
      ? {
          trigger: 'item',
          ...axisTooltipShowContentFlag(true),
        }
      : { show: false };

    const xAxisConfig: any = {
      type: 'category',
      data: xAxisData,
      splitArea: { show: true },
      axisLabel: {
        show: showXAxis,
        color: theme.axis.x.tickLabelColor,
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
      axisTick: { show: showXAxis },
      splitLine: { show: false },
    };

    const yAxisConfig: any = {
      type: 'category',
      data: yAxisData,
      splitArea: { show: true },
      axisLabel: {
        show: showYAxis,
        color: theme.axis.y.tickLabelColor,
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
      axisTick: { show: showYAxis },
      splitLine: { show: false },
    };

    const grid = {
      top: '8%',
      left: '12%',
      right: '4%',
      bottom: '8%',
      containLabel: true,
    };

    const seriesConfig: any = {
      name: SERIES_NAME,
      type: 'heatmap',
      data: normalizedData,
      label: {
        show: showLabel,
        color: theme.legend.textColor,
        ...(labelFormatter ? { formatter: labelFormatter } : {}),
      },
      emphasis: showHighlighter
        ? {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.35)',
            },
          }
        : { disabled: true },
    };

    const config: any = {
      tooltip: tooltipConfig,
      grid,
      xAxis: xAxisConfig,
      yAxis: yAxisConfig,
      series: [seriesConfig],
    };
    config.visualMap = {
      type: 'continuous',
      min: valueRange.min,
      max: valueRange.max,
      show: false,
      inRange: {
        color: [theme.series[1]?.color ?? '#93c5fd', seriesColor],
      },
    };
    return config;
  }, [
    xAxisData,
    yAxisData,
    normalizedData,
    theme,
    showLabel,
    labelFormatter,
    showXAxis,
    showYAxis,
    showHighlighter,
    tooltipOverlayActive,
    valueRange,
  ]);

  useEffect(() => {
    let chart: any;
    let detachHeatmapTooltip = () => {};
    if (chartRef.current) {
      try {
        chart = echarts.init(chartRef.current, 'light', { width, height });
        chart.setOption(option);

        detachHeatmapTooltip = attachHeatmapItemTooltipListeners(chart);

        const handleHeatmapClick = (params: {
          componentType?: string;
          seriesType?: string;
          data?: [number, number, number] | { value?: [number, number, number] };
          value?: [number, number, number];
        }) => {
          const cb = onSelectRef.current;
          if (typeof cb !== 'function') return;
          if (params.componentType !== 'series') return;
          if (params.seriesType !== 'heatmap') return;
          const raw =
            (Array.isArray(params.data) ? params.data : params.data?.value) ??
            (Array.isArray(params.value) ? params.value : undefined);
          if (!raw || raw.length < 3) return;
          const xIndex = Number(raw[0]);
          const yIndex = Number(raw[1]);
          const value = Number(raw[2]);
          if (!Number.isFinite(xIndex) || !Number.isFinite(yIndex) || !Number.isFinite(value)) return;
          const event: HeatmapChartSelectEvent = {
            xIndex,
            yIndex,
            xLabel: xAxisData[xIndex] ?? String(xIndex),
            yLabel: yAxisData[yIndex] ?? String(yIndex),
            value,
          };
          cb(event);
        };

        chart.on('click', handleHeatmapClick);
      } catch (error) {
        console.warn('HeatmapChart initialization error:', error);
      }
    }
    return () => {
      detachHeatmapTooltip();
      if (chart) {
        try {
          chart.dispose();
        } catch (error) {
          console.warn('HeatmapChart disposal error:', error);
        }
      }
    };
  }, [option, width, height, attachHeatmapItemTooltipListeners, xAxisData, yAxisData]);

  return (
    <View style={{ width, height, position: 'relative' }}>
      <SkiaChart ref={chartRef} useRNGH gesture={scrollFriendlyGesture} />
      {renderHeatmapTooltipOverlay()}
    </View>
  );
};

const HeatmapChartComponent = withResponsiveContainer(withChartTheme(ChartComponent));
export const HeatmapChart = Object.assign(HeatmapChartComponent, {
  displayName: 'HeatmapChart',
});
