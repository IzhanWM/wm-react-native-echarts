import type { StoryObj } from '@storybook/react';
import meta from '../meta';

export default { ...meta, title: 'Charts/Stack/Dimensions' };
type Story = StoryObj<typeof meta>;

const data = [
  { label: 'Employee', value: 120 },
  { label: 'Employer', value: 90 },
];

/** Default size: width 220, height 350. */
export const Default: Story = {
  args: { data, max: 800 },
};

/** Custom width and height. */
export const WithWidthAndHeight: Story = {
  args: {
    data,
    max: 800,
    width: 420,
    height: 150,
  },
};

/** Thin bar (`thickness`). */
export const ThinBar: Story = {
  args: {
    data,
    max: 800,
    thickness: 10,
    width: 420,
    height: 120,
  },
};

/** Thick bar (`thickness`). */
export const ThickBar: Story = {
  args: {
    data,
    max: 800,
    thickness: 48,
    width: 420,
    height: 180,
  },
};

/** Ring band controlled with `innerRadius` / `outerRadius`. */
export const RingBand: Story = {
  args: {
    data,
    view: 'arc',
    max: 800,
    innerRadius: '45%',
    outerRadius: '85%',
    width: 360,
    height: 320,
  },
};

/** Full-width bar inside its parent (`width="100%"`). */
export const FullWidth: Story = {
  args: {
    data,
    max: 800,
    width: '100%',
    height: 150,
  } as any,
};
