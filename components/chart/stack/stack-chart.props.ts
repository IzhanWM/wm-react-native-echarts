import type { CommonChartProps, LegendPosition } from '../props/common';
import type { ChartTooltipOption } from '../tooltip';
import type { StackItemTooltipParams } from './tooltip/stack-item-tooltip.types';
import type { ReactNode } from 'react';

/**
 * Shape of the single stacked track.
 * - `bar`: horizontal pill laid out on a cartesian grid, value axis below.
 * - `semi-circle`: upper half circle (180° → 0°).
 * - `arc`: gauge-style 270° arc (225° → -45°).
 */
export type StackChartView = 'bar' | 'semi-circle' | 'arc';

/**
 * How the segments share the track.
 * - `overlap`: every segment starts at `min` and the segments lie on top of one another, longest
 *   drawn first so the shorter ones stay visible.
 * - `stack`: each segment starts where the previous one ended.
 */
export type StackChartLayout = 'overlap' | 'stack';

/**
 * Shape of the ends of the filled run and of the unfilled track, which are capped separately.
 * - `curve`: the run is rounded at its start and end, the track at both of its ends; the joints
 *   between segments stay square.
 * - `flat`: square ends throughout.
 */
export type StackChartEdge = 'curve' | 'flat';

/** One stacked segment of the track. */
export interface StackDataItem {
  /** Segment name used by the legend, labels and tooltip. Defaults to `Segment N`. */
  label?: string;
  /** Segment size, in the same unit as the `min` / `max` scale. */
  value: number;
  /** Overrides the themed series color for this segment. */
  color?: string;
}

/** Emitted when the user taps/clicks a stacked segment. */
export interface StackChartSelectEvent {
  /** Index of the segment in `data`. */
  seriesIndex: number;
  /** Always 0 — the stack chart renders a single track. */
  dataIndex: number;
  label: string;
  value: number;
  /** Share of the stacked total (`stack`) or of the full scale (`overlap`), 0–100. */
  percent: number;
}

/**
 * Props for StackChart (single stacked track rendered as a bar, semi-circle or arc).
 * common -> stack
 */
export interface StackChartProps extends CommonChartProps {
  /**
   * Segments stacked into one track, in draw order (first segment starts the track).
   * Plain numbers are accepted as a shorthand for `{ value }`.
   */
  data: StackDataItem[] | number[];
  /**
   * Shape of the track.
   * @default 'bar'
   */
  view?: StackChartView;
  /**
   * Whether segments all start at `min` and overlap, or run end to end.
   * @default 'overlap'
   */
  layout?: StackChartLayout;
  /**
   * Start of the scale.
   * @default 0
   */
  min?: number;
  /**
   * End of the scale. When omitted the segments fill the whole track: `min` + the longest value in
   * `overlap` layout, `min` + the sum of the values in `stack` layout.
   * Set a larger value to leave an unfilled remainder, as in a progress track.
   */
  max?: number;
  /**
   * Distance between axis labels, in value units. Auto when omitted.
   */
  interval?: number;
  /**
   * Color of the unfilled part of the track.
   * @default '#e8e8e899'
   */
  trackColor?: string;
  /**
   * Thickness of the bar in pixels. `bar` view only.
   * @default 24
   */
  thickness?: number;
  /**
   * Inner radius of the ring. `semi-circle` / `arc` views only.
   * @default '58%'
   */
  innerRadius?: string | number;
  /**
   * Outer radius of the ring. `semi-circle` / `arc` views only.
   * @default '82%'
   */
  outerRadius?: string | number;
  /**
   * Rounded (`curve`) or square (`flat`) ends. The filled run and the unfilled track are capped
   * separately, and joints between segments stay square either way.
   * @default 'curve'
   */
  edge?: StackChartEdge;
  /**
   * Angle (degrees) the scale starts at, overriding the view default.
   * 0 = right (3 o'clock), 90 = top, 180 = left. `semi-circle` / `arc` views only.
   */
  startAngle?: number;
  /**
   * Angle (degrees) the scale ends at, overriding the view default.
   * `semi-circle` / `arc` views only.
   */
  endAngle?: number;
  /**
   * Whether to show the scale labels along the track.
   * @default true
   */
  showAxisLabels?: boolean;
  /**
   * Formats a scale label (e.g. `(v) => \`$${v}\``).
   */
  axisLabelFormatter?: (value: number) => string;
  /**
   * Distance between the track and its scale labels, in pixels.
   * Negative values move the labels inside the ring on `semi-circle` / `arc`.
   * @default 8
   */
  axisLabelMargin?: number;
  /**
   * Whether to draw the value of each segment inside the segment.
   * @default false
   */
  showSegmentLabels?: boolean;
  /**
   * Formats the label drawn inside a segment. Implies {@link showSegmentLabels}.
   */
  segmentLabelFormatter?: (value: number, label: string, index: number) => string;
  /**
   * Text drawn at the center of the ring. `semi-circle` / `arc` views only.
   */
  centerText?: string;
  /**
   * Text drawn below {@link centerText}. `semi-circle` / `arc` views only.
   */
  centerSubtext?: string;
  /**
   * Whether to show the legend (segment labels).
   * @default true
   */
  showLegend?: boolean;
  /**
   * Position of the legend.
   * @default 'bottom'
   */
  legendPosition?: LegendPosition;
  /**
   * Built-in item tooltip preset when `renderTooltip` is omitted. Use `none` to hide the overlay.
   * @default 'card'
   */
  tooltip?: ChartTooltipOption;
  /**
   * Overrides the default React Native item tooltip body (see {@link StackItemTooltipParams}).
   * Takes precedence over {@link tooltip}.
   */
  renderTooltip?: (params: StackItemTooltipParams) => ReactNode;
  /**
   * Called when the user selects (taps/clicks) a segment.
   */
  onSelect?: (event: StackChartSelectEvent) => void;
}
