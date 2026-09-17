# 06 — Build, WMX, and publish

## npm package pipeline

Charts (`components/chart/`) and UI widgets (`components/ui-widgets/`) compile
and publish together as a single package, **`@wavemaker/react-native-echarts`**.
Platform variants compile to `*.web.js` beside their native sibling, so the
published package keeps the same per-platform resolution the source has.

| Script | Command | Output |
|--------|---------|--------|
| Compile library | `npm run build:lib` | `dist/npm-packages/charts/` via `tsc -p tsconfig.lib.json` + `tsc -p tsconfig.lib-widgets.json` |
| Prepare package.json | `npm run prepare:npm` | Writes `package.json`, copies README into dist |
| Both | `npm run generate:package` | `build:lib` + `prepare:npm` |
| Publish | `npm run publish:npm` | Only when explicitly authorized; runs publish in dist |

### tsconfig.lib.json / tsconfig.lib-widgets.json

`build-lib.js` runs both configs into the **same** `outDir` so chart and widget
subfolders both land flat at the package root — no `chart/`/`ui-widgets/` prefix —
giving subpath imports like `@wavemaker/react-native-echarts/line` and
`@wavemaker/react-native-echarts/qrcode`. Each config's `rootDir` is scoped to its
own source tree (`components/chart` / `components/ui-widgets`) so files from one
tree don't trip a `rootDir` violation in the other's compile.

Since both source trees have their own top-level `index.ts`, and both would
otherwise compile to the same `index.js`/`index.d.ts` at the shared package root,
`build-lib.js` runs the charts pass first, sets its `index.js`/`index.d.ts`
aside, runs the widgets pass, then concatenates the two so the published entry
re-exports both barrels. `components/ui-widgets/widget-props/common.ts` is named
that way (not `props/common.ts`) to avoid colliding with the chart package's own
`props/common.ts` in that shared output directory.

- `outDir` (both): `dist/npm-packages/charts`
- `declaration`: true
- Excludes: `wmx/**`, stories, tests (chart config also excludes `theme-toggle.tsx`)

### prepare-npm-package.js

- Reads root `package.json` for name `@wavemaker/react-native-echarts`, version, metadata.
- Declares chart runtime deps (`@wuba/react-native-echarts`, `echarts`, `zrender`) and
  UI-widget runtime deps (`react-native-qrcode-svg`, `react-native-reorderable-list`,
  `react-native-signature-canvas`) as `dependencies`.
- Declares `@shopify/react-native-skia` and `react-native-webview` as **optional**
  peer dependencies (only needed by `SkiaEffect` / native `SignaturePad`), plus
  `react-native-svg`, `react-native-gesture-handler`, `react-native-reanimated`.
- Copies README and sets `files` field for npm pack.

**Agents:** do not run `publish:npm` unless the task authorizes release and credentials exist in Paperclip secrets.

## WMX widget pipeline

| Script | Command | Output |
|--------|---------|--------|
| Generate zips | `npm run generate:wmx` | `dist/wmx/charts/*.zip` (default) |

Script: `scripts/generate-wmx.js`

1. Walks `wmx/**/wmx.json` — this covers `wmx/chart/` and `wmx/ui-widgets/` with no change to the script.
2. Splits flat manifest into npm `package.json` fields vs WMX body (see `WMX_BODY_KEYS` in script).
3. Bundles `index.tsx`, `icon.svg`, generated manifests into a zip per widget.
4. Optional `--o=<dir>` copies zips elsewhere.

Schema reference: `components/wmx-context.md` (component, property, event, style schemas).

### wmx.json contents

- Identity: `name`, `displayName`, `description`, `iconUrl`, `webSupport`
- `props`, `events`, `styles` maps for WaveMaker Studio
- `dependencies` pinning `@wavemaker/react-native-echarts` version (chart and UI
  widget manifests alike)
- `marketplace` carousel/thumbnail URLs (often Storybook deep links)
- `group` e.g. `chart/line` or `ui-widgets/avatarstack`

### wmx index.tsx

Thin re-export from built package subpath, e.g.:

`import { LineChart } from '@wavemaker/react-native-echarts/line'`
`import { AvatarStack } from '@wavemaker/react-native-echarts/avatarstack'`

Studio consumes the zip; runtime app depends on the npm library.

## dist/ layout (typical)

```
dist/
├── npm-packages/charts/  # Publishable @wavemaker/react-native-echarts (charts + UI widgets)
└── wmx/charts/           # *.zip widgets (chart and UI widget zips both land here)
```

`dist/` is build output — not committed.

## Version alignment

Charts and UI widgets ship in one package and version **together**:

1. Root `package.json` `version`
2. Each `wmx/chart/**/wmx.json` and `wmx/ui-widgets/**/wmx.json` `version` and
   `dependencies['@wavemaker/react-native-echarts']`
3. Regenerate WMX zips after version bumps

## Local linking (Expo demo)

From README:

```bash
npm install -g yalc
npm run generate:package   # from repo root
cd expo-app && npm install
npx expo start
```

After library changes under `components/chart/`, rerun `npm run generate:package` so yalc consumers update.

## CI-oriented checks (library changes)

| Change type | Minimum verification |
|-------------|----------------------|
| TS/chart logic | `npm run lint`, `npm run build:lib` |
| Public API/types | `build:lib` + inspect `dist/.../*.d.ts` |
| Story/docs | `npm run build-storybook` |
| Native integration | Expo app manual spot-check |

## Scripts directory

| File | Role |
|------|------|
| `build-lib.js` | mkdir dist, run tsc (charts + UI widgets) |
| `prepare-npm-package.js` | npm metadata in dist (charts + UI widgets) |
| `generate-wmx.js` | WMX zip generation |
| `reset-project.js` | Expo template utility (not library build) |

## Security

Never commit npm tokens, `.npmrc` auth, or customer data. Escalate publish credentials to CEO/Paperclip secrets workflow.
