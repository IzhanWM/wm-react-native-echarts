import type { StoryObj } from '@storybook/react';
import meta from '../meta';

export default { ...meta, title: 'Charts/Pie/Label' };
type Story = StoryObj<typeof meta>;

const data = [
  { name: 'Desktop', value: 275 },
  { name: 'Mobile', value: 200 },
  { name: 'Tablet', value: 187 },
  { name: 'Other', value: 90 },
];

/** Labels outside with label lines (default). */
export const Outside: Story = {
  args: {
    data,
    showLabel: true,
    labelPosition: 'outside',
    showLabelLine: true,
  },
};

/** Labels inside slices. */
export const Inside: Story = {
  args: {
    data,
    showLabel: true,
    labelPosition: 'inside',
    showLabelLine: false,
  },
};

/** Labels in center (for donut). */
export const Center: Story = {
  args: {
    data,
    radius: ['50%', '75%'],
    showLabel: true,
    labelPosition: 'center',
    showLabelLine: false,
  },
};

/** No labels. */
export const NoLabels: Story = {
  args: {
    data,
    showLabel: false,
  },
};

/** Custom formatter: show the raw value instead of percent. */
export const CustomFormatter: Story = {
  args: {
    data,
    showLabel: true,
    labelPosition: 'outside',
    labelFormatter: (params: any) => `${params.name}: ${params.value}`,
  },
};
