import type { StoryObj } from '@storybook/react';
import meta from '../meta';

export default { ...meta, title: 'Examples/Stack' };
type Story = StoryObj<typeof meta>;

/** Progress track: one segment against an 800% scale, percent labels below. */
export const ProgressBar: Story = {
  args: {
    data: [{ label: 'Growth', value: 180 }],
    max: 800,
    interval: 200,
    axisLabelFormatter: (value) => `${value}%`,
    colors: ['#5bb7d4'],
    trackColor: '#b3e5f5',
    thickness: 26,
    showLegend: false,
    width: 360,
    height: 110,
  },
};

/** Contributions gauge: semi-circular track with a currency scale. */
export const ContributionsGauge: Story = {
  args: {
    data: [{ label: 'Contributions', value: 210 }],
    max: 800,
    interval: 200,
    axisLabelFormatter: (value) => `$${value}`,
    axisLabelMargin: -52,
    colors: ['#2f56d9'],
    trackColor: '#e4e9fb',
    innerRadius: '62%',
    outerRadius: '86%',
    showLegend: false,
    width: 380,
    view: 'semi-circle',
    height: 240,
  },
};

/** Budget split across four categories: stacked, so the track reads as one total. */
export const BudgetSplit: Story = {
  args: {
    data: [
      { label: 'Housing', value: 1800 },
      { label: 'Food', value: 900 },
      { label: 'Transport', value: 450 },
      { label: 'Other', value: 350 },
    ],
    layout: 'stack',
    interval: 1000,
    axisLabelFormatter: (value) => `$${value / 1000}k`,
    colors: ['#2563eb', '#60a5fa', '#93c5fd', '#dbeafe'],
    thickness: 30,
    showSegmentLabels: true,
    width: 460,
    height: 190,
  },
};

/** Storage usage: arc view with the remaining space in the center. */
export const StorageUsage: Story = {
  args: {
    data: [
      { label: 'Photos', value: 120 },
      { label: 'Apps', value: 84 },
      { label: 'Media', value: 46 },
    ],
    layout: 'stack',
    view: 'arc',
    max: 512,
    interval: 128,
    axisLabelFormatter: (value) => `${value}GB`,
    centerText: '250 GB',
    centerSubtext: 'of 512 GB used',
    colors: ['#7c3aed', '#a78bfa', '#c4b5fd'],
    trackColor: '#f1edfe',
    width: 380,
    height: 340,
  },
};

/** Channel comparison: the default overlaid bars, each measured from the same origin. */
export const ChannelComparison: Story = {
  args: {
    data: [
      { label: 'Organic', value: 8600 },
      { label: 'Paid', value: 5200 },
      { label: 'Referral', value: 2400 },
    ],
    max: 10000,
    interval: 2500,
    axisLabelFormatter: (value) => `${value / 1000}k`,
    colors: ['#1d4ed8', '#60a5fa', '#bfdbfe'],
    trackColor: '#eff6ff',
    thickness: 30,
    showSegmentLabels: true,
    width: 460,
    height: 210,
  },
};

/** Fundraising thermometer: pledges stacked toward a target. */
export const FundraisingTarget: Story = {
  args: {
    data: [
      { label: 'Corporate', value: 32000 },
      { label: 'Individual', value: 21000 },
      { label: 'Grants', value: 12000 },
    ],
    layout: 'stack',
    max: 100000,
    interval: 25000,
    axisLabelFormatter: (value) => `$${value / 1000}k`,
    colors: ['#0f766e', '#14b8a6', '#5eead4'],
    trackColor: '#e6fffb',
    thickness: 28,
    width: 460,
    height: 190,
  },
};
