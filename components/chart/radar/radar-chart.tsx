import { withResponsiveContainer } from '../chart-container';
import { useChartTheme, withChartTheme } from '../chart-theme.context';
import { axisTooltipShowContentFlag } from '../cartesian/tooltip';
import type {
  RadarChartProps,
  RadarChartSelectEvent,
  RadarIndicator,
  RadarSeriesData,
} from './radar-chart.props';
import {
  echartsLegendLayoutFragment,
  radarGeometryForLegend,
} from '../legend/echarts-legend-layout';
import { createRadarTooltipPreset, useRadarItemTooltip } from './tooltip';
import type { RadarItemTooltipContext } from './tooltip/radar-item-tooltip.types';
import { SkiaChart, SkiaRenderer } from '@wuba/react-native-echarts';
import { scrollFriendlyGesture } from '../gesture';
import { RadarChart as EChartsRadarChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import React, { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';

export type {
  RadarChartProps,
  RadarChartSelectEvent,
  RadarIndicator,
  RadarSeriesData,
} from './radar-chart.props';

echarts.use([
  TooltipComponent,
  GridComponent,
  LegendComponent,
  SkiaRenderer,
  EChartsRadarChart,
]);

function normalizeRadarSeries(data: RadarSeriesData, indicatorCount: number): Array<{ name: string; value: number[] }> {
  if (!Array.isArray(data) || data.length === 0) return [];
  const first = data[0];
  if (typeof first === 'number') {
    const values = data as number[];
    if (values.length !== indicatorCount) return [];
    return [{ name: 'Series 1', value: values }];
  }
  return (data as Array<{ name?: string; value: number[] }>).map((item, index) => ({
    name: item.name ?? `Series ${index + 1}`,
    value: item.value,
  }));
}

const ChartComponent = ({
  indicators,
  data,
  width = 220,
  height = 350,
  symbol = 'none',
  symbolSize,
  showLegend = true,
  legendPosition = 'bottom',
  showHighlighter = true,
  showIndicatorLabels = true,
  showSplitLine = true,
  showAxisLine = true,
  tooltip = 'card',
  renderTooltip,
  onSelect,
  ...props
}: RadarChartProps) => {
  const { theme } = useChartTheme(props.theme, props.colors);
  const chartRef = useRef<any>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const radarContextRef = useRef<RadarItemTooltipContext>({
    indicators: [],
    normalizedSeries: [],
  });
  const themeSeriesRef = useRef(theme.series);
  themeSeriesRef.current = theme.series;

  const tooltipOverlayActive = renderTooltip != null || tooltip !== 'none';

  const renderTooltipFn = useMemo(() => {
    if (renderTooltip != null) return renderTooltip;
    if (tooltip === 'none') return () => null;
    return createRadarTooltipPreset(tooltip);
  }, [renderTooltip, tooltip]);

  const { attachRadarItemTooltipListeners, renderRadarTooltipOverlay } = useRadarItemTooltip({
    active: tooltipOverlayActive,
    renderTooltip: renderTooltipFn,
    contextRef: radarContextRef,
    themeSeriesRef,
    width,
    height,
  });

  const normalizedSeries = useMemo(() => {
    const count = indicators?.length ?? 0;
    return normalizeRadarSeries(data, count);
  }, [data, indicators?.length]);

  radarContextRef.current = {
    indicators: (indicators ?? []).map((ind) => ({ name: ind.name })),
    normalizedSeries,
  };

  const indicatorMax = useMemo(() => {
    if (!indicators?.length) return [];
    return indicators.map((ind, i) => {
      if (ind.max != null) return ind.max;
      let max = 0;
      normalizedSeries.forEach(s => {
        const v = s.value[i];
        if (typeof v === 'number' && v > max) max = v;
      });
      return max > 0 ? Math.ceil(max * 1.1) : 100;
    });
  }, [indicators, normalizedSeries]);

  const option = useMemo(() => {
    if (!indicators?.length) return { series: [] };
    const radarAxis = theme.axis.r;
    const gridStyle = theme.grid.r;

    const hasRadarLegend = showLegend && normalizedSeries.some((s) => s.name);

    const radarConfig: any = {
      ...radarGeometryForLegend(legendPosition, showLegend, hasRadarLegend),
      indicator: indicators.map((ind, i) => ({
        name: ind.name,
        max: indicatorMax[i] ?? ind.max ?? 100,
      })),
      axisName: {
        show: showIndicatorLabels,
        color: radarAxis.tickLabelColor,
      },
      axisLine: showAxisLine
        ? {
            lineStyle: {
              color: radarAxis.lineColor,
              width: radarAxis.lineWidth,
            },
          }
        : { show: false },
      splitLine: showSplitLine
        ? {
            lineStyle: {
              color: gridStyle.lineColor,
              width: gridStyle.lineWidth,
            },
          }
        : { show: false },
      splitArea: {
        show: false,
      },
    };

    const radarDataItems = normalizedSeries.map(s => ({ value: s.value, name: s.name }));
    const seriesConfig: any = {
      type: 'radar',
      data: radarDataItems.map((item, index) => {
        const seriesColor = theme.series[index % theme.series.length].color;
        const seriesLineWidth = theme.series[index]?.lineWidth ?? theme.series[0].lineWidth ?? 2;
        const areaOpacityHex = Math.round(0.25 * 255).toString(16).padStart(2, '0');
        const areaColor = seriesColor + areaOpacityHex;
        return {
          value: item.value,
          name: item.name,
          symbol: symbol === 'none' ? 'circle' : symbol,
          symbolSize: symbol === 'none' ? 0 : (symbolSize ?? 6),
          lineStyle: { color: seriesColor, width: seriesLineWidth },
          areaStyle: { color: areaColor },
          emphasis: showHighlighter
            ? {
                focus: 'none',
                lineStyle: { width: seriesLineWidth + 1 },
                areaStyle: { opacity: 0.8 },
              }
            : { focus: 'none' },
        };
      }),
    };

    const legendConfig =
      showLegend && normalizedSeries.some((s) => s.name)
        ? {
            data: normalizedSeries.map((s) => s.name),
            ...echartsLegendLayoutFragment(legendPosition),
            textStyle: {
              color: theme.legend.textColor,
              fontSize: theme.legend.fontSize,
            },
            backgroundColor: theme.legend.backgroundColor,
          }
        : undefined;

    const tooltipConfig: any = tooltipOverlayActive
      ? {
          trigger: 'item',
          ...axisTooltipShowContentFlag(true),
        }
      : { show: false };

    const config: any = {
      radar: radarConfig,
      series: [seriesConfig],
      tooltip: tooltipConfig,
    };
    if (legendConfig) config.legend = legendConfig;
    return config;
  }, [
    theme,
    indicators,
    indicatorMax,
    normalizedSeries,
    symbol,
    symbolSize,
    showLegend,
    legendPosition,
    showHighlighter,
    showIndicatorLabels,
    showSplitLine,
    showAxisLine,
    tooltipOverlayActive,
  ]);

  useEffect(() => {
    let chart: any;
    let detachRadarTooltip = () => {};
    if (chartRef.current) {
      try {
        chart = echarts.init(chartRef.current, 'light', {
          width,
          height,
        });
        chart.setOption(option);

        detachRadarTooltip = attachRadarItemTooltipListeners(chart);

        const handleRadarClick = (params: {
          componentType?: string;
          seriesType?: string;
          seriesIndex?: number;
          dataIndex?: number;
        }) => {
          const cb = onSelectRef.current;
          if (typeof cb !== 'function') return;
          if (params.componentType !== 'series') return;
          if (params.seriesType !== 'radar') return;
          const dataIndex = params.dataIndex;
          if (typeof dataIndex !== 'number' || dataIndex < 0) return;
          const row = radarContextRef.current.normalizedSeries[dataIndex];
          if (!row) return;
          const event: RadarChartSelectEvent = {
            seriesIndex: params.seriesIndex ?? 0,
            dataIndex,
            seriesName: row.name,
            value: [...row.value],
          };
          cb(event);
        };

        chart.on('click', handleRadarClick);
      } catch (error) {
        console.warn('Radar chart initialization error:', error);
      }
    }
    return () => {
      detachRadarTooltip();
      if (chart) {
        try {
          chart.dispose();
        } catch (error) {
          console.warn('Radar chart disposal error:', error);
        }
      }
    };
  }, [option, width, height, attachRadarItemTooltipListeners]);

  return (
    <View style={{ width, height, position: 'relative' }}>
      <SkiaChart ref={chartRef} useRNGH gesture={scrollFriendlyGesture} />
      {renderRadarTooltipOverlay()}
    </View>
  );
};

const RadarChartComponent = withResponsiveContainer(withChartTheme(ChartComponent));
export const RadarChart = Object.assign(RadarChartComponent, {
  displayName: 'RadarChart',
});
