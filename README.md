# @wavemaker/react-native-echarts

[![npm package](https://img.shields.io/npm/v/%40wavemaker%2Freact-native-echarts)](https://www.npmjs.com/package/@wavemaker/react-native-echarts)
[![MIT License](https://img.shields.io/github/license/wavemaker/wm-react-native-echarts)](https://github.com/wavemaker/wm-react-native-echarts/blob/main/LICENSE)

[![npm downloads](https://img.shields.io/npm/dm/%40wavemaker%2Freact-native-echarts)](https://www.npmjs.com/package/@wavemaker/react-native-echarts)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://github.com/wavemaker/wm-react-native-echarts)
[![Storybook](https://img.shields.io/badge/Storybook-FF4785?logo=storybook&logoColor=white)](https://wavemaker.github.io/wm-react-native-echarts)

React Native chart components built with ECharts (via `@wuba/react-native-echarts`) and Skia. Works with Expo and bare React Native. Visit storybook at https://wavemaker.github.io/wm-react-native-echarts for more details on how to use and examples.

## Installation

Install the package from npm:

```bash
npm install @wavemaker/react-native-echarts
```

The library declares peer dependencies. Add any your app does not already include (align versions with your React Native or Expo SDK):

```bash
npm install @shopify/react-native-skia @wuba/react-native-echarts echarts@6.0.0 zrender@6.0.0 react-native-svg
```

`react` and `react-native` are also peers; they should already be present in your app.

**Note**:
There is an issue with echarts library. Due to which compilation fails with an error. Here is the link to the issue.
https://github.com/apache/echarts/pull/20485

Till the issue is fixed, follow the workaround mentioned in the below link.
https://github.com/wuba/react-native-echarts/issues/239#issuecomment-2899678660

## Chart gallery

Preview thumbnails for the chart examples in `assets/images/charts`. Each image uses the same width and height (200×200) so the layout stays even; `object-fit: contain` keeps aspect ratios readable.

### Area

<table>
  <tbody>
    <tr>
      <td align="center">
        <a href="https://wavemaker.github.io/wm-react-native-echarts/?path=/story/examples-area--axes-area" target="_blank">
          <img src="assets/images/charts/area/default.png" width="200" height="200" alt="Default" style="object-fit: contain;" />
          <br />
          <sub>Default</sub>
        </a>
      </td>
      <td align="center">
        <a href="https://wavemaker.github.io/wm-react-native-echarts/?path=/story/examples-area--area-without-axes" target="_blank">
          <img src="assets/images/charts/area/without-axes.png" width="200" height="200" alt="Witout axes" style="object-fit: contain;" /><br /><sub>Witout axes</sub>
        </a>
      </td>
      <td align="center">
        <a href="https://wavemaker.github.io/wm-react-native-echarts/?path=/story/examples-area--gradient-area" target="_blank">
          <img src="assets/images/charts/area/with-gradient-bg.png" width="200" height="200" alt="With Gradient Bg" style="object-fit: contain;" /><br /><sub>With Gradient Bg</sub>
        </a>
      </td>
    </tr>
  </tbody>
</table>

### Bar

<table>
  <tbody>
    <tr>
      <td align="center">
        <a href="https://wavemaker.github.io/wm-react-native-echarts/?path=/story/examples-bar--horizontal-bar" target="_blank">
          <img src="assets/images/charts/bar/horizontal-bar.png" width="200" height="200" alt="Horizontal bar chart" style="object-fit: contain;" /><br /><sub>horizontal-bar</sub>
        </a>
      </td>
      <td align="center">
        <a href="https://wavemaker.github.io/wm-react-native-echarts/?path=/story/examples-bar--custom-label-bar">
          <img src="assets/images/charts/bar/labeled-bar.png" width="200" height="200" alt="Labeled bar chart" style="object-fit: contain;" /><br /><sub>labeled-bar</sub>
        </a>
      </td>
      <td align="center">
        <a href="https://wavemaker.github.io/wm-react-native-echarts/?path=/story/examples-bar--mixed-bar" target="_blank">
          <img src="assets/images/charts/bar/mixed-bar.png" width="200" height="200" alt="Mixed bar chart" style="object-fit: contain;" /><br /><sub>mixed-bar</sub>
        </a>
      </td>
    </tr>
  </tbody>
</table>

### Bubble

<table>
  <tbody>
    <tr>
      <td align="center">
        <a href="https://wavemaker.github.io/wm-react-native-echarts/?path=/story/charts-bubble--default" target="_blank">
          <img src="assets/images/charts/bubble/default.png" width="200" height="200" alt="Bubble chart default" style="object-fit: contain;" /><br /><sub>default</sub>
        </a>
      </td>
      <td align="center">
        <a href="https://wavemaker.github.io/wm-react-native-echarts/?path=/story/charts-bubble--show-legend">
          <img src="assets/images/charts/bubble/multi-bubble.png" width="200" height="200" alt="Multi bubble chart" style="object-fit: contain;" /><br /><sub>multi-bubble</sub>
        </a>
      </td>
      <td align="center">
        <a href="https://wavemaker.github.io/wm-react-native-echarts/?path=/story/charts-bubble-symbol--pin" target="_blank">
          <img src="assets/images/charts/bubble/pin-bublbe.png" width="200" height="200" alt="Bubble chart with pin" style="object-fit: contain;" /><br /><sub>pin-bublbe</sub>
        </a>
      </td>
    </tr>
  </tbody>
</table>

### Candlestick

<table>
  <tbody>
    <tr>
      <td align="center">
        <a href="https://wavemaker.github.io/wm-react-native-echarts/?path=/story/charts-candlestick--default" target="_blank">
          <img src="assets/images/charts/candle-stick/default.png" width="200" height="200" alt="Candlestick default" style="object-fit: contain;" /><br /><sub>default</sub>
        </a>
      </td>
      <td align="center">
        <a href="https://wavemaker.github.io/wm-react-native-echarts/?path=/story/charts-candlestick--with-moving-average" target="_blank">
          <img src="assets/images/charts/candle-stick/with-ma.png" width="200" height="200" alt="Candlestick with moving average" style="object-fit: contain;" /><br /><sub>with-ma</sub>
        </a>
      </td>
      <td align="center">
        <a href="https://wavemaker.github.io/wm-react-native-echarts/?path=/story/charts-candlestick--with-volume">
          <img src="assets/images/charts/candle-stick/with-volume.png" width="200" height="200" alt="Candlestick with volume"  style="object-fit: contain;" /><br /><sub>with-volume</sub>
        </a>
      </td>
    </tr>
  </tbody>
</table>

### Column

<table>
  <tbody>
    <tr>
      <td align="center">
        <a href="https://wavemaker.github.io/wm-react-native-echarts/?path=/story/examples-column--active-column">
          <img src="assets/images/charts/column/active-column.png" width="200" height="200" alt="Active column chart" style="object-fit: contain;" /><br /><sub>active-column</sub>
        </a>
      </td>
      <td align="center">
        <a href="https://wavemaker.github.io/wm-react-native-echarts/?path=/story/examples-column--multiple-series">
          <img src="assets/images/charts/column/multi-series.png" width="200" height="200" alt="Multi-series column chart" style="object-fit: contain;" /><br /><sub>multi-series</sub>
        </a>
      </td>
      <td align="center">
        <a href="https://wavemaker.github.io/wm-react-native-echarts/?path=/story/examples-column--standard-column">
          <img src="assets/images/charts/column/standard.png" width="200" height="200" alt="Standard column chart" style="object-fit: contain;" /><br /><sub>standard</sub>
        </a>
      </td>
    </tr>
  </tbody>
</table>

### Geo

<table>
  <tbody>
    <tr>
      <td align="center">
        <a href="https://wavemaker.github.io/wm-react-native-echarts/?path=/story/charts-geo-colors--custom-colors" target="_blank">
          <img src="assets/images/charts/geo/colors.png" width="200" height="200" alt="Geo chart colors" style="object-fit: contain;" /><br /><sub>colors</sub>
        </a>
      </td>
      <td align="center">
        <a href="https://wavemaker.github.io/wm-react-native-echarts/?path=/story/charts-geo--default" target="_blank">
          <img src="assets/images/charts/geo/default.png" width="200" height="200" alt="Geo chart default" style="object-fit: contain;" /><br /><sub>default</sub>
        </a>
      </td>
      <td align="center">
        <a href="https://wavemaker.github.io/wm-react-native-echarts/?path=/story/charts-geo-map--presidential-results" target="_blank">
          <img src="assets/images/charts/geo/us-map.png" width="200" height="200" alt="US map geo chart" style="object-fit: contain;" /><br /><sub>us-map</sub>
        </a>
      </td>
    </tr>
  </tbody>
</table>

### Heatmap

<table>
  <tbody>
    <tr>
      <td align="center">
        <a href="https://wavemaker.github.io/wm-react-native-echarts/?path=/story/charts-heatmap--default" target="_blank">
          <img src="assets/images/charts/heatmap/default.png" width="200" height="200" alt="Heatmap default" style="object-fit: contain;" /><br /><sub>default</sub>
        </a>
      </td>
      <td align="center">
        <a href="https://wavemaker.github.io/wm-react-native-echarts/?path=/story/charts-heatmap-labels--with-cell-labels" target="_blank">
          <img src="assets/images/charts/heatmap/with-cell-labels.png" width="200" height="200" alt="Heatmap with cell labels" style="object-fit: contain;" /><br /><sub>with-cell-labels</sub>
        </a>
      </td>
      <td align="center">
        <a href="https://wavemaker.github.io/wm-react-native-echarts/?path=/story/charts-heatmap-colors--custom-colors" target="_blank">
          <img src="assets/images/charts/heatmap/custom-colors.png" width="200" height="200" alt="Heatmap custom colors" style="object-fit: contain;" /><br /><sub>custom-colors</sub>
        </a>
      </td>
    </tr>
  </tbody>
</table>

### Gauge

<table>
  <tbody>
    <tr>
      <td align="center">
        <a href="https://wavemaker.github.io/wm-react-native-echarts/?path=/story/charts-gauge-digital--default" target="_blank">
          <img src="assets/images/charts/guage/digital.png" width="200" height="200" alt="Digital gauge" style="object-fit: contain;" /><br /><sub>digital</sub>
        </a>
      </td>
      <td align="center">
        <a href="https://wavemaker.github.io/wm-react-native-echarts/?path=/story/charts-gauge-radial--custom-scale" target="_blank">
          <img src="assets/images/charts/guage/radial.png" width="200" height="200" alt="Radial gauge" style="object-fit: contain;" /><br /><sub>radial</sub>
        </a>
      </td>
      <td align="center">
        <a href="https://wavemaker.github.io/wm-react-native-echarts/?path=/story/charts-gauge-simple--default" target="_blank">
          <img src="assets/images/charts/guage/simple.png" width="200" height="200" alt="Simple gauge" style="object-fit: contain;" /><br /><sub>simple</sub>
        </a>
      </td>
    </tr>
  </tbody>
</table>

### Line

<table>
  <tbody>
    <tr>
      <td align="center">
        <a href="https://wavemaker.github.io/wm-react-native-echarts/?path=/story/examples-line--multiple-series" target="_blank">
          <img src="assets/images/charts/line/multi-line.png" width="200" height="200" alt="Multi-line chart" style="object-fit: contain;" /><br /><sub>multi-line</sub>
        </a>
      </td>
      <td align="center">
        <a href="https://wavemaker.github.io/wm-react-native-echarts/?path=/story/examples-line--axes-line" target="_blank">
          <img src="assets/images/charts/line/standard-line.png" width="200" height="200" alt="Standard line chart" style="object-fit: contain;" /><br /><sub>standard-line</sub>
        </a>
      </td>
      <td align="center">
        <a href="https://wavemaker.github.io/wm-react-native-echarts/?path=/story/examples-line--default-line" target="_blank">
          <img src="assets/images/charts/line/trend-line.png" width="200" height="200" alt="Trend line chart" style="object-fit: contain;" /><br /><sub>trend-line</sub>
        </a>
      </td>
    </tr>
  </tbody>
</table>

### Pie

<table>
  <tbody>
    <tr>
      <td align="center">
        <a href="https://wavemaker.github.io/wm-react-native-echarts/?path=/story/charts-pie-concentric--two-rings" target="_blank">
          <img src="assets/images/charts/pie/concentric.png" width="200" height="200" alt="Concentric pie chart" style="object-fit: contain;" /><br /><sub>concentric</sub>
        </a>
      </td>
      <td align="center">
        <a href="https://wavemaker.github.io/wm-react-native-echarts/?path=/story/charts-pie-donut--donut" target="_blank">
          <img src="assets/images/charts/pie/donut.png" width="200" height="200" alt="Donut chart" style="object-fit: contain;" /><br /><sub>donut</sub>
        </a>
      </td>
      <td align="center">
        <a href="https://wavemaker.github.io/wm-react-native-echarts/?path=/story/charts-pie--default" target="_blank">
          <img src="assets/images/charts/pie/pie.png" width="200" height="200" alt="Pie chart" style="object-fit: contain;" /><br /><sub>pie</sub>
        </a>
      </td>
    </tr>
  </tbody>
</table>

### Radar

<table>
  <tbody>
    <tr>
      <td align="center">
        <a href="https://wavemaker.github.io/wm-react-native-echarts/?path=/story/charts-radar--default" target="_blank">
          <img src="assets/images/charts/radar/default.png" width="200" height="200" alt="Radar chart default" style="object-fit: contain;" /><br /><sub>default</sub>
        </a>
      </td>
      <td align="center">
        <a href="https://wavemaker.github.io/wm-react-native-echarts/?path=/story/charts-radar-multiple--default" target="_blank">
          <img src="assets/images/charts/radar/multiple.png" width="200" height="200" alt="Multiple radar chart" style="object-fit: contain;" /><br /><sub>multiple</sub>
        </a>
      </td>
      <td align="center">
        <a href="https://wavemaker.github.io/wm-react-native-echarts/?path=/story/charts-radar-symbol--circle" target="_blank">
          <img src="assets/images/charts/radar/with-symbol.png" width="200" height="200" alt="Radar chart with symbol" style="object-fit: contain;" /><br /><sub>with-symbol</sub>
        </a>
      </td>
    </tr>
  </tbody>
</table>

### Radial

<table>
  <tbody>
    <tr>
      <td align="center">
        <a href="https://wavemaker.github.io/wm-react-native-echarts/?path=/story/charts-radial-colors--custom-colors" target="_blank">
          <img src="assets/images/charts/radial/custom-colors.png" width="200" height="200" alt="Radial chart custom colors" style="object-fit: contain;" /><br /><sub>custom-colors</sub>
        </a>
      </td>
      <td align="center">
        <a href="https://wavemaker.github.io/wm-react-native-echarts/?path=/story/charts-radial--default" target="_blank">
          <img src="assets/images/charts/radial/default.png" width="200" height="200" alt="Radial chart default" style="object-fit: contain;" /><br /><sub>default</sub>
        </a>
      </td>
      <td align="center">
        <a href="https://wavemaker.github.io/wm-react-native-echarts/?path=/story/charts-radial-colors--background" target="_blank">
          <img src="assets/images/charts/radial/with-bg.png" width="200" height="200" alt="Radial chart with background" style="object-fit: contain;" /><br /><sub>with-bg</sub>
        </a>
      </td>
    </tr>
  </tbody>
</table>

### Scatter

<table>
  <tbody>
    <tr>
      <td align="center">
        <a href="https://wavemaker.github.io/wm-react-native-echarts/?path=/story/charts-scatter--default" target="_blank">
          <img src="assets/images/charts/scatter/default.png" width="200" height="200" alt="Scatter chart default" style="object-fit: contain;" /><br /><sub>default</sub>
        </a>
      </td>
      <td align="center">
        <a href="https://wavemaker.github.io/wm-react-native-echarts/?path=/story/charts-scatter-colors--multiple-series-colors" target="_blank">
          <img src="assets/images/charts/scatter/multi.png" width="200" height="200" alt="Multi scatter chart" style="object-fit: contain;" /><br /><sub>multi</sub>
        </a>
      </td>
      <td align="center">
        <a href="https://wavemaker.github.io/wm-react-native-echarts/?path=/story/charts-scatter-symbol--triangle" target="_blank">
          <img src="assets/images/charts/scatter/with-symbol.png" width="200" height="200" alt="Scatter chart with symbol" style="object-fit: contain;" /><br /><sub>with-symbol</sub>
        </a>
      </td>
    </tr>
  </tbody>
</table>

---

## UI widgets

`@wavemaker/react-native-echarts` also ships a set of standalone React Native UI
widgets alongside the charts, published from the same package so there is only
one dependency to install and version.

```bash
npm install @wavemaker/react-native-echarts
npm install react-native-svg react-native-gesture-handler react-native-reanimated
# optional, per widget:
npm install @shopify/react-native-skia   # SkiaEffect
npm install react-native-webview         # native SignaturePad
```

```tsx
import { QrCode, AvatarStack, SegmentProgress } from '@wavemaker/react-native-echarts';

<QrCode value="https://www.wavemaker.com" size={180} />
<AvatarStack dataset={members} maxVisible={4} />
<SegmentProgress dataset={segments} total={128} />
```

### Widgets and platform support

Every widget runs on **iOS, Android and web**.

| Widget | Description | iOS / Android | Web |
| --- | --- | :---: | :---: |
| **QR Code** | Vector QR symbol with an optional centered logo | ✅ | ✅ |
| **Avatar Stack** | Overlapping avatars, presence dots, `+N` overflow | ✅ | ✅ |
| **Segment Progress** | Multi-segment bar with per-segment rounded caps | ✅ | ✅ |
| **Swipe Deck** | Card deck with pan physics and accept/reject gestures | ✅ | ✅ |
| **Reorder List** | Long-press and drag rows into a new order | ✅ | ⚠️ |
| **Signature Pad** | Freehand capture exported as a base64 PNG | ✅ | ✅ |
| **Skia Effect** | Blend modes and blur through a per-pixel canvas | ✅ | ✅ |

Two widgets could not reach web through their native library, so each ships a
**separate web implementation** behind the same public contract — selected by
platform file extension, so the native-only dependency never enters the web
bundle:

- **Signature Pad** — `react-native-signature-canvas` needs a WebView, which
  `react-native-web` has no equivalent for. The web build captures pointer strokes
  and rasterizes them, returning the **same base64 PNG**, so pages never branch on
  platform. Stroke width is fixed on web and speed-tapered on device.
- **Skia Effect** — Skia on web needs the host app to load the CanvasKit WASM
  bundle first. The web build reproduces the composition with CSS `filter` and
  `mix-blend-mode`, which map one-to-one onto Skia's `Blur` and `blendMode`, and
  pulls in no WASM.

⚠️ **Reorder List on web**: `react-native-reorderable-list` declares no native
modules, so it runs on web and drag works — but upstream tests iOS and Android
only. Treat web drag as best-effort and keep a non-drag path for web users.

**Swipe Deck** and **Reorder List** need a `GestureHandlerRootView` above them, on
web as well as on device.

Full detail: **UI Widgets → Platform Support** in the
[Storybook](https://wavemaker.github.io/wm-react-native-echarts), and
[`spec/09-ui-widgets.md`](spec/09-ui-widgets.md).

---

## Building the library (maintainers)

Charts and UI widgets compile together into a single `@wavemaker/react-native-echarts`
package.

```bash
npm run build:lib      # TypeScript compile → dist/npm-packages/charts
npm run prepare:npm    # Write package.json, copy README, .npmignore
cd dist/npm-packages/charts && npm publish
```

`npm run generate:package` runs both steps. The version comes from the root
`package.json`.

---

## Development

Work from the **repository root** (the directory that contains `package.json`, `components/`, and `stories/`).

### Browser (Storybook)

Storybook runs the chart stories in the browser with Vite. After install, it serves at **http://localhost:6006**.

```bash
npm install
npm run storybook
```

### Mobile (Expo sample app)

The **`expo-app/`** project is a small Expo Router app that consumes the library via **[yalc](https://github.com/wclr/yalc)**. Install **`yalc` globally** first so those commands are on your `PATH`.

```bash
npm install -g yalc
cd /path/to/repo # repository root directory
npm install
npm run generate:package
cd expo-app
npm install
npx expo start
```

Whenever you change library source under `components/` or related entry points, run **`npm run generate:package`** again from the repo root so the yalc-linked package is rebuilt and republished. When changes are not reflecting in the app even after reload, use **`npx expo start -c`**.

---

## Maintainers

This package is maintained by [WaveMaker](https://www.wavemaker.com/). The source repository is [wavemaker/wm-react-native-echarts](https://github.com/wavemaker/wm-react-native-echarts). Use [GitHub Issues](https://github.com/wavemaker/wm-react-native-echarts/issues) for bug reports and feature requests.

### Contributors

<table>
  <tbody>
    <tr>
      <td align="center" width="96">
        <a href="https://github.com/sboyina"><img src="https://avatars.githubusercontent.com/u/2254369?s=96&v=4" width="72" height="72" alt="sboyina" style="border-radius: 50%;" /><br /><sub><b>sboyina</b></sub></a>
      </td>
    </tr>
  </tbody>
</table>



---

## License

MIT
