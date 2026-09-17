# 07 — Storybook and development

## Storybook role

Storybook is the **spec and documentation surface** for chart behavior. Stories define expected visuals and prop combinations before or alongside implementation. Deployed site: https://wavemaker.github.io/wm-react-native-echarts

Config: `.storybook/main.ts` (Vite + `@storybook/react-vite`).

### Key Vite aliases

| Alias | Path |
|-------|------|
| `@` | repo root |
| `@components` | `components/` |
| `@stories` | `stories/` |
| `react-native` | `react-native-web` |

Shims under `.storybook/shims/` stub RN internals missing on web. Skia is excluded from `optimizeDeps` — charts still run via web-compatible paths in Storybook.

Stories glob: `stories/**/*.mdx`, `stories/**/*.stories.@(js|jsx|mjs|ts|tsx)`.

## Story folder conventions

Per chart type under `stories/<chart>/`:

| File | Purpose |
|------|---------|
| `meta.tsx` | Default export Meta: `title`, `component`, `argTypes`, decorators |
| `<chart>.args.ts` | Shared `argTypes` / default args (`lineChartArgTypes`) |
| `<chart>.stories.tsx` | Primary “default” story |
| Subfolders | Feature slices: `tooltip/`, `legend/`, `colors/`, `interaction/`, etc. |

Title pattern: `Charts/<ChartName>/...`, `UI Widgets/<WidgetName>/...`, or `Examples/...` for composite demos.

UI widget stories live under `stories/ui-widgets/<widget>/` and follow the same
shape, sharing `stories/ui-widgets/widget-decorator.tsx` (padded container, optional
source snippet, optional `GestureHandlerRootView`) and `stories/ui-widgets/sample-data.ts`.
See `spec/09-ui-widgets.md`.

Introduction docs: `stories/introduction/*.mdx` (getting started, concepts, license).

Theming: `stories/theming/` with MDX + examples.

### Decorator pattern

Many metas wrap stories in a padded `View` and optionally show a **source** snippet from `context.parameters.source` for copy-paste examples.

## Commands

| Task | Command |
|------|---------|
| Install | `npm install` (repo root) |
| Dev Storybook | `npm run storybook` → http://localhost:6006 |
| Build static SB | `npm run build-storybook` |
| Deploy SB to GitHub Pages | `npm run deploy-storybook` |
| Lint | `npm run lint` |
| Expo (root scripts) | `npm run start` / `android` / `ios` / `web` |

## Expo sample app (`expo-app/`)

- Expo Router screens under `expo-app/app/` — one route per chart family (`line-chart.tsx`, `pie-chart.tsx`, `heatmap-chart.tsx`, …) and one per UI widget (`qr-code-widget.tsx`, `swipe-deck-widget.tsx`, …).
- Widget screens are the **only** way to exercise the native code paths of `SignaturePad` and `SkiaEffect`; Storybook always runs their web implementations.
- Consumes library through **yalc** after `npm run generate:package` from monorepo root.
- `expo-app/contexts/ThemeContext.tsx` — app-level light/dark (separate from `ChartThemeProvider`).

Use Expo for native Skia/gesture verification; use Storybook for fast iteration and deployed docs.

## Spec-based development workflow

For non-trivial features or bugs:

1. Add or update a story (or MDX) describing expected behavior.
2. Implement in `components/chart/`.
3. Record verification on the issue: commands run + Storybook story id/path.

A change without a story is incomplete unless the task exempts it (typos, spec-only docs).

## Agent verification checklist

| Scope | Action |
|-------|--------|
| Doc/spec only | Confirm `spec/*.md` line counts ≤200; no source edits |
| Component change | `npm run lint` + relevant story path |
| Release/docs deploy | `npm run build-storybook` |
| API surface | `npm run build:lib` (charts + widgets) |
| Platform-split widget | Storybook (web path) **and** the Expo screen (native path) |

## Branch naming

Paperclip / team convention: `feat/AID-<issue-number>-<short-slug>` (e.g. `feat/AID-16-create-spec`).

## Related paths quick reference

```
stories/line/line.stories.tsx     → Charts/Line default
stories/introduction/             → MDX onboarding
components/chart/line/            → implementation
wmx/chart/line/wmx.json           → Studio manifest
```

When fixing a bug reported against a Storybook URL, parse the `path=/story/...` segment to find the matching `stories/` file.
