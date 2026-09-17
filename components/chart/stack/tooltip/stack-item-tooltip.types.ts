/**
 * Item tooltip payload for the stack chart (ECharts `trigger: 'item'` on a single track).
 */

export interface StackItemTooltipParams {
  pointerX: number;
  pointerY: number;
  /** Index of the segment in `data`. */
  seriesIndex: number;
  /** Always 0 — the stack chart renders a single track. */
  dataIndex: number;
  /** Segment name. */
  label: string;
  value: number;
  /** Share of {@link total}, 0–100. */
  percent: number;
  /** Share of the full scale `min`…`max` (0–100). */
  percentOfMax: number;
  /**
   * Denominator behind {@link percent}: the sum of all segments in `stack` layout,
   * the full scale in `overlap` layout, where segments share the same origin.
   */
  total: number;
  color?: string;
}

/** One stacked or overlaid segment, resolved to its color and its position in `data`. */
export interface StackTooltipSegment {
  label: string;
  value: number;
  color?: string;
  /** Position in the `data` prop, which differs from the series order in `overlap` layout. */
  dataIndex: number;
}

export interface StackItemTooltipContext {
  /**
   * Segment per ECharts series index, aligned with the rendered series.
   * Holes are non-interactive series — the unfilled track.
   */
  seriesSegments: Array<StackTooltipSegment | undefined>;
  /** Denominator for a segment's share: the segment sum, or the scale in `overlap` layout. */
  shareBase: number;
  /** Length of the scale (`max` - `min`). */
  span: number;
}
