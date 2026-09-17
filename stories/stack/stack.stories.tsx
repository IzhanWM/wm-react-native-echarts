import type { StoryObj } from '@storybook/react';
import meta from './meta';

export default { ...meta, title: 'Charts/Stack', tags: ['autodocs'] };
type Story = StoryObj<typeof meta>;

/** Contribution sources measured from the same origin, so the values are comparable. */
const defaultData = [
  { label: 'Employee', value: 700 },
  { label: 'Employer', value: 480 },
  { label: 'Match', value: 260 },
];

/** Default stack chart: horizontal bar, every segment starting at zero and overlapping. */
export const Default: Story = {
  args: {
    data: defaultData,
    height: 160,
  },
};

/** `max` leaves an unfilled remainder, turning the track into a progress bar. */
export const WithRemainder: Story = {
  args: {
    data: defaultData,
    max: 800,
    height: 160,
  },
};

/** Semi-circular track (180°). */
export const SemiCircle: Story = {
  args: {
    data: defaultData,
    view: 'semi-circle',
    max: 800,
    width: 380,
    height: 270,
  },
};

/** Gauge-style arc (270°). */
export const Arc: Story = {
  args: {
    data: defaultData,
    view: 'arc',
    max: 800,
    width: 380,
    height: 350,
  },
};

/** Stack layout: each segment starts where the previous one ended, so the track shows a total. */
export const Stack: Story = {
  args: {
    data: [
      { label: 'Employee', value: 120 },
      { label: 'Employer', value: 90 },
    ],
    layout: 'stack',
    max: 800,
    height: 160,
  },
};

/** Plain numbers are accepted as a shorthand for `{ value }`. */
export const NumbersShorthand: Story = {
  args: {
    data: [40, 25, 15],
    height: 160,
  },
};

/** Single segment: a plain progress track. */
export const SingleSegment: Story = {
  args: {
    data: [{ label: 'Used', value: 62 }],
    max: 100,
    axisLabelFormatter: (value) => `${value}%`,
    height: 140,
  },
};
