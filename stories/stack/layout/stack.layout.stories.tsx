import type { StoryObj } from '@storybook/react';
import meta from '../meta';

export default { ...meta, title: 'Charts/Stack/Layout' };
type Story = StoryObj<typeof meta>;

/** Deliberately out of length order, to show that `overlap` reorders the drawing itself. */
const data = [
  { label: 'Employer', value: 480 },
  { label: 'Match', value: 260 },
  { label: 'Employee', value: 700 },
];

const barArgs = { data, max: 800, thickness: 28, width: 400, height: 200 } as const;
const arcArgs = { data, max: 800, view: 'semi-circle', width: 400, height: 270 } as const;

/**
 * Overlap (default): every segment starts at `min` and the segments lie on top of one another.
 * The longest is drawn first, so each shorter one stays visible on top of it.
 */
export const Overlap: Story = {
  args: { ...barArgs, layout: 'overlap' },
};

/** Stack: each segment starts where the previous one ended, so the track reads as a total. */
export const Stack: Story = {
  args: { ...barArgs, layout: 'stack' },
};

/** Overlap on a semi-circle. */
export const OverlapSemiCircle: Story = {
  args: { ...arcArgs, layout: 'overlap' },
};

/** Overlap on a 270° arc. */
export const OverlapArc: Story = {
  args: {
    data,
    max: 800,
    view: 'arc',
    layout: 'overlap',
    width: 400,
    height: 350,
  },
};

/**
 * With `max` omitted, the scale ends at the longest segment in `overlap` layout
 * — at the sum of the segments in `stack` layout.
 */
export const OverlapWithoutMax: Story = {
  args: {
    data,
    layout: 'overlap',
    thickness: 28,
    width: 400,
    height: 200,
  },
};

/** Flat ends apply per bar in `overlap` layout. */
export const OverlapFlatEdge: Story = {
  args: { ...barArgs, layout: 'overlap', edge: 'flat' },
};

/** Values sit at the end of each bar so overlaid labels do not pile up. */
export const OverlapSegmentLabels: Story = {
  args: {
    ...barArgs,
    layout: 'overlap',
    showSegmentLabels: true,
    thickness: 34,
    height: 210,
  },
};
