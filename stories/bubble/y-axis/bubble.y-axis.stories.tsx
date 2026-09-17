import type { StoryObj } from '@storybook/react';
import meta from '../meta';

export default { ...meta, title: 'Charts/Bubble/Y-Axis' };
type Story = StoryObj<typeof meta>;

const data: [number, number, number][] = [
  [10, 20, 30],
  [15, 25, 15],
  [20, 15, 45],
  [25, 30, 25],
  [30, 22, 35],
];

/** Default: Y-axis shown (value axis from data). */
export const Default: Story = {
  args: {
    data,
  },
};

/** showYAxis: false — Y-axis and its labels hidden. */
export const HideAxis: Story = {
  args: {
    data,
    showYAxis: false,
  },
};

/** showYAxisTicks: false — Y-axis visible but tick marks hidden. */
export const NoTicks: Story = {
  args: {
    data,
    showYAxisTicks: false,
  },
};

/** showYAxisSplitLines: false — horizontal grid lines hidden. */
export const NoSplitLines: Story = {
  args: {
    data,
    showYAxisSplitLines: false,
  },
};

/** yAxisTickLabelFormatter: format Y-axis (value) tick labels. */
export const LabelFormatter: Story = {
  args: {
    data,
    yAxisTickLabelFormatter: (value) => `y=${value}`,
  },
};

/** yAxisLabel — Y-axis label displayed along the axis. */
export const YAxisLabel: Story = {
  args: {
    data,
    yAxisLabel: 'Y',
  },
};

/** yAxisNameGap — extra distance (px) between the Y-axis label and the axis line. */
export const YAxisNameGap: Story = {
  args: {
    data,
    yAxisLabel: 'Y',
    yAxisNameGap: 55,
  },
};

/** minY and maxY — fixed Y range with non-zero floor (bubble Y is about 15–30). */
export const FixedMinMax: Story = {
  args: {
    data,
    minY: 12,
    maxY: 40,
  },
};

/** minY, maxY, and intervalY — explicit tick step on Y. */
export const FixedInterval: Story = {
  args: {
    data,
    minY: 10,
    maxY: 35,
    intervalY: 5,
  },
};

/** minY — Y-axis floor only. */
export const ValueAxisFloor: Story = {
  args: {
    data,
    minY: 12,
  },
};
