import type { ReactNode } from 'react';
import type { AxisTooltipParams } from '../cartesian/tooltip/axis-tooltip.types';
import type { ChartTooltipOption } from '../tooltip';
import type { CommonChartProps, LegendPosition } from './common';

/**
 * Emitted when the user taps/clicks a series data point on Cartesian-based charts
 * (area, line, column, bar, scatter, bubble, candlestick, etc.).
 */
export interface CartesianChartSelectEvent {
  seriesIndex: number;
  dataIndex: number;
  seriesName: string;
  x: string | number;
  y: number;
  /** Third numeric dimension when present (e.g. bubble size). */
  z?: number;
  /** Set when the gesture targets a candlestick series. */
  ohlc?: {
    open: number;
    close: number;
    low: number;
    high: number;
  };
}

/**
 * Grid positioning configuration.
 * Values can be percentages (strings like '10%') or pixel values (numbers).
 */
export interface CartesianGrid {
  left?: string | number;
  right?: string | number;
  top?: string | number;
  bottom?: string | number;
}

/**
 * Props shared by all Cartesian chart components (axes, grid, legend, highlighter).
 * common -> cartesian -> area | bar | scatter
 */
export interface CartesianChartProps extends CommonChartProps {
  /**
   * Whether to leave gaps at the start and end of the axis.
   * @default false (area/line/scatter); true (bar)
   */
  boundaryGap?: boolean;
  /**
   * X-axis minimum when set. Applies to the chart’s **X** axis (category or value, depending on the chart).
   * For horizontal column/bar, the **value** (bar length) scale is on **X** — use `minX` / `maxX` / `intervalX` for that scale.
   * When omitted, the minimum is derived from the data or chosen automatically.
   */
  minX?: number;
  /**
   * X-axis maximum when set. See {@link minX} for layout notes. When omitted, the maximum is derived from the data or chosen automatically.
   */
  maxX?: number;
  /**
   * X-axis tick interval when set. See {@link minX} for layout notes. When omitted, the tick step is chosen automatically.
   */
  intervalX?: number;
  /**
   * Y-axis (value scale) minimum when set. Applies to the chart’s **Y** axis.
   * When omitted, the minimum is derived from the data or chosen automatically.
   */
  minY?: number;
  /**
   * Y-axis (value scale) maximum when set. When omitted, the maximum is derived from the data or chosen automatically.
   */
  maxY?: number;
  /**
   * Y-axis (value scale) tick interval when set. When omitted, the tick step is chosen automatically.
   */
  intervalY?: number;
  /**
   * Whether to show the X-axis line and labels.
   * @default true
   */
  showXAxis?: boolean;
  /**
   * Whether to show X-axis tick marks. Only applies when {@link showXAxis} is true.
   * @default true
   */
  showXAxisTicks?: boolean;
  /**
   * Whether to show the Y-axis line and labels.
   * @default true
   */
  showYAxis?: boolean;
  /**
   * Whether to show Y-axis tick marks. Only applies when {@link showYAxis} is true.
   * @default true
   */
  showYAxisTicks?: boolean;
  /**
   * Whether to show vertical grid lines (X-axis split lines).
   * @default true
   */
  showXAxisSplitLines?: boolean;
  /**
   * Whether to show horizontal grid lines (Y-axis split lines).
   * @default true
   */
  showYAxisSplitLines?: boolean;
  /**
   * Label text for the X-axis (displayed along the axis).
   * @default undefined
   */
  xAxisLabel?: string;
  /**
   * Label text for the Y-axis (displayed along the axis).
   * @default undefined
   */
  yAxisLabel?: string;
  /**
   * Distance (px) between the X-axis caption ({@link xAxisLabel}) and the axis line/labels.
   * @default 25 (category axis); 40 (value axis)
   */
  xAxisNameGap?: number;
  /**
   * Distance (px) between the Y-axis caption ({@link yAxisLabel}) and the axis line/labels.
   * @default 25 (category axis); 40 (value axis)
   */
  yAxisNameGap?: number;
  /**
   * Grid positioning configuration.
   */
  grid?: CartesianGrid;
  /**
   * Whether to display a legend for named series.
   * @default true
   */
  showLegend?: boolean;
  /**
   * Legend position. Top and bottom use a horizontal legend that wraps; left and right use a vertical legend.
   * @default 'bottom'
   */
  legendPosition?: LegendPosition;
  /**
   * Whether **emphasis** (hover highlight) is applied while the axis pointer / tooltip is near the series.
   * Column and bar charts default this to `false`; area defaults to `true`.
   */
  showHighlighter?: boolean;
  /**
   * Built-in axis tooltip preset when `renderTooltip` is omitted (area, line, column, bar). Use `none` to hide the overlay.
   * When `renderTooltip` is set, it replaces the preset body. The overlay is hidden only when `tooltip` is `none` and `renderTooltip` is omitted.
   * Scatter and bubble use the same prop for **item** tooltips.
   * @default 'card'
   */
  tooltip?: ChartTooltipOption;
  /**
   * Formatter for X-axis tick labels. (value, index?) => string
   */
  xAxisTickLabelFormatter?: (value: string | number, index?: number) => string;
  /**
   * Formatter for Y-axis tick labels. (value, index?) => string
   */
  yAxisTickLabelFormatter?: (value: string | number, index?: number) => string;
  /**
   * Called when the user selects (taps/clicks) a data point on a series (when supported).
   */
  onSelect?: (event: CartesianChartSelectEvent) => void;
  /**
   * Overrides the default React Native axis tooltip body for charts that use the axis tooltip overlay (area, line, column, bar).
   * Scatter and bubble charts use item tooltip `renderTooltip` on their own props instead.
   * Takes precedence over {@link tooltip}.
   */
  renderTooltip?: (params: AxisTooltipParams) => ReactNode;
}
