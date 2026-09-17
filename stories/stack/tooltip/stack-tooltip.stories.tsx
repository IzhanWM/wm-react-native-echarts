import { StackChart } from '@components/chart/stack/stack-chart';
import type { StackItemTooltipParams } from '@components/chart/stack';
import type { StoryObj } from '@storybook/react';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import meta from '../meta';

export default { ...meta, title: 'Charts/Stack/Tooltip' };
type Story = StoryObj<typeof meta>;

const SAMPLE_SEGMENTS = [
  { label: 'Employee', value: 320 },
  { label: 'Employer', value: 240 },
  { label: 'Match', value: 140 },
];

const styles = StyleSheet.create({
  hint: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.55)',
    marginBottom: 8,
  },
});

const baseArgs = {
  width: 420,
  height: 180,
  data: SAMPLE_SEGMENTS,
  max: 800,
  thickness: 32,
} as any;

export const Default: Story = {
  render: (args) => (
    <View>
      <Text style={styles.hint}>Default tooltip preset is card.</Text>
      <StackChart {...args} />
    </View>
  ),
  args: { ...baseArgs },
};

export const Card: Story = {
  render: (args) => (
    <View>
      <Text style={styles.hint}>Explicit card preset.</Text>
      <StackChart {...args} />
    </View>
  ),
  args: { ...baseArgs, tooltip: 'card' },
};

export const Compact: Story = {
  render: (args) => (
    <View>
      <Text style={styles.hint}>Compact preset.</Text>
      <StackChart {...args} />
    </View>
  ),
  args: { ...baseArgs, tooltip: 'compact' },
};

export const Kpi: Story = {
  render: (args) => (
    <View>
      <Text style={styles.hint}>KPI preset.</Text>
      <StackChart {...args} />
    </View>
  ),
  args: { ...baseArgs, tooltip: 'kpi' },
};

export const Striped: Story = {
  render: (args) => (
    <View>
      <Text style={styles.hint}>Striped preset.</Text>
      <StackChart {...args} />
    </View>
  ),
  args: { ...baseArgs, tooltip: 'striped' },
};

export const CustomOverride: Story = {
  render: (args) => (
    <View>
      <Text style={styles.hint}>renderTooltip wins over the compact preset.</Text>
      <StackChart {...args} />
    </View>
  ),
  args: {
    ...baseArgs,
    tooltip: 'compact',
    renderTooltip: ({ label, value }: StackItemTooltipParams) => (
      <View style={{ padding: 10, borderRadius: 8, backgroundColor: '#ede9fe' }}>
        <Text style={{ fontWeight: '700' }}>Custom segment</Text>
        <Text>
          {label}: {value}
        </Text>
      </View>
    ),
  },
};

export const OnArc: Story = {
  render: (args) => (
    <View>
      <Text style={styles.hint}>Same item tooltip on the arc view.</Text>
      <StackChart {...args} />
    </View>
  ),
  args: {
    ...baseArgs,
    view: 'arc',
    width: 380,
    height: 340,
  },
};

export const None: Story = {
  render: (args) => (
    <View>
      <Text style={styles.hint}>None: tooltip overlay hidden.</Text>
      <StackChart {...args} />
    </View>
  ),
  args: { ...baseArgs, tooltip: 'none' },
};
