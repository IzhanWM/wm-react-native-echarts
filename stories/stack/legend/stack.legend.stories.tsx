import type { StoryObj } from '@storybook/react';
import meta from '../meta';

export default { ...meta, title: 'Charts/Stack/Legend' };
type Story = StoryObj<typeof meta>;

const data = [
  { label: 'Employee', value: 320 },
  { label: 'Employer', value: 240 },
  { label: 'Match', value: 140 },
];

const baseArgs = { data, max: 800, width: 380, height: 200 } as const;

/** Without the segment legend (`showLegend={false}`). */
export const HideLegend: Story = {
  args: { ...baseArgs, showLegend: false, height: 140 },
};

/** Legend at bottom (explicit). */
export const LegendBottom: Story = {
  args: { ...baseArgs, legendPosition: 'bottom' },
};

/** Legend above. */
export const LegendTop: Story = {
  args: { ...baseArgs, legendPosition: 'top' },
};

/** Legend on the left. */
export const LegendLeft: Story = {
  args: { ...baseArgs, legendPosition: 'left', width: 460 },
};

/** Legend on the right. */
export const LegendRight: Story = {
  args: { ...baseArgs, legendPosition: 'right', width: 460 },
};

/** Legend below the arc; the ring shifts up to clear it. */
export const ArcLegendBottom: Story = {
  args: {
    data,
    max: 800,
    view: 'arc',
    legendPosition: 'bottom',
    width: 380,
    height: 340,
  },
};

/** Legend beside the semi-circle. */
export const SemiCircleLegendRight: Story = {
  args: {
    data,
    max: 800,
    view: 'semi-circle',
    legendPosition: 'right',
    width: 460,
    height: 260,
  },
};
