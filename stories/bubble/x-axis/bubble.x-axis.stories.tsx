import type { StoryObj } from '@storybook/react';
import meta from '../meta';

export default { ...meta, title: 'Charts/Bubble/X-Axis' };
type Story = StoryObj<typeof meta>;

const data: [number, number, number][] = [
  [10, 20, 30],
  [15, 25, 15],
  [20, 15, 45],
  [25, 30, 25],
  [30, 22, 35],
];

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
    xAxisLabel: 'X',
  },
};

/** xAxisNameGap — extra distance (px) between the X-axis label and the axis line. */
export const XAxisNameGap: Story = {
  args: {
    data,
    xAxisLabel: 'X',
    xAxisNameGap: 45,
  },
};

/** minX and maxX — fixed numeric X scale (non-zero min; bubble X ≈ 10–30). */
export const FixedMinMax: Story = {
  args: {
    data,
    minX: 8,
    maxX: 35,
  },
};

/** minX, maxX, and intervalX — explicit value scale and tick step on X. */
export const FixedInterval: Story = {
  args: {
    data,
    minX: 0,
    maxX: 35,
    intervalX: 5,
  },
};

/** minX — value floor on X; maximum and step still automatic. */
export const ValueAxisFloor: Story = {
  args: {
    data,
    minX: 12,
  },
};
