import type { StoryObj } from '@storybook/react';
import meta from '../meta';

export default { ...meta, title: 'Charts/Candlestick/Y-Axis' };
type Story = StoryObj<typeof meta>;

const xAxisData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const data: [number, number, number, number][] = [
  [20, 34, 10, 38],
  [40, 35, 30, 50],
  [31, 38, 33, 44],
  [38, 15, 5, 42],
  [25, 32, 28, 35],
];

/** Y-axis scale from data (price). */
export const Default: Story = {
  args: { data, xAxisData },
};

/** showYAxis: false — Y-axis and labels hidden. */
export const HideAxis: Story = {
  args: { data, xAxisData, showYAxis: false },
};

/** showYAxisTicks: false — Y-axis visible, tick marks hidden. */
export const NoTicks: Story = {
  args: { data, xAxisData, showYAxisTicks: false },
};

/** showYAxisSplitLines: false — horizontal grid lines hidden. */
export const NoSplitLines: Story = {
  args: { data, xAxisData, showYAxisSplitLines: false },
};

/** yAxisTickLabelFormatter — e.g. add prefix/suffix. */
export const LabelFormatter: Story = {
  args: {
    data,
    xAxisData,
    yAxisTickLabelFormatter: (value) => `$${Number(value).toFixed(0)}`,
  },
};

/** yAxisLabel — Y-axis label displayed along the axis. */
export const YAxisLabel: Story = {
  args: {
    data,
    xAxisData,
    yAxisLabel: 'Price ($)',
  },
};

/** yAxisNameGap — extra distance (px) between the Y-axis label and the axis line. */
export const YAxisNameGap: Story = {
  args: {
    data,
    xAxisData,
    yAxisLabel: 'Price ($)',
    yAxisNameGap: 55,
  },
};

/** minY and maxY — fixed price axis with non-zero floor and padding below lows / above highs. */
export const FixedMinMax: Story = {
  args: {
    data,
    xAxisData,
    minY: 5,
    maxY: 60,
  },
};

/** minY, maxY, and intervalY — explicit price scale and tick step. */
export const FixedInterval: Story = {
  args: {
    data,
    xAxisData,
    minY: 0,
    maxY: 55,
    intervalY: 5,
  },
};

/** minY — price axis floor only (maximum still from data). */
export const ValueAxisFloor: Story = {
  args: {
    data,
    xAxisData,
    minY: 5,
  },
};
