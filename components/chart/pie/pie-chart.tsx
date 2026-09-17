import { withResponsiveContainer } from '../chart-container';
import { useChartTheme, withChartTheme } from '../chart-theme.context';
import { axisTooltipShowContentFlag } from '../cartesian/tooltip';
import type {
  PieChartProps,
  PieChartSelectEvent,
  PieDataItem,
  PieRingData,
} from './pie-chart.props';
import { isConcentricPieData } from './pie-chart.props';
import { echartsLegendLayoutFragment, pieCenterForLegend } from '../legend/echarts-legend-layout';
import { createPieTooltipPreset, usePieItemTooltip } from './tooltip';
import type { PieItemTooltipContext } from './tooltip/pie-item-tooltip.types';
import { SkiaChart, SkiaRenderer } from '@wuba/react-native-echarts';
import { scrollFriendlyGesture } from '../gesture';
import { PieChart as EChartsPieChart } from 'echarts/charts';
import {
  LegendComponent,
  TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import React, { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';

// Re-export types
export type {
  PieChartProps,
  PieChartSelectEvent,
  PieDataItem,
  PieRingData,
  PieChartData,
} from './pie-chart.props';
export { isConcentricPieData } from './pie-chart.props';

echarts.use([
  TooltipComponent,
  LegendComponent,
  SkiaRenderer,
  EChartsPieChart,
]);

const ChartComponent = ({
  data,
  width = 220,
  height = 350,
  radius = '75%',
  showLegend = true,
  legendPosition = 'bottom',
  showLabel = true,
  labelPosition = 'outside',
  showLabelLine = true,
  labelFormatter,
  showHighlighter = true,
  tooltip = 'card',
  renderTooltip,
  onSelect,
  ...props
}: PieChartProps) => {
  const { theme } = useChartTheme(props.theme, props.colors);
  const chartRef = useRef<any>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const pieContextRef = useRef<PieItemTooltipContext>({ normalizedSeries: [] });
  const themeSeriesRef = useRef(theme.series);
  themeSeriesRef.current = theme.series;

  const tooltipOverlayActive = renderTooltip != null || tooltip !== 'none';

  const renderTooltipFn = useMemo(() => {
    if (renderTooltip != null) return renderTooltip;
    if (tooltip === 'none') return () => null;
    return createPieTooltipPreset(tooltip);
  }, [renderTooltip, tooltip]);

  const { attachPieItemTooltipListeners, renderPieTooltipOverlay } = usePieItemTooltip({
    active: tooltipOverlayActive,
    renderTooltip: renderTooltipFn,
    contextRef: pieContextRef,
    themeSeriesRef,
    width,
    height,
  });

  const normalizedSeries = useMemo((): PieItemTooltipContext['normalizedSeries'] => {
    if (!Array.isArray(data) || data.length === 0) return [];
    if (isConcentricPieData(data)) {
      const rings = data as PieRingData[];
      return rings.map((ring) => ({
        name: ring.name,
        data: ring.data.map((d) => ({ name: d.name, value: d.value })),
      }));
    }
    const flat = data as PieDataItem[];
    return [{ data: flat.map((d) => ({ name: d.name, value: d.value })) }];
  }, [data]);

  pieContextRef.current = { normalizedSeries };

  const option = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return { series: [] };
    }

    const seriesColors = theme.series.map(s => s.color);
    const labelStyle = {
      color: theme.legend.textColor,
      fontSize: theme.legend.fontSize,
    };

    const buildSeriesConfig = (
      pieData: Array<{ name: string; value: number; itemStyle?: { color?: string } }>,
      seriesRadius: number | string | (number | string)[],
      ringName?: string,
      seriesCenter?: [string, string]
    ): any => {
      const total = pieData.reduce((sum, d) => sum + d.value, 0);
      const defaultFormatter = (params: any) => {
        const pct = total > 0 ? ((params.value / total) * 100).toFixed(1) : '0';
        return `${params.name}\n${pct}%`;
      };
      const labelConfig: any = showLabel
        ? {
            show: true,
            position: labelPosition,
            formatter: labelFormatter ?? defaultFormatter,
            ...labelStyle,
          }
        : { show: false };

      return {
        type: 'pie',
        name: ringName,
        radius: Array.isArray(seriesRadius) ? seriesRadius : seriesRadius,
        ...(seriesCenter ? { center: seriesCenter } : {}),
        data: pieData,
        label: labelConfig,
        labelLine: {
          show: showLabel && (labelPosition === 'outside' ? showLabelLine : false),
          lineStyle: { color: theme.legend.textColor },
        },
        emphasis: showHighlighter
          ? {
              focus: 'none',
              scale: true,
              scaleSize: 5,
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.2)',
              },
            }
          : { disabled: true },
      };
    };

    if (isConcentricPieData(data)) {
      const rings = data as PieRingData[];
      const pieSeriesCenter = pieCenterForLegend(legendPosition, showLegend);
      let colorIndex = 0;
      const seriesConfigs = rings.map((ring) => {
        const pieData = ring.data.map((item) => ({
          name: item.name,
          value: item.value,
          itemStyle: item.itemStyle?.color
            ? { color: item.itemStyle.color }
            : { color: seriesColors[colorIndex++ % seriesColors.length] },
        }));
        return buildSeriesConfig(pieData, ring.radius, ring.name, pieSeriesCenter);
      });

      const legendData = showLegend
        ? Array.from(
            new Set(rings.flatMap((r) => r.data.map((d) => d.name)))
          )
        : undefined;

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
      if (legendData?.length) {
        config.legend = {
          data: legendData,
          ...echartsLegendLayoutFragment(legendPosition),
          textStyle: labelStyle,
          backgroundColor: theme.legend.backgroundColor,
        };
      }
      return config;
    }

    const flatData = data as PieDataItem[];
    const pieData = flatData.map((item, index) => ({
      name: item.name,
      value: item.value,
      itemStyle: item.itemStyle?.color
        ? { color: item.itemStyle.color }
        : { color: seriesColors[index % seriesColors.length] },
    }));

    const pieSeriesCenter = pieCenterForLegend(legendPosition, showLegend);
    const seriesConfig = buildSeriesConfig(pieData, radius, undefined, pieSeriesCenter);

    const tooltipConfig: any = tooltipOverlayActive
      ? {
          trigger: 'item',
          ...axisTooltipShowContentFlag(true),
        }
      : { show: false };

    const legendConfig = showLegend
      ? {
          data: pieData.map((d) => d.name),
          ...echartsLegendLayoutFragment(legendPosition),
          textStyle: labelStyle,
          backgroundColor: theme.legend.backgroundColor,
        }
      : undefined;

    const config: any = {
      tooltip: tooltipConfig,
      series: [seriesConfig],
    };
    if (legendConfig) {
      config.legend = legendConfig;
    }
    return config;
  }, [
    data,
    radius,
    showLegend,
    legendPosition,
    showLabel,
    labelPosition,
    showLabelLine,
    labelFormatter,
    showHighlighter,
    tooltipOverlayActive,
    theme,
  ]);

  useEffect(() => {
    let chart: any;
    let detachPieTooltip = () => {};
    if (chartRef.current) {
      try {
        chart = echarts.init(chartRef.current, 'light', {
          width,
          height,
        });
        chart.setOption(option);

        detachPieTooltip = attachPieItemTooltipListeners(chart);

        const handlePieClick = (params: {
          componentType?: string;
          seriesType?: string;
          seriesIndex?: number;
          dataIndex?: number;
          name?: string;
          value?: number;
          seriesName?: string;
          percent?: number;
        }) => {
          const cb = onSelectRef.current;
          if (typeof cb !== 'function') return;
          if (params.componentType !== 'series') return;
          if (params.seriesType !== 'pie') return;
          if (
            typeof params.dataIndex !== 'number' ||
            params.dataIndex < 0 ||
            params.name == null
          ) {
            return;
          }
          const event: PieChartSelectEvent = {
            seriesIndex: params.seriesIndex ?? 0,
            dataIndex: params.dataIndex,
            name: String(params.name),
            value: Number(params.value ?? 0),
            seriesName: params.seriesName,
            percent: params.percent,
          };
          cb(event);
        };

        chart.on('click', handlePieClick);
      } catch (error) {
        console.warn('Pie chart initialization error:', error);
      }
    }
    return () => {
      detachPieTooltip();
      if (chart) {
        try {
          chart.dispose();
        } catch (error) {
          console.warn('Pie chart disposal error:', error);
        }
      }
    };
  }, [option, width, height, attachPieItemTooltipListeners]);

  return (
    <View style={{ width, height, position: 'relative' }}>
      <SkiaChart ref={chartRef} useRNGH gesture={scrollFriendlyGesture} />
      {renderPieTooltipOverlay()}
    </View>
  );
};

const PieChartComponent = withResponsiveContainer(withChartTheme(ChartComponent), 'data');
export const PieChart = Object.assign(PieChartComponent, {
  displayName: 'PieChart',
});
