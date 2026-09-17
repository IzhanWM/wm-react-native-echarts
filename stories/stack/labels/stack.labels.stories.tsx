import type { StoryObj } from '@storybook/react';
import meta from '../meta';

export default { ...meta, title: 'Charts/Stack/Labels' };
type Story = StoryObj<typeof meta>;

const data = [
  { label: 'Employee', value: 320 },
  { label: 'Employer', value: 240 },
  { label: 'Match', value: 140 },
];

/** Values drawn inside each segment. */
export const SegmentValues: Story = {
  args: {
    data,
    max: 800,
    showSegmentLabels: true,
    thickness: 32,
    width: 420,
    height: 160,
  },
};

/** Custom segment label text (`segmentLabelFormatter`). */
export const CustomSegmentLabels: Story = {
  args: {
    data,
    max: 800,
    segmentLabelFormatter: (value, label) => `${label}: $${value}`,
    thickness: 40,
    width: 460,
    height: 170,
  },
};

/** Center text on the arc views. Stacked, so the center total matches the filled arc. */
export const CenterText: Story = {
  args: {
    data,
    layout: 'stack',
    view: 'semi-circle',
    max: 800,
    centerText: '$700',
    centerSubtext: 'of $800',
    width: 360,
    height: 260,
  },
};

/** Center text on the 270° arc. */
export const ArcCenterText: Story = {
  args: {
    data,
    layout: 'stack',
    view: 'arc',
    max: 800,
    centerText: '$700',
    centerSubtext: 'Contributions',
    width: 360,
    height: 320,
  },
};

/** Center text alongside overlaid bars: the center reports the largest, not a sum. */
export const OverlapCenterText: Story = {
  args: {
    data,
    view: 'semi-circle',
    max: 800,
    centerText: '$320',
    centerSubtext: 'top contributor',
    width: 360,
    height: 260,
  },
};

/** Segment labels and center text together. */
export const Combined: Story = {
  args: {
    data,
    layout: 'stack',
    view: 'arc',
    max: 800,
    showSegmentLabels: true,
    centerText: '88%',
    centerSubtext: 'funded',
    innerRadius: '52%',
    outerRadius: '84%',
    width: 380,
    height: 340,
  },
};
