import type { StoryObj } from '@storybook/react';
import meta from '../meta';

export default { ...meta, title: 'Charts/Stack/Edge' };
type Story = StoryObj<typeof meta>;

const data = [
  { label: 'Employee', value: 320 },
  { label: 'Employer', value: 240 },
  { label: 'Match', value: 140 },
];

const barArgs = { data, max: 800, thickness: 28, width: 380, height: 190 } as const;
const arcArgs = { data, max: 800, view: 'semi-circle', width: 380, height: 260 } as const;

/** Curved ends (default): the filled run and the track are each rounded at both ends. */
export const Curve: Story = {
  args: { ...barArgs, edge: 'curve' },
};

/** Flat ends: square caps throughout. */
export const Flat: Story = {
  args: { ...barArgs, edge: 'flat' },
};

/** Curved ends on an arc view. */
export const CurveArc: Story = {
  args: { ...arcArgs, edge: 'curve' },
};

/** Flat ends on an arc view. */
export const FlatArc: Story = {
  args: { ...arcArgs, edge: 'flat' },
};

/** Curved ends on a stacked arc: the run caps at both ends, the track caps at both of its own. */
export const CurveArcStacked: Story = {
  args: { ...arcArgs, layout: 'stack', edge: 'curve' },
};

/** Flat ends on a stacked arc. */
export const FlatArcStacked: Story = {
  args: { ...arcArgs, layout: 'stack', edge: 'flat' },
};

/** Curved ends on a stacked 270° arc. */
export const CurveWideArcStacked: Story = {
  args: {
    data,
    max: 800,
    view: 'arc',
    layout: 'stack',
    edge: 'curve',
    width: 380,
    height: 340,
  },
};

/** Flat ends on a single segment that fills the whole track. */
export const FlatFullTrack: Story = {
  args: {
    data: [{ label: 'Used', value: 100 }],
    max: 100,
    edge: 'flat',
    thickness: 28,
    showLegend: false,
    axisLabelFormatter: (value) => `${value}%`,
    width: 380,
    height: 130,
  },
};
