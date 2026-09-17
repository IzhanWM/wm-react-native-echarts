# wm-react-native-echarts — AI project spec

Documentation for agents and humans who need to understand this repository **without reading every source file**. These files describe architecture, conventions, and where to change behavior. They are **not** automated tests or Storybook specs.

## How to use this spec

1. Start with [01-overview.md](./01-overview.md) for purpose, stack, and repo layout.
2. Read [02-architecture.md](./02-architecture.md) before touching chart implementation.
3. Use [03-chart-components.md](./03-chart-components.md) to find the right chart module and inheritance chain.
4. Use [04-theming-props.md](./04-theming-props.md) for shared props and theme APIs.
5. Use [05-tooltips-interaction.md](./05-tooltips-interaction.md) for tooltips, legends, and `onSelect`.
6. Use [06-build-wmx-publish.md](./06-build-wmx-publish.md) for npm/WMX packaging.
7. Use [07-storybook-development.md](./07-storybook-development.md) for verification and local dev.
8. Read [08-spec-based-development-readiness.md](./08-spec-based-development-readiness.md) — **are we ready to start spec-based dev?** (yes, with two layers).
9. Use [09-ui-widgets.md](./09-ui-widgets.md) for the UI widgets that publish alongside the charts in this repo.

## File index

| File | Topics | Max lines |
|------|--------|-----------|
| [01-overview.md](./01-overview.md) | Product, dependencies, directory map | ≤200 |
| [02-architecture.md](./02-architecture.md) | ECharts+Skia pipeline, HOCs, data flow | ≤200 |
| [03-chart-components.md](./03-chart-components.md) | Chart types, exports, specialization | ≤200 |
| [04-theming-props.md](./04-theming-props.md) | `ChartTheme`, prop hierarchy | ≤200 |
| [05-tooltips-interaction.md](./05-tooltips-interaction.md) | Axis vs item tooltips, events | ≤200 |
| [06-build-wmx-publish.md](./06-build-wmx-publish.md) | `build:lib`, WMX zips, npm | ≤200 |
| [07-storybook-development.md](./07-storybook-development.md) | Stories, Expo app, commands | ≤200 |
| [08-spec-based-development-readiness.md](./08-spec-based-development-readiness.md) | Readiness: `spec/` + Storybook | ≤200 |
| [09-ui-widgets.md](./09-ui-widgets.md) | UI widgets, platform split, WMX | ≤200 |

## Constraints for agents

- **Do not change source code** when the task is spec-only (e.g. AID-16).
- Prefer **spec-based development** for features: add/update a Storybook story first, then implement.
- Published package name: `@wavemaker/react-native-echarts` (charts and UI widgets both).
- Library source roots: `components/chart/` and `components/ui-widgets/` both compile into `dist/npm-packages/charts/`.
- Charts and UI widgets share one version, but neither imports the other.
- Branch naming for Paperclip work: `feat/AID-<n>-<slug>`.

## Related human docs

- Root [README.md](../README.md) — install, gallery, maintainer build steps.
- [components/wmx-context.md](../components/wmx-context.md) — WMX JSON schema field reference.
- Live Storybook: https://wavemaker.github.io/wm-react-native-echarts
