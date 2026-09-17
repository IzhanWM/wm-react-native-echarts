import type { StoryObj } from '@storybook/react';
import meta from '../meta';

export default { ...meta, title: 'Charts/Bar/Y-Axis' };
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

/** yAxisLabel — Y-axis label (horizontal bar: category axis). */
export const YAxisLabel: Story = {
  args: {
    data,
    yAxisLabel: 'Category',
  },
};

/** yAxisNameGap — extra distance (px) between the Y-axis label and the axis line. */
export const YAxisNameGap: Story = {
  args: {
    data,
    yAxisLabel: 'Category',
    yAxisNameGap: 55,
  },
};

/** minY and maxY — fixed category extent (horizontal bar: category index along Y). */
export const FixedMinMax: Story = {
  args: {
    data: [40, 82, 91, 74, 120, 95],
    minY: 1,
    maxY: 4,
  },
};

/** minY, maxY, and intervalY — category axis with explicit tick interval along Y. */
export const FixedInterval: Story = {
  args: {
    data: [40, 82, 91, 74, 120, 95],
    minY: 0,
    maxY: 5,
    intervalY: 2,
  },
};

/** minY — category-axis floor along Y; maximum and step still automatic. */
export const CategoryFloor: Story = {
  args: {
    data: [40, 82, 91, 74, 120, 95],
    minY: 1,
  },
};
