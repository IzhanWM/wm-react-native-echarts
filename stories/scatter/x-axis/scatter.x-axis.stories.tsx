import type { StoryObj } from '@storybook/react';
import meta from '../meta';

export default { ...meta, title: 'Charts/Scatter/X-Axis' };
type Story = StoryObj<typeof meta>;

const data: number[][] = [[10, 5], [0, 8], [6, 10], [2, 12], [8, 9]];

/** Default: X-axis shown (value axis from data). */
export const Default: Story = {
  args: {
    data,
  },
};

/** showXAxis: false — X-axis and its labels hidden. */
export const HideAxis: Story = {
  args: {
    data,
    showXAxis: false,
  },
};

/** showXAxisTicks: false — X-axis visible but tick marks hidden. */
export const NoTicks: Story = {
  args: {
    data,
    showXAxisTicks: false,
  },
};

/** showXAxisSplitLines: false — vertical grid lines hidden. */
export const NoSplitLines: Story = {
  args: {
    data,
    showXAxisSplitLines: false,
  },
};

/** xAxisTickLabelFormatter: format X-axis (value) tick labels. */
export const LabelFormatter: Story = {
  args: {
    data,
    xAxisTickLabelFormatter: (value) => `x=${value}`,
  },
};

/** boundaryGap: true — gaps at the start and end of the axis. */
export const BoundaryGap: Story = {
  args: { data, boundaryGap: true },
};

/** xAxisLabel — X-axis label displayed along the axis. */
export const XAxisLabel: Story = {
  args: {
    data,
    xAxisLabel: 'X value',
  },
};

/** xAxisNameGap — extra distance (px) between the X-axis label and the axis line. */
export const XAxisNameGap: Story = {
  args: {
    data,
    xAxisLabel: 'X value',
    xAxisNameGap: 45,
  },
};

/** minX and maxX — fixed X-axis extent (category index; non-zero min). */
export const FixedMinMax: Story = {
  args: {
    data,
    minX: 1,
    maxX: 8,
  },
};

/** minX, maxX, and intervalX — explicit tick interval on category X. */
export const FixedInterval: Story = {
  args: {
    data,
    minX: 0,
    maxX: 10,
    intervalX: 2,
  },
};

/** minX — X-axis floor (category index). */
export const CategoryFloor: Story = {
  args: {
    data,
    minX: 2,
  },
};
