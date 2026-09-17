#!/usr/bin/env node
/**
 * Compiles all published components (charts + UI widgets) into
 * dist/npm-packages/charts, as a single package.
 *
 * Charts (components/chart/) and UI widgets (components/ui-widgets/) compile
 * in two separate tsc passes, so each keeps its own flat subpath layout
 * (@wavemaker/react-native-echarts/line, .../avatarstack, etc. — no
 * chart/ or ui-widgets/ prefix). Both passes write into the same outDir,
 * and since each side has its own top-level index.ts, the second pass would
 * otherwise clobber the first pass's package entrypoint — so the two
 * index.js/index.d.ts barrels are merged instead of overwritten.
 *
 * Platform variants (`*.web.tsx`) compile to `*.web.js` beside their native
 * sibling, so Metro and bundlers resolve the right one per platform.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = process.cwd();
const distDir = path.join(root, 'dist');
const chartsDir = path.join(distDir, 'npm-packages', 'charts');

const INDEX_FILES = ['index.js', 'index.d.ts'];
const INDEX_MAP_FILES = ['index.js.map', 'index.d.ts.map'];

const log = (msg, ...args) => console.log(`[build-lib] ${msg}`, ...args);

function readIfExists(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

function removeIfExists(file) {
  if (fs.existsSync(file)) fs.rmSync(file);
}

function run() {
  log('Creating dist/npm-packages/charts and compiling components...');
  if (fs.existsSync(chartsDir)) {
    fs.rmSync(chartsDir, { recursive: true });
  }
  fs.mkdirSync(chartsDir, { recursive: true });

  execSync('npx tsc -p tsconfig.lib.json', { cwd: root, stdio: 'inherit' });

  // Set aside the charts barrel — the widgets pass writes its own index.js
  // /index.d.ts into the same directory and would otherwise overwrite it.
  const chartIndex = {};
  for (const file of INDEX_FILES) {
    chartIndex[file] = readIfExists(path.join(chartsDir, file));
  }
  for (const file of INDEX_MAP_FILES) {
    removeIfExists(path.join(chartsDir, file));
  }

  execSync('npx tsc -p tsconfig.lib-widgets.json', { cwd: root, stdio: 'inherit' });

  // Merge: the package entrypoint re-exports both the chart and widget barrels.
  for (const file of INDEX_FILES) {
    const widgetIndex = readIfExists(path.join(chartsDir, file));
    fs.writeFileSync(path.join(chartsDir, file), `${chartIndex[file]}\n${widgetIndex}`);
  }
  for (const file of INDEX_MAP_FILES) {
    removeIfExists(path.join(chartsDir, file));
  }

  log('Done. Output in dist/npm-packages/charts');
}

run();
