import type {
  StackItemTooltipContext,
  StackItemTooltipParams,
  StackTooltipSegment,
} from './stack-item-tooltip.types';

/**
 * A segment's share of the stacked total, or of the full scale when segments share an origin.
 * Used by both the tooltip and the select event so the two never disagree.
 */
export function stackSharePercent(value: number, shareBase: number): number {
  return shareBase > 0 ? (value / shareBase) * 100 : 0;
}

/** Center of a cartesian bar (`{ x, y, width, height }`). */
function barRectCenter(layout: any): { x: number; y: number } | null {
  if (!layout || !Number.isFinite(layout.x) || !Number.isFinite(layout.y)) return null;
  const w = Number.isFinite(layout.width) ? Number(layout.width) : 0;
  const h = Number.isFinite(layout.height) ? Number(layout.height) : 0;
  return { x: Number(layout.x) + w / 2, y: Number(layout.y) + h / 2 };
}

/** Center of a polar bar sector (`{ cx, cy, r0, r, startAngle, endAngle }`). */
function barSectorCenter(layout: any): { x: number; y: number } | null {
  if (!layout || !Number.isFinite(layout.cx) || !Number.isFinite(layout.cy)) return null;
  const startAngle = Number(layout.startAngle);
  const endAngle = Number(layout.endAngle);
  if (!Number.isFinite(startAngle) || !Number.isFinite(endAngle)) return null;
  const r = Number(layout.r);
  const r0 = Number(layout.r0 ?? 0);
  const mid = (startAngle + endAngle) / 2;
  const avgR = (r0 + r) / 2;
  return {
    x: Number(layout.cx) + Math.cos(mid) * avgR,
    y: Number(layout.cy) + Math.sin(mid) * avgR,
  };
}

function pointerFromEventOrLayout(chart: any, evt: any, seriesIndex: number): { x: number; y: number } | null {
  const ex = evt?.x;
  const ey = evt?.y;
  if (typeof ex === 'number' && typeof ey === 'number' && !Number.isNaN(ex) && !Number.isNaN(ey)) {
    return { x: ex, y: ey };
  }
  const seriesModel = chart?.getModel?.().getSeriesByIndex?.(seriesIndex);
  const layout = seriesModel?.getData?.()?.getItemLayout?.(0);
  if (!layout) return null;
  return barSectorCenter(layout) ?? barRectCenter(layout);
}

/**
 * Build stack item tooltip params from an ECharts `showTip` payload.
 * Returns `null` for the track series and for axis-style payloads (`dataByCoordSys`).
 */
export function stackItemParamsFromShowTip(
  chart: any,
  evt: any,
  ctx: StackItemTooltipContext
): StackItemTooltipParams | null {
  if (!chart || !evt) return null;
  if (Array.isArray(evt.dataByCoordSys) && evt.dataByCoordSys.length > 0) return null;

  const si = evt.seriesIndex;
  if (typeof si !== 'number' || si < 0) return null;

  // A hole means the unfilled track, which carries no tooltip.
  const segment: StackTooltipSegment | undefined = ctx.seriesSegments[si];
  if (!segment) return null;

  const pixel = pointerFromEventOrLayout(chart, evt, si);
  if (!pixel) return null;

  const value = Number(segment.value);

  return {
    pointerX: pixel.x,
    pointerY: pixel.y,
    seriesIndex: segment.dataIndex,
    dataIndex: 0,
    label: segment.label,
    value,
    percent: stackSharePercent(value, ctx.shareBase),
    percentOfMax: stackSharePercent(value, ctx.span),
    total: ctx.shareBase,
    ...(segment.color != null ? { color: segment.color } : {}),
  };
}
