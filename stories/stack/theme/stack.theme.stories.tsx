import {
  ChartThemeProvider,
  DARK_THEME,
  extendChartTheme,
  type ChartTheme,
} from '@components/chart/chart-theme.context';
import { StackChart } from '@components/chart/stack/stack-chart';
import type { StoryObj } from '@storybook/react';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import meta from '../meta';

export default { ...meta, title: 'Charts/Stack/Theme' };
type Story = StoryObj<typeof meta>;

const data = [
  { label: 'Employee', value: 700 },
  { label: 'Employer', value: 480 },
  { label: 'Match', value: 260 },
];

const barArgs = { data, max: 800, thickness: 28, width: 400, height: 200 } as const;

const styles = StyleSheet.create({
  darkSurface: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#151718',
  },
});

/** Built-in **LIGHT_THEME** when no `ChartThemeProvider` wraps the chart. */
export const Default: Story = {
  args: { ...barArgs },
};

/**
 * **`DARK_THEME`** via `ChartThemeProvider`: scale labels, legend text and center text follow the
 * theme. `trackColor` is a prop rather than a theme token — its translucent default blends part way
 * toward the surface, but still reads lighter than a dark background (see `DarkTrackColor`).
 */
export const Dark: Story = {
  render: (args) => (
    <View style={styles.darkSurface}>
      <ChartThemeProvider theme={DARK_THEME}>
        <StackChart {...args} />
      </ChartThemeProvider>
    </View>
  ),
  args: { ...barArgs },
};

/** Dark theme with `trackColor` tuned to the surface, so the unfilled remainder recedes. */
export const DarkTrackColor: Story = {
  render: (args) => (
    <View style={styles.darkSurface}>
      <ChartThemeProvider theme={DARK_THEME}>
        <StackChart {...args} />
      </ChartThemeProvider>
    </View>
  ),
  args: { ...barArgs, trackColor: '#2a2f36' },
};

/** Dark theme on the arc view: `axis.r.tickLabelColor` drives the scale, `legend.textColor` the center text. */
export const DarkArc: Story = {
  render: (args) => (
    <View style={styles.darkSurface}>
      <ChartThemeProvider theme={DARK_THEME}>
        <StackChart {...args} />
      </ChartThemeProvider>
    </View>
  ),
  args: {
    data,
    max: 800,
    view: 'semi-circle',
    centerText: '$700',
    centerSubtext: 'top contributor',
    width: 400,
    height: 270,
  },
};

/** **`colors={string[]}`** overrides the series palette for this chart only. */
export const PerChartColors: Story = {
  args: {
    ...barArgs,
    colors: ['#0f766e', '#14b8a6', '#5eead4'],
  },
};

/** **`theme={partial}`** merges over the context theme for this instance only. */
export const PerChartTheme: Story = {
  args: {
    ...barArgs,
    theme: {
      axis: {
        x: { tickLabelColor: '#0f172a' },
        r: { tickLabelColor: '#0f172a' },
      },
      legend: { textColor: '#0f172a', fontSize: 13 },
      series: [{ color: '#6366f1' }, { color: '#a5b4fc' }, { color: '#e0e7ff' }],
    } as Partial<ChartTheme>,
  },
};

/** `theme.tooltip` styles the tooltip presets — hover a segment to see it. */
export const TooltipTheme: Story = {
  args: {
    ...barArgs,
    tooltip: 'striped',
    theme: {
      tooltip: {
        backgroundColor: '#1e1b4b',
        labelColor: '#c7d2fe',
        valueColor: '#ffffff',
        borderColor: '#4338ca',
        borderWidth: 1,
        borderRadius: 10,
        padding: 3,
      },
    } as Partial<ChartTheme>,
  },
};

/** **`extendChartTheme(...partials)`** builds a full theme object; pass it via **`theme`**. */
export const ExtendedTheme: Story = {
  args: {
    ...barArgs,
    theme: extendChartTheme({
      axis: { x: { tickLabelColor: '#7c2d12' } },
      legend: { textColor: '#7c2d12' },
      series: [{ color: '#c2410c' }, { color: '#fb923c' }, { color: '#fed7aa' }],
    } as Partial<ChartTheme>),
    trackColor: '#fff7ed',
  },
};

/** Nested **`ChartThemeProvider`**s merge: inner partials override the outer theme. */
export const NestedProviders: Story = {
  render: (args) => (
    <View style={styles.darkSurface}>
      <ChartThemeProvider theme={DARK_THEME}>
        <ChartThemeProvider
          theme={{ legend: { textColor: '#fbbf24' } } as Partial<ChartTheme>}
        >
          <StackChart {...args} />
        </ChartThemeProvider>
      </ChartThemeProvider>
    </View>
  ),
  args: { ...barArgs },
};

/** One provider themes every chart beneath it, whatever the view. */
export const ProviderScope: Story = {
  render: (args) => (
    <ChartThemeProvider
      theme={
        {
          axis: { x: { tickLabelColor: '#155e75' }, r: { tickLabelColor: '#155e75' } },
          legend: { textColor: '#155e75' },
          series: [{ color: '#0e7490' }, { color: '#22d3ee' }, { color: '#a5f3fc' }],
        } as Partial<ChartTheme>
      }
    >
      <View>
        <StackChart {...args} showLegend={false} height={120} />
        <StackChart {...args} view="semi-circle" height={250} />
      </View>
    </ChartThemeProvider>
  ),
  args: { data, max: 800, thickness: 24, width: 400, trackColor: '#ecfeff' },
};
