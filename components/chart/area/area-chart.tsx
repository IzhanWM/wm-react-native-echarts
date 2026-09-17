import { withResponsiveContainer } from '../chart-container';
import { useChartTheme, withChartTheme } from '../chart-theme.context';
import type { CartesianChartSelectEvent } from '../props/cartesian';
import type { AreaChartProps } from './area-chart.props';
import { createAxisTooltipPreset, useAxisTooltip } from '../cartesian/tooltip';
import type { AxisTooltipContext } from '../cartesian/tooltip/axis-tooltip.types';
import { SkiaChart, SkiaRenderer } from '@wuba/react-native-echarts';
import { scrollFriendlyGesture } from '../gesture';
import { LineChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TooltipComponent
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { parse, stringify } from 'zrender/lib/tool/color';
import React, { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { getAxis, valueAxisBoundsFromProps, categoryAxisBoundsFromProps } from '../axis';
import {
  echartsLegendLayoutFragment,
  mergeCartesianGridForLegend,
} from '../legend/echarts-legend-layout';

// Re-export types for backward compatibility (common -> cartesian -> area)
export type {
  AreaChartProps,
  AreaChartSelectEvent,
  AreaChartAxisTooltipParams,
  AreaChartTooltipSeriesItem,
  SeriesData,
} from './area-chart.props';

// Register necessary components for this chart
echarts.use([
  TooltipComponent,
  GridComponent,
  LegendComponent,
  SkiaRenderer,
  LineChart,
]);

const applyOpacity = (colorStr: string, opacity: number) => {
  const rgba = parse(colorStr);
  if (!rgba) return colorStr;
  return stringify([rgba[0], rgba[1], rgba[2], opacity], 'rgba');
};

const ChartComponent = ({
  data,
  width = 220,
  height = 350,
  type = 'default',
  step,
  boundaryGap = false,
  stack,
  stackNormalize = false,
  symbol,
  symbolSize,
  areaOpacity = 0.6,
  areaFill = 'gradient',
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
}: AreaChartProps) => {
  const { theme } = useChartTheme(props.theme, props.colors);
  const chartRef = useRef<any>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const axisTooltipContextRef = useRef<AxisTooltipContext>({
    displaySeries: [],
    categoryAxisData: [],
  });
  const themeSeriesRef = useRef(theme.series);
  themeSeriesRef.current = theme.series;

  const tooltipOverlayActive = renderTooltip != null || tooltip !== 'none';

  const renderTooltipFn = useMemo(() => {
    if (renderTooltip != null) return renderTooltip;
    if (tooltip === 'none') return () => null;
    return createAxisTooltipPreset(tooltip);
  }, [renderTooltip, tooltip]);

  const { attachAxisTooltipListeners, renderAxisTooltipOverlay } = useAxisTooltip({
    active: tooltipOverlayActive,
    renderTooltip: renderTooltipFn,
    contextRef: axisTooltipContextRef,
    themeSeriesRef,
    width,
    height,
  });

  // Derive smooth/step from type
  const effectiveSmooth = type === 'smooth';
  const effectiveStep = type === 'step' ? (step ?? 'start') : false;

  // Normalize data to array of { data: number[] } or { name: string; data: number[] }
  const normalizedSeries = useMemo(() => {
    let normalizedData: Array<{
      name: string;
      data: [string | number, number][];
    }> = [];
    if (!Array.isArray(data) || data.length === 0) return normalizedData;
    const first = data[0];

    // Single series: number[] → one series
    if (typeof first === 'number') {
      normalizedData = [{ name: 'Series 1', data: (data as number[]).map((value, index) => [String(index), value]) as [string, number][] }];
    } else if (Array.isArray(first) && first.length ===2 ) {
      normalizedData = [{ name: 'Series 1', data: (data as [string | number, number][])}];
    } else {
      normalizedData = (JSON.parse(JSON.stringify(data)) as Array<{ name?: string; data: [string | number, number][] | number[] }>)
      .filter(item => item.data && item.data.length > 0)
      .map((item, index) => {
        const first = item.data[0];
        // Single series: number[] → one series
        if (typeof first === 'number') {
          item.data = (item.data as number[]).map((value, index) => [String(index), value]) as [string, number][];
        } 
        return {
          name: item.name || 'Series ' + (index + 1),
          data: [...item.data as [string | number, number][]],
        };
      });
    }
    return normalizedData;
  }, [data]);

  // Check if series have names
  const hasNamedSeries = useMemo(() => {
    return normalizedSeries.some(s => 'name' in s && s.name);
  }, [normalizedSeries]);

  // When stackNormalize is true, convert each series to percentages (0–100) per x-index so stacked area sums to 100%
  const displaySeries = useMemo(() => {
    if (!stackNormalize || normalizedSeries.length <= 1) {
      return normalizedSeries;
    }
    const len = normalizedSeries[0]?.data?.length ?? 0;
    if (len === 0) return normalizedSeries;
    return normalizedSeries.map((s) => {
      const rawData = s.data;
      const sumsAt = new Array(len).fill(0);
      normalizedSeries.forEach((other) => {
        const d = 'data' in other ? other.data : [];
        d.forEach((v, i) => {
          if (i < len) sumsAt[i] += typeof v === 'number' ? v : v[1];
        });
      });
      const normalizedData = rawData.map((v, i) => {
        const val = typeof v === 'number' ? v : v[1];
        const sum = sumsAt[i] || 1;
        return sum > 0 ? (val / sum) * 100 : 0;
      });
      return {
        name: s.name,
        data: rawData.map((v, i) => [typeof v === 'number' ? String(i) : v[0], normalizedData[i]] as [
          string | number,
          number,
        ]),
      };
    });
  }, [normalizedSeries, stackNormalize]);

  const valueAxisBounds = useMemo(
    () => valueAxisBoundsFromProps({ minY, maxY, intervalY }),
    [minY, maxY, intervalY]
  );

  const categoryAxisBounds = useMemo(
    () => categoryAxisBoundsFromProps({ minX, maxX, intervalX }),
    [minX, maxX, intervalX]
  );

  const xAxisData = useMemo((): (string | number)[] => {
    const dataPoints = normalizedSeries
      .map(s => s.data.map(item => item[0] as number))
      .flat();
    return getAxis(dataPoints).map(String);
  }, [normalizedSeries]);

  axisTooltipContextRef.current = { displaySeries, categoryAxisData: xAxisData };

  const option = useMemo(() => {

    // Build xAxis config (category with data indices)
    const xAxisConfig: any = {
      type: 'category',
      data: xAxisData,
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
      axisLine: showXAxis ? {
        show: true,
        lineStyle: {
          color: theme.axis.x.lineColor,
          width: theme.axis.x.lineWidth,
        },
      } : {
        show: false,
      },
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
      boundaryGap,
      ...(categoryAxisBounds?.min !== undefined && { min: categoryAxisBounds.min }),
      ...(categoryAxisBounds?.max !== undefined && { max: categoryAxisBounds.max }),
    };

    // Build yAxis config (value axis: optional min/max/interval; else ECharts auto-scale, except stack-normalized %)
    const yAxisConfig: any = {
      type: 'value',
      ...(stackNormalize && displaySeries.length > 1
        ? { min: 0, max: 100 }
        : (valueAxisBounds ?? {})),
      ...(yAxisLabel != null && yAxisLabel !== '' && {
        name: yAxisLabel,
        nameLocation: 'middle',
        nameGap: yAxisNameGap ?? 40,
        nameTextStyle: { color: theme.axis.y.tickLabelColor },
      }),
      axisLabel: {
        show: showYAxis || yAxisTickLabelFormatter != null,
        color: theme.axis.y.tickLabelColor,
        formatter: yAxisTickLabelFormatter ?? (stackNormalize && displaySeries.length > 1
          ? (value: number) => `${value}%`
          : undefined),
      },
      axisLine: showYAxis ? {
        show: true,
        lineStyle: {
          color: theme.axis.y.lineColor,
          width: theme.axis.y.lineWidth,
        },
      } : {
        show: false,
      },
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

    // Build legend config
    const legendConfigFinal: any =
      showLegend && hasNamedSeries
        ? {
            data: normalizedSeries
              .filter((s) => 'name' in s && s.name)
              .map((s) => s.name),
            ...echartsLegendLayoutFragment(legendPosition),
            textStyle: {
              color: theme.legend.textColor,
              fontSize: theme.legend.fontSize,
            },
            backgroundColor: theme.legend.backgroundColor,
          }
        : undefined;

    // Build series config (use displaySeries so stackNormalize uses percentage data)
    const seriesConfig = displaySeries.map((s, index) => {
      const seriesColor = theme.series[index % theme.series.length].color;
      const seriesLineWidth = theme.series[index]?.lineWidth ?? theme.series[0].lineWidth ?? 2;
      
      const colorWithOpacity = applyOpacity(seriesColor, areaOpacity);
      const transparentColor = applyOpacity(seriesColor, 0);
      const solidColor = applyOpacity(seriesColor, 1);
      
      const areaStyleConfig =
        areaFill === 'gradient'
          ? {
              color: {
                type: 'linear' as const,
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: colorWithOpacity },
                  { offset: 1, color: transparentColor },
                ],
              },
            }
          : areaFill === 'transparent'
            ? { color: colorWithOpacity }
            : { color: solidColor };
      
      const series: any = {
        data: 'data' in s ? s.data : [],
        type: 'line',
        symbol: symbol || undefined,
        symbolSize: symbolSize || 8,
        areaStyle: areaStyleConfig,
        itemStyle: {
          color: seriesColor,
        },
        lineStyle: {
          color: seriesColor,
          width: seriesLineWidth,
        },
        // Point highlight at cursor: solid circle on the curve when axis pointer highlights this point
        emphasis: showHighlighter
          ? {
              focus: 'self',
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

      // Add name if present
      if ('name' in s && s.name) {
        series.name = s.name;
      }

      // Handle interpolation
      if (effectiveStep !== false) {
        series.step = effectiveStep;
      } else {
        series.smooth = effectiveSmooth;
      }

      // Handle stacking (when stackNormalize, data is already % so use same stack id so they stack to 100%)
      if (stack !== undefined && stack !== false) {
        series.stack = typeof stack === 'string' ? stack : 'total';
      } else if (stackNormalize && displaySeries.length > 1) {
        series.stack = 'total';
      }

      return series;
    });

    const config: any = {
      xAxis: xAxisConfig,
      yAxis: yAxisConfig,
      series: seriesConfig,
      axisPointer: {
        show: true,
        type: 'line',
        snap: true,
        lineStyle: {
          type: 'solid' as const,
          width: 1,
          color: '#00000000',
          show: false,
        },
        label: {
          show: false,
        }
      }
    };
    // Add legend if configured
    if (legendConfigFinal) {
      config.legend = legendConfigFinal;
    }

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
    xAxisData,
    displaySeries,
    type,
    effectiveSmooth,
    effectiveStep,
    boundaryGap,
    stack,
    stackNormalize,
    symbol,
    symbolSize,
    areaOpacity,
    areaFill,
    showXAxis,
    showYAxis,
    showXAxisTicks,
    showYAxisTicks,
    showXAxisSplitLines,
    showYAxisSplitLines,
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
    categoryAxisBounds,
  ]);

  useEffect(() => {
    let chart: any;
    let detachAxisTooltip = () => {};
    if (chartRef.current) {
      try {
        chart = echarts.init(chartRef.current, 'light', {
          width: width,
          height: height,
        });
        
        chart.setOption(option);

        detachAxisTooltip = attachAxisTooltipListeners(chart);

        const handleSeriesClick = (params: {
          componentType?: string;
          seriesIndex?: number;
          dataIndex?: number;
        }) => {
          const cb = onSelectRef.current;
          if (typeof cb !== 'function') return;
          if (params.componentType !== 'series') return;
          const seriesIndex = params.seriesIndex;
          const dataIndex = params.dataIndex;
          if (
            typeof seriesIndex !== 'number' ||
            typeof dataIndex !== 'number' ||
            dataIndex < 0
          ) {
            return;
          }
          const { displaySeries: ds, categoryAxisData: xd } = axisTooltipContextRef.current;
          const s = ds[seriesIndex];
          if (!s?.data || !Array.isArray(s.data)) return;
          const point = s.data[dataIndex];
          if (point === undefined) return;
          const seriesName =
            s.name != null && s.name !== ''
              ? String(s.name)
              : `Series ${seriesIndex + 1}`;
          let x: string | number;
          let y: number;
          if (typeof point === 'number') {
            x = xd[dataIndex] ?? dataIndex;
            y = point;
          } else if (Array.isArray(point) && point.length >= 2) {
            x = point[0] as string | number;
            y = Number(point[1]);
          } else {
            return;
          }
          const event: CartesianChartSelectEvent = {
            seriesIndex,
            dataIndex,
            seriesName,
            x,
            y,
          };
          cb(event);
        };

        chart.on('click', handleSeriesClick);
      } catch (error) {
        console.warn('Chart initialization error:', error);
      }
    }
    return () => {
      detachAxisTooltip();
      if (chart) {
        try {
          chart.dispose();
        } catch (error) {
          console.warn('Chart disposal error:', error);
        }
      }
    };
  }, [option, width, height, attachAxisTooltipListeners]);

  return (
    <View style={{ width, height, position: 'relative' }}>
      <SkiaChart ref={chartRef} useRNGH gesture={scrollFriendlyGesture} />
      {renderAxisTooltipOverlay()}
    </View>
  );
};

const AreaChartComponent = withResponsiveContainer(withChartTheme(ChartComponent));
export const AreaChart = Object.assign(AreaChartComponent, {
  displayName: 'AreaChart',
});
