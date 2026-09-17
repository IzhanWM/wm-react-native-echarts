# 09 — UI widgets

A component library lives beside the charts in this repo and publishes together
with them as part of **`@wavemaker/react-native-echarts`**. It shares the repo's
tooling — Storybook, the WMX generator, the Expo demo, the build/publish
pipeline — and ships in the same package, so there is one dependency to install
and one version line, even though nothing in `components/ui-widgets/` imports
ECharts and nothing in `components/chart/` imports a widget.

| | Charts | UI widgets |
|---|---|---|
| Package | `@wavemaker/react-native-echarts` | `@wavemaker/react-native-echarts` |
| Source | `components/chart/` | `components/ui-widgets/` |
| Output | `dist/npm-packages/charts/` | `dist/npm-packages/charts/` |
| tsconfig | `tsconfig.lib.json` | `tsconfig.lib-widgets.json` |
| Build | `npm run generate:package` | `npm run generate:package` |
| WMX | `wmx/chart/` | `wmx/ui-widgets/` |
| Stories | `stories/<chart>/` | `stories/ui-widgets/<widget>/` |
| Version source | root `package.json` | root `package.json` |

Widget-only peer dependencies (`@shopify/react-native-skia`,
`react-native-webview`) are declared **optional** on the published package, so a
chart-only consumer is not forced to install them.

`npm run build:lib` runs both tsconfigs into the same `dist/npm-packages/charts/`
so each side keeps its own flat subpath layout (`.../line`, `.../avatarstack`,
no `chart/`/`ui-widgets/` prefix), then merges the two barrels' `index.js` /
`index.d.ts` output instead of letting the second pass overwrite the first — see
`scripts/build-lib.js`. `components/ui-widgets/widget-props/common.ts` (not
`props/common.ts`) avoids colliding with the chart package's own `props/common.ts`
in that shared output directory.

## The widgets

| Widget | Folder | Drawing layer |
|---|---|---|
| `QrCode` | `qrcode/` | `react-native-qrcode-svg` → `react-native-svg` |
| `AvatarStack` | `avatarstack/` | Core React Native views |
| `SegmentProgress` | `segmentprogress/` | `react-native-svg` |
| `SwipeDeck` | `swipedeck/` | Gesture Handler + Reanimated |
| `ReorderList` | `reorderlist/` | `react-native-reorderable-list` |
| `SignaturePad` | `signaturepad/` | WebView canvas (native) / SVG + canvas (web) |
| `SkiaEffect` | `skiaeffect/` | `@shopify/react-native-skia` / CSS (web) |

## Folder convention

Mirrors the chart convention, minus the theme and container HOCs (widgets are not
chart-themed and size themselves from props or their parent):

```
components/ui-widgets/<widget>/
├── <widget>.props.ts    # public TypeScript API — source of truth for wmx.json
├── <widget>.tsx         # implementation
├── <widget>.web.tsx     # web implementation, only where one is needed
└── index.ts             # exports
```

Shared pieces:

| File | Role |
|---|---|
| `utils/dataset.ts` | `toRows`, `rowField`, `rowKey` — Studio dataset normalization |
| `widget-props/common.ts` | `CommonWidgetProps`, `DatasetWidgetProps` |
| `index.ts` | Barrel re-exporting every widget |

## Dataset normalization

Studio binds `dataset` from a variable, a live variable, or a static JSON string,
so `toRows` accepts an array, a JSON string, or a `{ dataSet }` / `{ content }` /
`{ data }` wrapper, and returns `[]` for anything else. It never throws — a widget
bound to a not-yet-resolved variable renders its empty state. Every dataset-backed
widget funnels its `dataset` prop through it.

## Platform strategy

Five widgets are one implementation on all three platforms. Two are not, and both
use **platform file extensions** rather than a runtime `Platform.OS` branch — the
bundler picks the file, so the platform-specific dependency never enters the other
bundle at all.

| Widget | Why web differs | Web implementation |
|---|---|---|
| `SignaturePad` | `react-native-signature-canvas` needs a WebView; `react-native-webview` has no web build | `PanResponder` + SVG strokes, rasterized to PNG via a detached 2-D canvas |
| `SkiaEffect` | Skia on web needs the host to load the CanvasKit WASM bundle first | CSS `filter: blur()` + `mix-blend-mode`, which map one-to-one onto Skia's `Blur` and `blendMode` |

Both keep the same props, events and `ref` handle. `SignaturePad` returns the same
`data:image/png;base64,…` string on both, so consumer code never branches.

Known differences, documented in the props JSDoc and the manifests:

- `SignaturePad` on web uses one stroke width (the mean of `minWidth`/`maxWidth`);
  native tapers with pointer speed.
- `ReorderList` runs on web — `react-native-reorderable-list` declares no native
  modules — but upstream tests iOS and Android only. Best-effort on web.

`SwipeDeck` and `ReorderList` require a `GestureHandlerRootView` above them on
every platform, including web. Both also sit on `react-native-reanimated` v4,
which needs a Babel/SWC worklets transform this repo's Vite-based Storybook has
no step to run, so their stories are excluded from Storybook rather than shown
broken — exercise them on iOS/Android, or in a web build that runs Babel with
`babel-preset-expo` (Metro or webpack configured the same way).

## WMX widgets

`wmx/ui-widgets/<name>/` carries `wmx.json`, a thin `index.tsx`, and `icon.svg` —
the same flat-manifest format the charts use, so `npm run generate:wmx` discovers
them with no change to the generator. Studio names are prefixed `WMUI`
(`WMUIQrCode`, `WMUISwipeDeck`, …); zips land in `dist/wmx/charts/` beside the
chart widgets.

Icons follow the chart convention: 24×24 viewBox, `#bfbfbf` strokes, transparent
background.

## Adding a widget (checklist)

1. Add `components/ui-widgets/<name>/` with props, implementation, `index.ts`.
2. Add a `<name>.web.tsx` **only** if a dependency cannot reach web — and keep the
   public contract identical.
3. Extend `components/ui-widgets/index.ts`.
4. Add `stories/ui-widgets/<name>/` with `meta.tsx`, `<name>.args.ts`, a base
   story, and feature-slice subfolders. Use `widgetDecorator({ gestures: true })`
   for anything with a pan or long-press recogniser.
5. Add `wmx/ui-widgets/<name>/` with `wmx.json`, `index.tsx`, `icon.svg`.
6. Add an `expo-app/app/<name>-widget.tsx` screen and register it in `_layout.tsx`
   and the `uiWidgets` list in `index.tsx`.
7. Update the tables in this file, the README, and
   `stories/ui-widgets/platform-support.md`.
8. Run `npm run lint`, `npm run build:lib`, and spot-check the story.

## Verification

| Change type | Minimum verification |
|---|---|
| Widget logic | `npm run lint`, `npm run build:lib` |
| Public API/types | `build:lib` + inspect `dist/npm-packages/charts/*.d.ts` |
| Platform split | Storybook (web path) **and** the Expo screen (native path) |
| WMX manifest | `npm run generate:wmx`, confirm the zip appears |
