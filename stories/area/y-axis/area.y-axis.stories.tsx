import type { StoryObj } from '@storybook/react';
import meta from '../meta';

export default { ...meta, title: 'Charts/Area/Y-Axis' };
type Story = StoryObj<typeof meta>;

const data = [40, 82, 91, 74, 90, 88];

/** Y-axis scale computed from the dataset. */
export const Default: Story = {
  args: { data },
};

/** showYAxis: false — Y-axis and its labels hidden. */
export const HideAxis: Story = {
  args: { data, showYAxis: false },
};

/** showYAxisTicks: false — Y-axis visible but tick marks hidden. */
export const NoTicks: Story = {
  args: { data, showYAxisTicks: false },
};

/** showYAxisSplitLines: false — horizontal grid lines hidden. */
export const NoSplitLines: Story = {
  args: { data, showYAxisSplitLines: false },
};

/** yAxisTickLabelFormatter: format Y-axis tick labels (e.g. add K for thousands). */
export const LabelFormatter: Story = {
  args: {
    data,
    yAxisTickLabelFormatter: (value) => {
      const n = Number(value);
      return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
    },
  },
};

/** yAxisLabel — Y-axis label displayed along the axis. */
export const YAxisLabel: Story = {
  args: {
    data,
    yAxisLabel: 'Revenue ($)',
  },
};

/** yAxisNameGap — extra distance (px) between the Y-axis label and the axis line. */
export const YAxisNameGap: Story = {
  args: {
    data,
    yAxisLabel: 'Revenue ($)',
    yAxisNameGap: 55,
  },
};

/** minY and maxY — fixed value-axis bounds (non-zero min, headroom above the series). */
export const FixedMinMax: Story = {
  args: {
    data,
    minY: 30,
    maxY: 120,
  },
};

/** minY, maxY, and intervalY — explicit range and tick step. */
export const FixedInterval: Story = {
  args: {
    data,
    minY: 0,
    maxY: 100,
    intervalY: 10,
  },
};

/** minY — value-axis floor; maximum and tick step still chosen automatically. */
export const ValueAxisFloor: Story = {
  args: {
    data,
    minY: 20,
  },
};
