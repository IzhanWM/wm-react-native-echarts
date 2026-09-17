import type { CommonChartProps, LegendPosition } from '../props/common';
import type { ChartTooltipOption } from '../tooltip';
import type { PieItemTooltipParams } from './tooltip/pie-item-tooltip.types';
import type { ReactNode } from 'react';

/** Emitted when the user taps/clicks a pie slice. */
export interface PieChartSelectEvent {
  seriesIndex: number;
  dataIndex: number;
  name: string;
  value: number;
  /** Series/ring name when applicable (concentric pies). */
  seriesName?: string;
  percent?: number;
}

/**
 * Single slice data for pie/donut charts.
 */
export interface PieDataItem {
  /** Display name for the slice */
  name: string;
  /** Numeric value (determines slice size) */
  value: number;
  /** Optional per-item color override */
  itemStyle?: { color?: string };
}

/**
 * Data for one ring in a concentric (multi-ring) pie.
 * Each ring has its own radius range and slice data.
 */
export interface PieRingData {
  /** Optional name for the ring (e.g. for legend). */
  name?: string;
  /** Inner and outer radius as [inner, outer], e.g. ['0%', '35%'] or ['45%', '60%']. */
  radius: (number | string)[];
  /** Slice data for this ring. */
  data: PieDataItem[];
}

/**
 * Chart data: single pie (array of slices) or concentric (array of rings).
 */
export type PieChartData = PieDataItem[] | PieRingData[];

/**
 * Type guard: true if data is concentric (array of rings).
 */
export function isConcentricPieData(
  data: PieChartData
): data is PieRingData[] {
  if (!Array.isArray(data) || data.length === 0) return false;
  const first = data[0] as PieRingData | PieDataItem;
  return (
    'data' in first &&
    Array.isArray(first.data) &&
    'radius' in first &&
    Array.isArray((first as PieRingData).radius)
  );
}

/**
 * Props for PieChart.
 * Extends common chart props (width, height, theme, colors).
 */
export interface PieChartProps extends CommonChartProps {
  /**
   * Chart data: single pie (array of { name, value }) or concentric (array of { name?, radius, data }).
   */
  data: PieChartData;
  /**
   * Radius of the pie. Number (e.g. 100), string (e.g. '60%'), or [inner, outer] for donut.
   * @default '75%'
   */
  radius?: number | string | (number | string)[];
  /**
   * Whether to show the legend for slices.
   * @default true
   */
  showLegend?: boolean;
  /**
   * Legend position. Top and bottom use a horizontal legend that wraps; left and right use a vertical legend.
   * @default 'bottom'
   */
  legendPosition?: LegendPosition;
  /**
   * Whether to show slice labels (name/value on the chart).
   * @default true
   */
  showLabel?: boolean;
  /**
   * Label position: 'outside' | 'inside' | 'center'.
   * @default 'outside'
   */
  labelPosition?: 'outside' | 'inside' | 'center';
  /**
   * Whether to show label lines (connectors from slice to label).
   * @default true when labelPosition is 'outside'
   */
  showLabelLine?: boolean;
  /**
   * ECharts pie label formatter, passed straight through to the series' `label.formatter`
   */
  labelFormatter?: (params: any) => string;
  /**
   * Whether to emphasize (scale/highlight) the hovered slice.
   * @default true
   */
  showHighlighter?: boolean;
  /**
   * Built-in item tooltip preset when `renderTooltip` is omitted. Use `none` to hide the overlay.
   * When `renderTooltip` is set, it replaces the preset body. Overlay hidden only when `tooltip` is `none` and `renderTooltip` is omitted.
   * @default 'card'
   */
  tooltip?: ChartTooltipOption;
  /**
   * Overrides the default React Native **item** tooltip body for pie slices (see {@link PieItemTooltipParams}).
   * Takes precedence over {@link tooltip}.
   */
  renderTooltip?: (params: PieItemTooltipParams) => ReactNode;
  /**
   * Called when the user selects (taps/clicks) a slice.
   */
  onSelect?: (event: PieChartSelectEvent) => void;
}
