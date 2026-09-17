# 03 — Chart components

Source root: `components/chart/`. Each chart folder usually contains:

- `*-chart.tsx` — implementation
- `*-chart.props.ts` — public TypeScript API
- `index.ts` — exports
- `tooltip/` — item tooltip hooks (non-Cartesian or scatter)

## Export map (`components/chart/index.ts`)

| Export | Path | Notes |
|--------|------|-------|
| `AreaChart` | `area/` | Base for filled line/area series |
| `LineChart` | `line/` | `AreaChart` with transparent fill |
| `ColumnChart` | `column/` | Vertical bars |
| `BarChart` | `bar/` | Horizontal bars |
| `ScatterChart` | `scatter/` | XY scatter, item tooltips |
| `BubbleChart` | `bubble/` | Size dimension (z) |
| `CandlestickChart` | `candlestick/` | OHLC + optional volume |
| `PieChart` | `pie/` | Donut, concentric rings |
| `RadialChart` | `radial/` | Polar bar / nightingale rose |
| `StackChart` | `stack/` | Single stacked track: bar, semi-circle or arc |
| `RadarChart` | `radar/` | Spider chart |
| `SimpleGauge`, `DigitalGauge`, `SpeedometerGauge`, `RadialGauge` | `gauge/` | Separate components |
| `GeoChart`, `USChart`, `WorldChart` | `geo/` | Maps + bundled GeoJSON |
| `HeatmapChart` | `heatmap/` | Category matrix + visual map |
| `ChartThemeProvider`, `useChartTheme`, `LIGHT_THEME`, `DARK_THEME` | `chart-theme.context.tsx` | |
| `withResponsiveContainer` | `chart-container.tsx` | |
| Cartesian tooltip helpers | `cartesian/tooltip/` | |
| `ChartTooltipOption` presets | `tooltip/` | |

## Cartesian charts — shared behavior

Implement `CartesianChartProps` unless noted. Common features:

- `boundaryGap`, axis visibility toggles, `minX`/`maxX`/`minY`/`maxY`/`interval*`
- `stack`, `stackNormalize` (area/line/column)
- `showLegend`, `legendPosition`
- `tooltip` preset or `renderTooltip`
- `onSelect` → `CartesianChartSelectEvent`

| Chart | Default highlighter | Special props |
|-------|---------------------|---------------|
| Area | on | `areaOpacity`, `areaFill` (`gradient` / color) |
| Line | on | `type`: `default` \| `smooth` \| `step`, `symbol` |
| Column | off | bar width, item style |
| Bar | off | horizontal category/value axes swapped |
| Scatter | — | item tooltip, symbol per point |
| Bubble | — | z/size from data |
| Candlestick | — | `ohlc` on select event |

## Pie and radial

**PieChart** (`pie-chart.props.ts`):

- Data: `PieDataItem[]` or `PieRingData[]` for concentric.
- `isConcentricPieData()` type guard.
- Props: radii, donut, labels, `tooltip`, `onSelect`, `renderTooltip`.

**RadialChart**: polar layout, similar legend/tooltip patterns to pie.

**RadarChart**: indicator axes, multiple series, symbol options.

## Stack (`stack/`)

**StackChart** (`stack-chart.props.ts`): one track whose segments stack end to end.

- `view`: `bar` (cartesian) \| `semi-circle` \| `arc` (both polar, single-category `radiusAxis`).
- `layout`: `overlap` (default — every segment from `min`, longest series first so shorter ones
  stay on top) \| `stack` (end to end). `drawOrder` carries each segment's `dataIndex` so the
  legend, tooltip and select event keep reporting the authored order.
- Overlapping bars are layered, never placed side by side: on cartesian via `barGap: '-100%'`, on
  polar via one `polar` per layer, because that gap zeroes a polar bar's thickness. A stack uses two
  layers (track behind, stacked run in front); an overlap uses one per bar. `layerCount` drives how
  many `polar` / `angleAxis` / `radiusAxis` entries are emitted.
- Data: `StackDataItem[]` or `number[]`; `max` reserves headroom. The `trackColor` series always
  runs the full scale from `min` and is drawn first, so segments sit on top of it in both layouts.
  With `max` omitted the scale ends at the longest segment in `overlap` and at the sum in `stack`,
  leaving no track to draw.
- `edge`: `curve` \| `flat`. Curved ends come from per-corner `itemStyle.borderRadius` — not
  `roundCap`, which also rounds the joints between segments. The filled run caps at its first and
  last *segment* (the track is excluded from that span) and the track caps at both of its own ends,
  so the two read as separate shapes.
  Two ECharts gotchas here, both invisible when every corner shares one radius (a pill), so they
  only bite `stack` + `curve`:
  1. The radius must be in **pixels** — a percentage silently resolves to zero on a *stacked* polar
     sector. Hence the ring band is measured and halved, and the ring is laid out before the series.
  2. Corner **order differs per coordinate system**: a cartesian bar takes
     `[top-left, top-right, bottom-right, bottom-left]` (start, end, end, start) but a polar sector
     takes `[start-inner, end-inner, start-outer, end-outer]` (start, end, start, end). It is not
     the cartesian ring order; reusing that caps the far end of the segment instead.
- Layout is measured, not reserved by constant: the legend's height/width is estimated from its
  labels, the grid is sized to the bar (a single category would otherwise center it in a tall plot
  area), the ring is scaled to fit what is left, and `packWithLegend` centers track + legend as one
  block so slack falls outside the pair. Hence no `mergeCartesianGridForLegend`, whose flat 84px /
  32% reserve is sized for full plots.
- Props: scale (`min`/`max`/`interval`, `axisLabelFormatter`), geometry (`thickness`,
  `innerRadius`/`outerRadius`, `startAngle`/`endAngle`), `centerText`, `tooltip`, `onSelect`.

## Gauges (`gauge/`)

Shared `BaseGaugeProps` in `gauge.types.ts`. Four separate components — not one enum-driven gauge:

- `SimpleGauge` — basic arc
- `DigitalGauge` — numeric readout style
- `SpeedometerGauge` — dial
- `RadialGauge` — circular scale

Each registers gauge-related ECharts modules independently.

## Geo (`geo/`)

- `GeoChart` — generic; may require `GeoMapJsonContext` for custom map JSON.
- `USChart` / `WorldChart` — presets using `us-states.json` / `world.json`.
- Tooltips: `useGeoItemTooltip`, geo-specific presets.
- Stories may use `d3-geo` in devDependencies for projections in docs only.

## Heatmap (`heatmap/`)

Matrix chart on **two category axes** (not `CartesianChartProps`). Extends `CommonChartProps` only.

- **Data**: `xAxisData: string[]`, `yAxisData: string[]`, `data: [xIndex, yIndex, value][]`.
- **Coloring**: cell colors use a hidden ECharts visual map (min/max auto-derived from data; gradient from `colors` / theme `series`).
- **Display**: `showLabel` (cell values), `showHighlighter`, `showXAxis`, `showYAxis`.
- **Tooltips**: `useHeatmapItemTooltip`, `createHeatmapTooltipPreset` — item tooltips with row/column labels.
- **Selection**: `onSelect` → `HeatmapChartSelectEvent` (`xIndex`, `yIndex`, `xLabel`, `yLabel`, `value`).
- **ECharts modules**: `HeatmapChart`, `VisualMapComponent`, `GridComponent`, `TooltipComponent`, `SkiaRenderer`.
- **Storybook**: `stories/heatmap/` — base stories plus `labels/`, `axes/`, `colors/`, `dimensions/`, `tooltip/`, `interaction/`.
- **Expo**: `expo-app/app/heatmap-chart.tsx`.

## WMX mirror (`wmx/chart/`)

One folder per Studio widget, e.g. `wmx/chart/line/`:

- `wmx.json` — Studio schema (props, events, marketplace metadata)
- `index.tsx` — re-exports built package symbol
- `icon.svg` — palette icon

Gauge variants live under `wmx/chart/gauge/<variant>/`. Run `npm run generate:wmx` after changing `wmx.json` or icons.

## Adding a new chart (checklist)

1. Add `components/chart/<name>/` with props, chart TSX, `index.ts`.
2. Extend `components/chart/index.ts` barrel.
3. Register ECharts modules minimally.
4. Apply `withResponsiveContainer(withChartTheme(...))`.
5. Add `stories/<name>/` with `meta.tsx`, `*.stories.tsx`, `*.args.ts`.
6. Add `wmx/chart/<name>/wmx.json` + thin `index.tsx` if Studio needs it.
7. Update `spec/01-overview.md` and `spec/03-chart-components.md` (and tooltip/architecture docs if behavior differs).
8. Run `npm run lint`, `npm run storybook` (spot-check), `npm run build:lib` before release.

## File naming conventions

- React components: `PascalCase` (`AreaChart`).
- Props files: `*-chart.props.ts`.
- Hooks: `use-*-tooltip.tsx`.
- Display names set via `Object.assign(Component, { displayName: '...' })` for debugging.
