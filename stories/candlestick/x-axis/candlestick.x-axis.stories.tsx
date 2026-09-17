import type { StoryObj } from '@storybook/react';
import meta from '../meta';

export default { ...meta, title: 'Charts/Candlestick/X-Axis' };
type Story = StoryObj<typeof meta>;

const xAxisData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const data: [number, number, number, number][] = [
  [20, 34, 10, 38],
  [40, 35, 30, 50],
  [31, 38, 33, 44],
  [38, 15, 5, 42],
  [25, 32, 28, 35],
  [30, 25, 20, 40],
  [35, 45, 30, 50],
];

/** X-axis shows category labels. */
export const Default: Story = {
  args: { data, xAxisData },
};

/** showXAxis: false — X-axis and labels hidden. */
export const HideAxis: Story = {
  args: { data, xAxisData, showXAxis: false },
};

/** showXAxisTicks: false — X-axis visible, tick marks hidden. */
export const NoTicks: Story = {
  args: { data, xAxisData, showXAxisTicks: false },
};

/** showXAxisSplitLines: false — vertical grid lines hidden. */
export const NoSplitLines: Story = {
  args: { data, xAxisData, showXAxisSplitLines: false },
};

/** boundaryGap: false — no gap at axis ends. */
export const NoBoundaryGap: Story = {
  args: { data, xAxisData, boundaryGap: false },
};

/** xAxisTickLabelFormatter — custom label format. */
export const LabelFormatter: Story = {
  args: {
    data,
    xAxisData,
    xAxisTickLabelFormatter: (value) => String(value).slice(0, 2),
  },
};

/** xAxisLabel — X-axis label displayed along the axis. */
export const XAxisLabel: Story = {
  args: {
    data,
    xAxisData,
    xAxisLabel: 'Day',
  },
};

/** xAxisNameGap — extra distance (px) between the X-axis label and the axis line. */
export const XAxisNameGap: Story = {
  args: {
    data,
    xAxisData,
    xAxisLabel: 'Day',
    xAxisNameGap: 45,
  },
};

/** minX and maxX — fixed category window (five sessions → indices 1–3). */
export const FixedMinMax: Story = {
  args: {
    data,
    xAxisData,
    minX: 1,
    maxX: 3,
  },
};

/** minX, maxX, and intervalX — category axis with explicit label interval. */
export const FixedInterval: Story = {
  args: {
    data,
    xAxisData,
    minX: 0,
    maxX: 4,
    intervalX: 1,
  },
};

/** minX — category axis floor (index). */
export const CategoryFloor: Story = {
  args: {
    data,
    xAxisData,
    minX: 1,
  },
};
