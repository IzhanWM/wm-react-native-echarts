import type { StoryObj } from '@storybook/react';
import meta from '../meta';

export default { ...meta, title: 'Charts/Stack/Axis' };
type Story = StoryObj<typeof meta>;

const data = [
  { label: 'Employee', value: 120 },
  { label: 'Employer', value: 90 },
];

const baseArgs = { data, max: 800, width: 400, height: 150 } as const;

/** Auto scale labels from `min` to `max`. */
export const Default: Story = {
  args: { ...baseArgs },
};

/** Fixed spacing between labels (`interval`). */
export const Interval: Story = {
  args: { ...baseArgs, interval: 200 },
};

/** Percent scale via `axisLabelFormatter`. */
export const PercentLabels: Story = {
  args: {
    data: [{ label: 'Complete', value: 180 }],
    max: 800,
    interval: 200,
    axisLabelFormatter: (value) => `${value}%`,
    width: 400,
    height: 150,
  },
};

/** Currency scale via `axisLabelFormatter`. */
export const CurrencyLabels: Story = {
  args: {
    ...baseArgs,
    interval: 200,
    axisLabelFormatter: (value) => `$${value}`,
  },
};

/** Non-zero `min`. */
export const CustomMin: Story = {
  args: {
    data: [{ label: 'Score', value: 30 }],
    min: 50,
    max: 100,
    axisLabelFormatter: (value) => String(value),
    width: 400,
    height: 150,
  },
};

/** No scale labels. */
export const HideAxisLabels: Story = {
  args: { ...baseArgs, showAxisLabels: false, height: 110 },
};

/** Scale labels along the arc. */
export const ArcLabels: Story = {
  args: {
    data,
    view: 'arc',
    max: 800,
    interval: 200,
    axisLabelFormatter: (value) => `$${value}`,
    width: 360,
    height: 320,
  },
};

/** A negative `axisLabelMargin` moves the arc labels inside the ring. */
export const ArcLabelsInside: Story = {
  args: {
    data,
    view: 'semi-circle',
    max: 800,
    interval: 200,
    axisLabelFormatter: (value) => `$${value}`,
    axisLabelMargin: -46,
    width: 360,
    height: 260,
  },
};
