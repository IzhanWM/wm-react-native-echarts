# 01 — Overview

## Purpose

`wm-react-native-echarts` is a **React Native chart library** published as `@wavemaker/react-native-echarts`. It wraps [Apache ECharts](https://echarts.apache.org/) for mobile via [`@wuba/react-native-echarts`](https://github.com/wuba/react-native-echarts) with the **Skia renderer** (`SkiaChart`, `SkiaRenderer`). Charts render as native Skia surfaces, not WebViews.

Consumers get declarative React components (`LineChart`, `PieChart`, etc.) with typed props, theming, React Native tooltips, and tap/`onSelect` handlers. WaveMaker Studio consumes the same charts through **WMX** widget packages under `wmx/`.

## Technology stack

| Layer | Package / tool |
|-------|----------------|
| UI | React 19, React Native 0.82 |
| Charts engine | `echarts` 6.x (tree-shaken per chart) |
| RN bridge | `@wuba/react-native-echarts` 3.x |
| Rendering | `@shopify/react-native-skia` (peer) |
| Vector extras | `react-native-svg` (peer) |
| Docs / spec UI | Storybook 10 + Vite (`react-native-web` shims) |
| Mobile sample | Expo Router app in `expo-app/` |
| Language | TypeScript 5.9 |

## Repository layout

```
wm-react-native-echarts/
├── components/chart/     # Library source (published after tsc)
├── components/ui-widgets/ # UI widgets library source (same npm package as charts)
├── components/wmx-context.md
├── stories/              # Storybook stories + MDX docs
├── wmx/chart/            # WaveMaker widget sources (wmx.json + thin re-exports)
├── wmx/ui-widgets/        # WaveMaker widget sources for the UI widgets
├── scripts/              # build-lib, prepare-npm, generate-wmx
├── expo-app/             # Expo demo (yalc-linked package)
├── assets/               # README gallery images
├── .storybook/           # Vite aliases, RN→web shims
├── dist/                 # Build output (gitignored): npm + wmx zips
└── spec/                 # This AI-oriented documentation set
```

## UI widgets in this repo

`components/ui-widgets/` builds and publishes alongside the charts, from the same
`@wavemaker/react-native-echarts` package — QR code, avatar stack, segment
progress, swipe deck, reorder list, signature pad and Skia effect. It shares this
repo's Storybook, WMX generator, Expo demo, and build pipeline, even though it
never imports ECharts and the charts never import it. Widget-only peer deps
(Skia, WebView) are declared optional so a chart-only consumer isn't forced to
install them. See [09-ui-widgets.md](./09-ui-widgets.md).

## Public API surface

- **Monorepo dev** imports: `@components/chart/...` (Storybook alias).
- **npm consumers** import from package entry or subpaths after build, e.g. `@wavemaker/react-native-echarts`, `@wavemaker/react-native-echarts/line`, `@wavemaker/react-native-echarts/avatarstack`.
- **Barrel export**: `components/chart/index.ts` re-exports all chart types, theme helpers, tooltips, and `ChartContainer` utilities; `components/ui-widgets/index.ts` re-exports every widget.

## Chart families (high level)

| Family | Components | ECharts series type |
|--------|------------|---------------------|
| Cartesian | Area, Line, Column, Bar, Scatter, Bubble, Candlestick | line, bar, scatter, candlestick |
| Matrix | HeatmapChart | heatmap |
| Polar / radial | Pie, Radial, Radar | pie, pie (polar), radar |
| Gauge | Simple, Digital, Speedometer, Radial | gauge |
| Geo | GeoChart, USChart, WorldChart | map / geo |

`LineChart` is a thin wrapper over `AreaChart` with `areaOpacity={0}`. `BubbleChart` extends scatter patterns.

## Data shapes (convention)

Most charts accept flexible `data` props documented on `*.props.ts` files:

- **Single series**: `number[]` or `[x, y][]` tuples.
- **Multi series**: `{ name?: string; data: ... }[]`.
- **Pie**: `PieDataItem[]` or concentric `PieRingData[]` (see `isConcentricPieData`).
- **Geo**: region/value pairs with bundled GeoJSON (`world.json`, `us-states.json`).
- **Heatmap**: `xAxisData` / `yAxisData` category labels; `data` as `[xIndex, yIndex, value]` tuples.

Charts normalize input in `useMemo` before building ECharts `option` objects.

## Peer dependencies (apps must install)

`react`, `react-native`, `@shopify/react-native-skia`, `react-native-svg`, `zrender`, plus the library’s direct deps `echarts` and `@wuba/react-native-echarts`. See root README for a known **echarts compile workaround** (linked GitHub issues).

## Versioning

Root `package.json` `version` (e.g. `1.0.0-dev.11`) flows into WMX manifests and the prepared npm package under `dist/npm-packages/charts/`.

## What this repo is not

- Not a fork of ECharts — configuration is generated in TSX, not arbitrary option JSON from consumers (unless extended).
- Not a web-only chart lib — Storybook uses `react-native-web` for browser preview; native behavior is validated via Expo.
- `spec/` files are documentation only; they do not execute in CI unless separately wired.
