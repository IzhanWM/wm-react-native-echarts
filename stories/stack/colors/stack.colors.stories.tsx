import type { StoryObj } from '@storybook/react';
import meta from '../meta';

export default { ...meta, title: 'Charts/Stack/Colors' };
type Story = StoryObj<typeof meta>;

const data = [
  { label: 'Employee', value: 120 },
  { label: 'Employer', value: 90 },
  { label: 'Match', value: 40 },
];

const baseArgs = { data, max: 800, width: 360, height: 150 } as const;

/** Themed series colors. */
export const Default: Story = {
  args: { ...baseArgs },
};

/** `colors` overrides the theme palette, one color per segment. */
export const CustomColors: Story = {
  args: {
    ...baseArgs,
    colors: ['#2563eb', '#60a5fa', '#bfdbfe'],
  },
};

/** A per-segment `color` wins over both the theme and `colors`. */
export const PerSegmentColor: Story = {
  args: {
    ...baseArgs,
    data: [
      { label: 'Employee', value: 120, color: '#2563eb' },
      { label: 'Employer', value: 90, color: '#22c55e' },
      { label: 'Match', value: 40, color: '#f59e0b' },
    ],
  },
};

/** Custom color for the unfilled remainder. */
export const TrackColor: Story = {
  args: {
    ...baseArgs,
    colors: ['#2563eb', '#60a5fa', '#93c5fd'],
    trackColor: '#dbeafe',
  },
};

/** Same palette on the arc view. */
export const ArcColors: Story = {
  args: {
    data,
    view: 'arc',
    max: 800,
    colors: ['#7c3aed', '#a78bfa', '#ddd6fe'],
    trackColor: '#f3f0ff',
    width: 360,
    height: 320,
  },
};
