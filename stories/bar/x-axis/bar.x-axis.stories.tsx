import type { StoryObj } from '@storybook/react';
import meta from '../meta';

export default { ...meta, title: 'Charts/Bar/X-Axis' };
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

/** boundaryGap: false — bars extend to axis edges. */
export const NoBoundaryGap: Story = {
  args: { data, boundaryGap: false },
};

/** xAxisTickLabelFormatter: format X-axis tick labels (e.g. month names). */
export const LabelFormatter: Story = {
  args: {
    data,
    xAxisTickLabelFormatter: (value) => {
      const n = Number(value);
      return n > 0 ?  n+ 'k $' : '0$';
    },
  },
};

/** xAxisLabel — X-axis label (horizontal bar: value axis). */
export const XAxisLabel: Story = {
  args: {
    data,
    xAxisLabel: 'Count',
  },
};

/** xAxisNameGap — extra distance (px) between the X-axis label and the axis line. */
export const XAxisNameGap: Story = {
  args: {
    data,
    xAxisLabel: 'Count',
    xAxisNameGap: 45,
  },
};

/** minX and maxX — fixed value scale along X (bar length) with non-zero min. */
export const FixedMinMax: Story = {
  args: {
    data,
    minX: 30,
    maxX: 130,
  },
};

/** minX, maxX, and intervalX — explicit value scale and tick step along X. */
export const FixedInterval: Story = {
  args: {
    data,
    minX: 0,
    maxX: 120,
    intervalX: 20,
  },
};

/** minX — value floor along X; maximum and tick step still automatic. */
export const ValueAxisFloor: Story = {
  args: {
    data,
    minX: 25,
  },
};
