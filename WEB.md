# Using @wavemaker/react-native-echarts on the Web

These are React Native components, but they render in a browser too — this repo's own
[Storybook](https://wavemaker.github.io/wm-react-native-echarts) is a live example (`npm run storybook`,
config in `.storybook/main.ts`). This doc shows how to reproduce that setup in your own web app.

## How rendering on web works

Chart components render onto whatever the underlying `@wuba/react-native-echarts` package gives them:

- **Native (iOS/Android):** `SkiaChart` + `SkiaRenderer`, backed by `@shopify/react-native-skia` (GPU canvas).
- **Web:** the same import resolves to `@wuba/react-native-echarts`'s `.web.tsx`/`.web.ts` files instead —
  `SkiaChart` becomes a plain `<div>` and `SkiaRenderer` registers zrender's SVG painter under the name
  `'skia'`. **`@shopify/react-native-skia` is never imported on web** — it's declared as an
  [optional peer dependency](package.json) and you can skip installing it.

This swap is automatic — it's not something this library's components do explicitly. It relies on your
bundler resolving `.web.*` files ahead of the platform-agnostic ones when bundling for the browser, the
same way Metro does for React Native. `View`, `Text`, `StyleSheet`, and `react-native-svg` (used directly
by the digital gauge) don't need this treatment — they already have first-class `react-native-web`
implementations.

## 1. Install

```bash
npm install @wavemaker/react-native-echarts
npm install react react-native react-native-web @wuba/react-native-echarts echarts@6.0.0 zrender@6.0.0 react-native-svg
```

You do **not** need `@shopify/react-native-skia` for a web-only build.

`react-native-web` is what actually runs in the browser — the bundler config below aliases every
`from 'react-native'` import to it. The real `react-native` package still needs to be **installed**
even though none of its code runs on web: `@wuba/react-native-echarts` and `react-native-svg` both
declare it as a peer dependency (so its absence triggers unmet-peer warnings, or hard failures under
stricter peer-dep resolution), and this library's own `.d.ts` files reference RN types like
`LayoutChangeEvent` that TypeScript needs to resolve.

## 2. Configure your bundler to prefer `.web.*` files

### Vite

```ts
// vite.config.ts
export default {
  resolve: {
    extensions: ['.web.js', '.web.jsx', '.web.ts', '.web.tsx', '.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    alias: { 'react-native': 'react-native-web' },
  },
  optimizeDeps: {
    exclude: ['react-native', '@shopify/react-native-skia'],
    esbuildOptions: {
      resolveExtensions: ['.web.js', '.web.jsx', '.web.ts', '.web.tsx', '.js', '.jsx', '.ts', '.tsx'],
    },
  },
};
```

Use `.storybook/main.ts` in this repo as the reference — it's the exact config this project's own
web build uses, including shims for a couple of RN internals (`codegenNativeComponent`,
`PressabilityDebug`) that don't exist in `react-native-web` (see `.storybook/shims/`). Copy those shims
if your RN/react-native-web version combination hits the same gap.

### Webpack (CRA, custom configs)

```js
module.exports = {
  resolve: {
    extensions: ['.web.js', '.web.tsx', '.js', '.jsx', '.ts', '.tsx'],
    alias: { 'react-native$': 'react-native-web' },
  },
};
```

### Next.js

```js
// next.config.js
module.exports = {
  transpilePackages: ['@wavemaker/react-native-echarts', '@wuba/react-native-echarts', 'react-native-web'],
  webpack(config) {
    config.resolve.extensions = ['.web.js', '.web.tsx', ...config.resolve.extensions];
    config.resolve.alias['react-native$'] = 'react-native-web';
    return config;
  },
};
```

### Expo web / Metro

Nothing to do — Metro resolves `.web.js` by platform automatically.

## 3. Use it like any other component

```tsx
import { LineChart } from '@wavemaker/react-native-echarts';

export default function Page() {
  return <LineChart data={[10, 20, 15, 30]} width={400} height={300} />;
}
```

Props, theming, and tooltips behave the same on web as on native — see the main [README](README.md) and
Storybook for the full API.

## Known issue

`echarts` has an open compile issue that can break some web bundlers; see
[apache/echarts#20485](https://github.com/apache/echarts/pull/20485) and the workaround in
[wuba/react-native-echarts#239](https://github.com/wuba/react-native-echarts/issues/239#issuecomment-2899678660).

## Limitations

- This is a `react-native-web` setup, not a plain-React-DOM one — `View`/`Text`/`react-native-svg` are
  still dependencies. There's no build of these components that drops `react-native-web` entirely.
- On web, charts render through zrender's SVG painter rather than the GPU-accelerated Skia canvas used on
  native. Visuals match, but very large datasets may perform differently than on native.
