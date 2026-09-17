import type { StoryObj } from '@storybook/react';
import meta from '../meta';

export default { ...meta, title: 'Charts/Stack/View' };
type Story = StoryObj<typeof meta>;

const data = [
  { label: 'Employee', value: 120 },
  { label: 'Employer', value: 90 },
  { label: 'Match', value: 40 },
];

/** Horizontal bar (default view). */
export const Bar: Story = {
  args: {
    data,
    max: 800,
    width: 360,
    height: 150,
  },
};

/** Semi-circle: the scale sweeps 180°, from left to right over the top. */
export const SemiCircle: Story = {
  args: {
    data,
    view: 'semi-circle',
    max: 800,
    width: 360,
    height: 260,
  },
};

/** Arc: the scale sweeps 270°, gauge style. */
export const Arc: Story = {
  args: {
    data,
    view: 'arc',
    max: 800,
    width: 360,
    height: 320,
  },
};

/** Custom sweep via `startAngle` / `endAngle` (quarter arc). */
export const CustomAngles: Story = {
  args: {
    data,
    view: 'arc',
    max: 800,
    startAngle: 180,
    endAngle: 90,
    width: 360,
    height: 320,
  },
};

/** Thin ring: a larger `innerRadius` narrows the band. */
export const ThinRing: Story = {
  args: {
    data,
    view: 'semi-circle',
    max: 800,
    innerRadius: '72%',
    outerRadius: '82%',
    width: 360,
    height: 260,
  },
};
