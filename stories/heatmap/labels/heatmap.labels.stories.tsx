import type { StoryObj } from '@storybook/react';
import meta from '../meta';
import { heatmapBaseArgs } from '../heatmap.args';

export default { ...meta, title: 'Charts/Heatmap/Labels' };
type Story = StoryObj<typeof meta>;

/** showLabel={false} (default) — cells without numeric labels. */
export const Default: Story = {
  args: { ...heatmapBaseArgs, showLabel: false },
};

/** showLabel={true} — value printed on each cell. */
export const WithCellLabels: Story = {
  args: { ...heatmapBaseArgs, showLabel: true },
};

/** Custom formatter: prefix the value. */
export const CustomFormatter: Story = {
  args: {
    ...heatmapBaseArgs,
    showLabel: true,
    labelFormatter: (params: any) => `${params.value[2]}°`,
  },
};
