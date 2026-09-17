import { withResponsiveContainer } from '../chart-container';
import { useChartTheme, withChartTheme } from '../chart-theme.context';
import type { ColumnChartProps } from './column-chart.props';
import { SkiaChart, SkiaRenderer } from '@wuba/react-native-echarts';
import { scrollFriendlyGesture } from '../gesture';
import { BarChart as EChartsBarChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import React, { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { getAxis, valueAxisBoundsFromProps, xAxisBoundsFromProps, categoryAxisBoundsFromProps } from '../axis';
import type { CartesianChartSelectEvent } from '../props/cartesian';
import { createAxisTooltipPreset, useAxisTooltip } from '../cartesian/tooltip';
import {
  echartsLegendLayoutFragment,
  mergeCartesianGridForLegend,
} from '../legend/echarts-legend-layout';
import type { AxisTooltipContext } from '../cartesian/tooltip/axis-tooltip.types';

/** common -> cartesian -> column */
export type { ColumnChartProps } from './column-chart.props';

echarts.use([
  TooltipComponent,
  GridComponent,
  LegendComponent,
  SkiaRenderer,
  EChartsBarChart,
]);

/** Stable identity for default `cornerRadius` (inline `[4,4,0,0]` in params is a new array every render). */
const DEFAULT_COLUMN_CORNER_RADIUS: [number, number, number, number] = [4, 4, 0, 0];

function columnCornerRadiusDep(
  value: number | [number, number, number, number] | undefined
): string | number {
  if (typeof value === 'number') return value;
  if (Array.isArray(value)) return value.join(',');
  return '4,4,0,0';
}

const ChartComponent = ({
  data,
  width = 220,
  height = 350,
  boundaryGap = true,
  cornerRadius = DEFAULT_COLUMN_CORNER_RADIUS,
  horizontal = false,
  stack,
  stackNormalize = false,
  activeIndex,
  activeColor,
  barInsideLabelPosition = 'start',
  barInsideLabelFormatter,
  barOutsideLabelPosition = 'start',
  barOutsideLabelFormatter,
  itemStyle,
  showXAxis = true,
  showXAxisTicks = true,
  showYAxis = true,
  showYAxisTicks = true,
  showXAxisSplitLines = true,
  showYAxisSplitLines = true,
  grid,
  showLegend = true,
  legendPosition = 'bottom',
  showHighlighter = false,
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
}: ColumnChartProps) => {
  const { theme } = useChartTheme(props.theme, props.colors);
  const chartRef = useRef<any>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  type ColumnSelectContext = AxisTooltipContext & { labelOverlayDuplicate: boolean };
  const selectContextRef = useRef<ColumnSelectContext>({
    displaySeries: [],
    categoryAxisData: [],
    labelOverlayDuplicate: false,
    categoryAxisIsY: false,
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
    contextRef: selectContextRef as React.RefObject<AxisTooltipContext>,
    themeSeriesRef,
    width,
    height,
  });

  const normalizedSeries = useMemo(() => {
    let normalizedData: Array<{
      name: string;
      data: [string | number, number][];
    }> = [];
    if (!Array.isArray(data) || data.length === 0) return normalizedData;
    const first = data[0];

    if (typeof first === 'number') {
      normalizedData = [
        {
          name: 'Series 1',
          data: (data as number[]).map((value, index) => [String(index), value]) as [string, number][],
        },
      ];
    } else if (Array.isArray(first) && first.length === 2) {
      normalizedData = [{ name: 'Series 1', data: data as [string | number, number][] }];
    } else {
      normalizedData = (
        JSON.parse(JSON.stringify(data)) as Array<{
          name?: string;
          data: [string | number, number][] | number[];
        }>
      )
        .filter((item) => item.data && item.data.length > 0)
        .map((item, index) => {
          const firstItem = item.data[0];
          if (typeof firstItem === 'number') {
            item.data = (item.data as number[]).map((value, i) => [
              String(i),
              value,
            ]) as [string, number][];
          }
          return {
            name: item.name || 'Series ' + (index + 1),
            data: [...(item.data as [string | number, number][])],
          };
        });
    }
    return normalizedData;
  }, [data]);

  const hasNamedSeries = useMemo(
    () => normalizedSeries.some((s) => 'name' in s && s.name),
    [normalizedSeries]
  );

  const displaySeries = useMemo(() => {
    if (!stackNormalize || normalizedSeries.length <= 1) return normalizedSeries;
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
        data: rawData.map((v, i) => [v[0], normalizedData[i]] as [string | number, number]),
      };
    });
  }, [normalizedSeries, stackNormalize]);

  const valueAxisBounds = useMemo(
    () => valueAxisBoundsFromProps({ minY, maxY, intervalY }),
    [minY, maxY, intervalY]
  );

  const xAxisBounds = useMemo(
    () => xAxisBoundsFromProps({ minX, maxX, intervalX }),
    [minX, maxX, intervalX]
  );
  const categoryAxisBounds = useMemo(
    () =>
      horizontal
        ? categoryAxisBoundsFromProps({ minX: minY, maxX: maxY, intervalX: intervalY })
        : categoryAxisBoundsFromProps({ minX, maxX, intervalX }),
    [horizontal, minX, maxX, intervalX, minY, maxY, intervalY]
  );

  const showLabelInside = barInsideLabelFormatter != null;
  const showLabelOutside = barOutsideLabelFormatter != null;
  const isSingleSeries = displaySeries.length === 1;
  const labelOverlayDuplicate =
    showLabelInside && showLabelOutside && isSingleSeries;

  const categoryAxisData = useMemo(() => {
    const categories = (displaySeries[0]?.data ?? []).map((item) => String(item[0]));
    const dataPoints = displaySeries.flatMap((s) => s.data.map((d) => d[1]));
    return categories.length > 0 ? categories : getAxis(dataPoints).map(String);
  }, [displaySeries]);

  selectContextRef.current = {
    displaySeries,
    categoryAxisData,
    labelOverlayDuplicate,
    categoryAxisIsY: horizontal,
  };

  const option = useMemo(() => {
    const categories = (displaySeries[0]?.data ?? []).map((item) => String(item[0]));
    const xAxisData = categoryAxisData;

    const categoryShow = horizontal ? showYAxis : showXAxis;
    const categoryShowTicks = horizontal ? showYAxisTicks : showXAxisTicks;
    const categoryShowSplitLines = horizontal ? showYAxisSplitLines : showXAxisSplitLines;
    const categoryTickFormatter = horizontal ? yAxisTickLabelFormatter : xAxisTickLabelFormatter;
    const categoryAxisTheme = horizontal ? theme.axis.y : theme.axis.x;
    const categoryAxisTitle = horizontal ? yAxisLabel : xAxisLabel;
    const categoryAxisNameGap = horizontal ? yAxisNameGap : xAxisNameGap;

    const valueShow = horizontal ? showXAxis : showYAxis;
    const valueShowTicks = horizontal ? showXAxisTicks : showYAxisTicks;
    const valueShowSplitLines = horizontal ? showXAxisSplitLines : showYAxisSplitLines;
    const valueTickFormatter = horizontal ? xAxisTickLabelFormatter : yAxisTickLabelFormatter;
    const valueAxisTheme = horizontal ? theme.axis.x : theme.axis.y;
    const valueAxisTitle = horizontal ? xAxisLabel : yAxisLabel;
    const valueAxisNameGap = horizontal ? xAxisNameGap : yAxisNameGap;

    const categoryAxisConfig: any = {
      type: 'category',
      data: xAxisData,
      boundaryGap,
      ...(categoryAxisBounds?.min !== undefined && { min: categoryAxisBounds.min }),
      ...(categoryAxisBounds?.max !== undefined && { max: categoryAxisBounds.max }),
      ...(categoryAxisTitle != null && categoryAxisTitle !== '' && {
        name: categoryAxisTitle,
        nameLocation: 'middle',
        nameGap: categoryAxisNameGap ?? 25,
        nameTextStyle: { color: categoryAxisTheme.tickLabelColor },
      }),
      axisLabel: {
        show: categoryShow || categoryTickFormatter != null,
        color: categoryAxisTheme.tickLabelColor,
        formatter: categoryTickFormatter ?? undefined,
        ...(categoryAxisBounds?.axisLabelInterval !== undefined
          ? { interval: categoryAxisBounds.axisLabelInterval }
          : {}),
      },
      axisLine: categoryShow
        ? {
            show: true,
            lineStyle: {
              color: categoryAxisTheme.lineColor,
              width: categoryAxisTheme.lineWidth,
            },
          }
        : { show: false },
      axisTick: {
        show: categoryShow && categoryShowTicks,
        lineStyle: {
          color: categoryAxisTheme.tickColor,
          width: categoryAxisTheme.tickWidth,
        },
      },
      splitLine: {
        show: categoryShowSplitLines,
        lineStyle: {
          color: categoryAxisTheme.splitLineColor,
          width: categoryAxisTheme.splitLineWidth,
        },
      },
    };

    const stackPct = stackNormalize && displaySeries.length > 1;
    const valueAxisNumericExtras = stackPct
      ? { min: 0, max: 100 }
      : horizontal
        ? (xAxisBounds ?? {})
        : (valueAxisBounds ?? {});

    const valueAxisConfig: any = {
      type: 'value',
      ...valueAxisNumericExtras,
      ...(valueAxisTitle != null && valueAxisTitle !== '' && {
        name: valueAxisTitle,
        nameLocation: 'middle',
        nameGap: valueAxisNameGap ?? 40,
        nameTextStyle: { color: valueAxisTheme.tickLabelColor },
      }),
      axisLabel: {
        show: valueShow || valueTickFormatter != null,
        color: valueAxisTheme.tickLabelColor,
        formatter:
          valueTickFormatter ??
          (stackNormalize && displaySeries.length > 1
            ? (value: number) => `${value}%`
            : undefined),
      },
      axisLine: valueShow
        ? {
            show: true,
            lineStyle: {
              color: valueAxisTheme.lineColor,
              width: valueAxisTheme.lineWidth,
            },
          }
        : { show: false },
      axisTick: {
        show: valueShow && valueShowTicks,
        lineStyle: {
          color: valueAxisTheme.tickColor,
          width: valueAxisTheme.tickWidth,
        },
      },
      splitLine: {
        show: valueShowSplitLines,
        lineStyle: {
          color: valueAxisTheme.splitLineColor,
          width: valueAxisTheme.splitLineWidth,
        },
      },
    };

    const xAxisConfig = horizontal ? valueAxisConfig : categoryAxisConfig;
    const yAxisConfig = horizontal ? categoryAxisConfig : valueAxisConfig;

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

    const isDefaultVerticalRadius =
      Array.isArray(cornerRadius) &&
      cornerRadius[0] === 4 &&
      cornerRadius[1] === 4 &&
      cornerRadius[2] === 0 &&
      cornerRadius[3] === 0;
    const effectiveCornerRadius: [number, number, number, number] = horizontal
      ? isDefaultVerticalRadius
        ? [0, 4, 4, 0]
        : Array.isArray(cornerRadius)
          ? cornerRadius
          : [0, cornerRadius, cornerRadius, 0]
      : Array.isArray(cornerRadius)
        ? cornerRadius
        : [cornerRadius, cornerRadius, cornerRadius, cornerRadius];

    const isStacked =
      (stack !== undefined && stack !== false) ||
      (stackNormalize && displaySeries.length > 1);

    const showLabelInside = barInsideLabelFormatter != null;
    const showLabelOutside = barOutsideLabelFormatter != null;
    const isSingleSeries = displaySeries.length === 1;

    const insideLabelPositionMap: Record<string, string> = horizontal
      ? { start: 'insideLeft', middle: 'inside', end: 'insideRight' }
      : { start: 'insideLeft', middle: 'inside', end: 'insideRight' };
    const outsideLabelPositionMap: Record<string, string> = horizontal
      ? { start: 'right', end: 'left' }
      : { start: 'top', end: 'bottom' };
    const resolveInsidePosition = (value: number, index: number, category?: string): string => {
      const pos = typeof barInsideLabelPosition === 'function'
        ? barInsideLabelPosition(value, index, category)
        : barInsideLabelPosition;
      return insideLabelPositionMap[pos] ?? 'insideLeft';
    };
    const resolveOutsidePosition = (value: number, index: number, category?: string): string => {
      const pos = typeof barOutsideLabelPosition === 'function'
        ? barOutsideLabelPosition(value, index, category)
        : barOutsideLabelPosition;
      return outsideLabelPositionMap[pos] ?? (horizontal ? 'right' : 'top');
    };
    const echartsInsidePosition = typeof barInsideLabelPosition === 'function'
      ? undefined
      : (insideLabelPositionMap[barInsideLabelPosition] ?? 'insideLeft');
    const echartsOutsidePosition = typeof barOutsideLabelPosition === 'function'
      ? undefined
      : (outsideLabelPositionMap[barOutsideLabelPosition] ?? (horizontal ? 'right' : 'top'));

    const seriesConfig = displaySeries.map((s, index) => {
      const seriesColor = theme.series[index % theme.series.length].color;
      const isEndBar = index === displaySeries.length - 1;
      const barBorderRadius =
        isStacked && !isEndBar ? ([0, 0, 0, 0] as const) : effectiveCornerRadius;
      const isSingle = displaySeries.length === 1;
      const showActive =
        isSingle &&
        activeIndex != null &&
        activeIndex >= 0 &&
        activeIndex < s.data.length;
      const effectiveActiveColor =
        activeColor ?? seriesColor;
      const useItemStyleFn = isSingle && itemStyle != null;
      const baseItemStyle = {
        color: seriesColor,
        borderRadius: barBorderRadius,
      };
      const barData = showActive
        ? s.data.map((d, i) => {
            const value = d[1];
            if (i === activeIndex) {
              return {
                value,
                itemStyle: {
                  color: effectiveActiveColor,
                  borderColor: effectiveActiveColor,
                  borderWidth: 2,
                  borderType: 'dashed',
                  borderRadius: barBorderRadius,
                },
              };
            }
            const override = itemStyle ? itemStyle(value, i) : {};
            return {
              value,
              itemStyle: { ...baseItemStyle, ...override },
            };
          })
        : useItemStyleFn
          ? s.data.map((d, i) => {
              const value = d[1];
              const override = itemStyle(value, i);
              return {
                value,
                itemStyle: { ...baseItemStyle, ...override },
              };
            })
          : s.data.map((d) => d[1]);
      const labelConfig: any = {};
      if (showLabelInside && isSingleSeries && barInsideLabelFormatter) {
        labelConfig.show = true;
        labelConfig.position =
          typeof barInsideLabelPosition === 'function'
            ? (params: any) =>
                resolveInsidePosition(
                  params.value,
                  params.dataIndex,
                  categories[params.dataIndex]
                )
            : echartsInsidePosition;
        labelConfig.color = '#fff';
        labelConfig.formatter = (params: any) =>
          barInsideLabelFormatter(
            params.value,
            params.dataIndex,
            categories[params.dataIndex]
          );
      } else if (
        showLabelOutside &&
        isSingleSeries &&
        barOutsideLabelFormatter &&
        !(showLabelInside && barInsideLabelFormatter)
      ) {
        labelConfig.show = true;
        labelConfig.position =
          typeof barOutsideLabelPosition === 'function'
            ? (params: any) =>
                resolveOutsidePosition(
                  params.value,
                  params.dataIndex,
                  categories[params.dataIndex]
                )
            : echartsOutsidePosition;
        labelConfig.formatter = (params: any) =>
          barOutsideLabelFormatter(
            params.value,
            params.dataIndex,
            categories[params.dataIndex]
          );
      }
      const barSeries: any = {
        type: 'bar',
        data: barData,
        itemStyle: showActive || useItemStyleFn
          ? undefined
          : {
              color: seriesColor,
              borderRadius: barBorderRadius,
            },
        emphasis: showHighlighter
          ? {
              focus: 'self',
              itemStyle: {
                color: seriesColor,
                borderColor: '#fff',
                borderWidth: 1,
              },
            }
          : { focus: 'none' },
      };
      if (Object.keys(labelConfig).length > 0) barSeries.label = labelConfig;
      if (s.name) barSeries.name = s.name;
      if (stack !== undefined && stack !== false) {
        barSeries.stack = typeof stack === 'string' ? stack : 'total';
      } else if (stackNormalize && displaySeries.length > 1) {
        barSeries.stack = 'total';
      }
      return barSeries;
    });

    // When both inside and outside formatters are set, add a second series for outside labels (transparent bars)
    if (showLabelInside && showLabelOutside && isSingleSeries && seriesConfig.length > 0) {
      const first = seriesConfig[0];
      const labelOnlySeries: any = {
        type: 'bar',
        data: first.data,
        barGap: '-100%',
        itemStyle: { color: 'transparent', borderColor: 'transparent' },
        label: {
          show: true,
          position:
            typeof barOutsideLabelPosition === 'function'
              ? (params: any) =>
                  resolveOutsidePosition(
                    params.value,
                    params.dataIndex,
                    categories[params.dataIndex]
                  )
              : echartsOutsidePosition,
          color: theme.axis.x?.tickLabelColor ?? '#333',
          formatter: (params: any) =>
            barOutsideLabelFormatter(
              params.value,
              params.dataIndex,
              categories[params.dataIndex]
            ),
        },
        emphasis: { focus: 'none' },
        tooltip: { show: false },
      };
      seriesConfig.push(labelOnlySeries);
    }

    const config: any = {
      xAxis: xAxisConfig,
      yAxis: yAxisConfig,
      series: seriesConfig,
      axisPointer: {
        show: true,
        type: 'line',
        snap: true,
        lineStyle: {
          type: 'solid',
          width: 1,
          color: '#00000000',
          show: false,
        },
        label: {
          show: false,
        },
      },
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
    displaySeries,
    boundaryGap,
    columnCornerRadiusDep(cornerRadius),
    horizontal,
    stack,
    stackNormalize,
    activeIndex,
    activeColor,
    barInsideLabelPosition,
    barInsideLabelFormatter,
    barOutsideLabelPosition,
    barOutsideLabelFormatter,
    itemStyle,
    showXAxis,
    showXAxisTicks,
    showYAxis,
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
    categoryAxisData,
    valueAxisBounds,
    categoryAxisBounds,
    xAxisBounds,
  ]);

  useEffect(() => {
    let chart: any;
    let detachAxisTooltip = () => {};
    if (chartRef.current) {
      try {
        chart = echarts.init(chartRef.current, 'light', { width, height });
        chart.setOption(option);

        detachAxisTooltip = attachAxisTooltipListeners(chart);

        const handleSeriesClick = (params: {
          componentType?: string;
          seriesType?: string;
          seriesIndex?: number;
          dataIndex?: number;
        }) => {
          const cb = onSelectRef.current;
          if (typeof cb !== 'function') return;
          if (params.componentType !== 'series') return;
          if (params.seriesType !== 'bar') return;
          let seriesIndex = params.seriesIndex;
          const dataIndex = params.dataIndex;
          if (
            typeof seriesIndex !== 'number' ||
            typeof dataIndex !== 'number' ||
            dataIndex < 0
          ) {
            return;
          }
          const { displaySeries: ds, labelOverlayDuplicate: overlay } =
            selectContextRef.current;
          if (overlay && seriesIndex === 1) seriesIndex = 0;
          const s = ds[seriesIndex];
          if (!s?.data || !Array.isArray(s.data)) return;
          const row = s.data[dataIndex];
          if (row === undefined) return;
          const seriesName =
            s.name != null && s.name !== ''
              ? String(s.name)
              : `Series ${seriesIndex + 1}`;
          if (!Array.isArray(row) || row.length < 2) return;
          const x = row[0] as string | number;
          const y = Number(row[1]);
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

const ColumnChartComponent = withResponsiveContainer(withChartTheme(ChartComponent));
export const ColumnChart = Object.assign(ColumnChartComponent, {
  displayName: 'ColumnChart',
});
