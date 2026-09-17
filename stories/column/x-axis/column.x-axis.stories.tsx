import type { StoryObj } from '@storybook/react';
import meta from '../meta';

export default { ...meta, title: 'Charts/Column/X-Axis' };
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

/** boundaryGap: false — columns extend to axis edges. */
export const NoBoundaryGap: Story = {
  args: { data, boundaryGap: false },
};

/** xAxisTickLabelFormatter: format X-axis tick labels (e.g. month names). */
export const LabelFormatter: Story = {
  args: {
    data,
    xAxisTickLabelFormatter: (value) => {
      const labels: Record<string, string> = {
        '0': 'Jan',
        '1': 'Feb',
        '2': 'Mar',
        '3': 'Apr',
        '4': 'May',
        '5': 'Jun',
      };
      return labels[String(value)] ?? String(value);
    },
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
