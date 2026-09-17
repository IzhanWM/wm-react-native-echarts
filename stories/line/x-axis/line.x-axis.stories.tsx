import type { StoryObj } from '@storybook/react';
import meta from '../meta';

export default { ...meta, title: 'Charts/Line/X-Axis' };
type Story = StoryObj<typeof meta>;

const data = [40, 82, 91, 74, 120, 95];

/** X-axis shows data indices (0, 1, 2, ...). */
export const Default: Story = {
  args: { data },
};

/** showXAxis: false — X-axis and its labels hidden. */
export const HideAxis: Story = {
  args: { data, showXAxis: false },
};

/** showXAxisTicks: false — X-axis visible but tick marks hidden. */
export const NoTicks: Story = {
  args: { data, showXAxisTicks: false },
};

/** showXAxisSplitLines: false — vertical grid lines hidden. */
export const NoSplitLines: Story = {
  args: { data, showXAxisSplitLines: false },
};

/** boundaryGap: true — gaps at the start and end of the axis. */
export const BoundaryGap: Story = {
  args: { data, boundaryGap: true },
};

/** xAxisTickLabelFormatter: format X-axis tick labels. */
export const LabelFormatter: Story = {
  args: {
    data,
    xAxisTickLabelFormatter: (value) => `${String(value).slice(0, 1)}.0`,
  },
};

/** xAxisLabel — X-axis label displayed along the axis. */
export const XAxisLabel: Story = {
  args: {
    data,
    xAxisLabel: 'Month',
  },
};

/** xAxisNameGap — extra distance (px) between the X-axis label and the axis line. */
export const XAxisNameGap: Story = {
  args: {
    data,
    xAxisLabel: 'Month',
    xAxisNameGap: 45,
  },
};

/** minX and maxX — fixed X-axis extent (category index; six points → narrow window). */
export const FixedMinMax: Story = {
  args: {
    data,
    minX: 1,
    maxX: 4,
  },
};

/** minX, maxX, and intervalX — category axis with explicit tick interval. */
export const FixedInterval: Story = {
  args: {
    data,
    minX: 0,
    maxX: 5,
    intervalX: 2,
  },
};

/** minX — X-axis floor (category index); maximum and step still automatic. */
export const CategoryFloor: Story = {
  args: {
    data,
    minX: 1,
  },
};
