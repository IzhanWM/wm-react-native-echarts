#!/usr/bin/env node
/**
 * Prepares an npm package from the built components in the dist folder.
 * Run after your build step (e.g. tsc or bundler) that outputs to dist/.
 *
 * Usage: node scripts/prepare-npm-package.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = process.cwd();
const distDir = path.join(root, 'dist');
const chartsDir = path.join(distDir, 'npm-packages', 'charts');

const log = (msg, ...args) => console.log(`[prepare-npm-package] ${msg}`, ...args);

function ensureDistExists() {
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
    log('Created dist/ (empty). Run "npm run build:lib" first, then run this script again.');
    return false;
  }
  if (!fs.existsSync(chartsDir)) {
    fs.mkdirSync(chartsDir, { recursive: true });
    log('Created dist/npm-packages/charts/. Run "npm run build:lib" to compile components.');
  }
  return true;
}

function findEntryPoints(dir, entries = {}) {
  const chartsIndex = path.join(dir, 'npm-packages', 'charts', 'index.js');
  if (fs.existsSync(chartsIndex)) {
    entries.main = 'index.js';
    entries.types = 'index.d.ts';
    return entries;
  }
  const names = ['index.js', 'index.mjs', 'index.cjs'];
  for (const name of names) {
    const full = path.join(dir, name);
    if (fs.existsSync(full)) {
      entries[name.endsWith('.mjs') ? 'module' : name.endsWith('.cjs') ? 'main' : 'main'] = name;
    }
  }
  const subdirs = ['cjs', 'esm', 'npm-packages/charts', 'lib', 'dist'];
  for (const sub of subdirs) {
    const subPath = path.join(dir, sub);
    if (fs.existsSync(subPath) && fs.statSync(subPath).isDirectory()) {
      const subIndex = path.join(subPath, 'index.js');
      if (fs.existsSync(subIndex)) {
        if (sub === 'esm' || sub === 'npm-packages/charts' || sub === 'lib') entries.module = path.join(sub, 'index.js');
        if (sub === 'cjs' || sub === 'npm-packages/charts' || sub === 'lib') entries.main = entries.main || path.join(sub, 'index.js');
      }
    }
  }
  return entries;
}

function listTopLevelFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => {
    const full = path.join(dir, f);
    return fs.statSync(full).isFile() && !f.startsWith('.');
  });
}

function buildPackageJson() {
  const rootPkgPath = path.join(root, 'package.json');
  const rootPkg = fs.existsSync(rootPkgPath)
    ? JSON.parse(fs.readFileSync(rootPkgPath, 'utf8'))
    : {};

  const name = rootPkg.name || 'rn-widgets';
  const version = rootPkg.version || '1.0.0';
  const description = rootPkg.description || 'React Native chart and gauge components';
  const license = rootPkg.license || 'MIT';
  const repository = rootPkg.repository || {};
  const homepage = rootPkg.homepage || '';
  const keywords = rootPkg.keywords || ['react-native', 'charts', 'components', 'expo'];

  // Runtime deps that the built package should declare (from root dependencies)
  const runtimeDeps = [
    '@wuba/react-native-echarts',
    'echarts',
    'zrender',
    'react-native-qrcode-svg',
    'react-native-reorderable-list',
    'react-native-signature-canvas',
  ];
  // Peer deps beyond react/react-native: required by charts and/or UI widgets,
  // but left to the host app to install so versions aren't duplicated.
  const peerDeps = [
    'react-native-svg',
    '@shopify/react-native-skia',
    'react-native-gesture-handler',
    'react-native-reanimated',
    'react-native-webview',
  ];
  const dependencies = {};
  const allDeps = { ...(rootPkg.dependencies || {}), ...(rootPkg.devDependencies || {}) };
  for (const dep of runtimeDeps) {
    if (allDeps[dep]) dependencies[dep] = allDeps[dep];
  }

  const rootPeers = rootPkg.peerDependencies || {};
  const peerDependencies = {
    react: rootPeers.react || '*',
    'react-native': rootPeers['react-native'] || '*',
  };
  for (const dep of peerDeps) {
    peerDependencies[dep] = rootPeers[dep] || allDeps[dep] || '*';
  }
  const peerDependenciesMeta = {
    '@shopify/react-native-skia': { optional: true },
    'react-native-webview': { optional: true },
  };

  // @shopify/react-native-skia backs SkiaRenderer, which @wuba/react-native-echarts
  // only uses on native; web builds resolve its `.web` files (a zrender SVG painter)
  // and never import it, so it should not be a hard requirement for web-only consumers.
  const peerDependenciesMeta = {
    '@shopify/react-native-skia': { optional: true },
  };

  const entries = findEntryPoints(distDir);
  const main = 'index.js';
  const hasModule = Boolean(entries.module);

  const pkg = {
    name,
    version,
    description,
    license,
    repository,
    keywords,
    main,
    homepage,
    ...(entries.types && { types: entries.types }),
    ...(hasModule && { module: entries.module }),
    ...(hasModule && {
      exports: {
        '.': {
          import: entries.module || main,
          require: main,
          default: main,
        },
      },
    }),
    files: ['*'],
    peerDependencies,
    peerDependenciesMeta,
    dependencies,
  };

  // Remove private so the package can be published
  if (rootPkg.private) pkg.private = false;

  return pkg;
}

function copyOptional(fileName, destDir) {
  const src = path.join(root, fileName);
  const dest = path.join(destDir, fileName);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    log('Copied %s to npm-packages/charts/', fileName);
  }
}

function writeNpmIgnore(destDir) {
  const npmIgnorePath = path.join(destDir, '.npmignore');
  const content = `# Source and dev
*.map
*.tgz
.DS_Store
`;
  fs.writeFileSync(npmIgnorePath, content);
  log('Created npm-packages/charts/.npmignore');
}

function isYalcAvailable() {
  try {
    const cmd = process.platform === 'win32' ? 'where yalc' : 'command -v yalc';
    execSync(cmd, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function run() {
  log('Preparing npm package in dist/npm-packages/charts/');
  if (!ensureDistExists()) process.exit(1);

  const pkg = buildPackageJson();
  const pkgPath = path.join(chartsDir, 'package.json');
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  log('Wrote npm-packages/charts/package.json (name=%s, version=%s, main=%s)', pkg.name, pkg.version, pkg.main);

  copyOptional('README.md', chartsDir);
  copyOptional('LICENSE', chartsDir);
  writeNpmIgnore(chartsDir);

  log('Done. To publish: cd dist/npm-packages/charts && npm publish');

  if (isYalcAvailable()) {
    execSync('yalc publish', { stdio: 'inherit', cwd: chartsDir });
    log('Published to yalc');
    execSync('yalc add @wavemaker/react-native-echarts', { stdio: 'inherit', cwd: path.join(root, 'expo-app') });
    log('Added @wavemaker/react-native-echarts to expo-app');
  } else {
    log('Skipping yalc (not on PATH). Install globally: npm i -g yalc');
  }
}

run();
