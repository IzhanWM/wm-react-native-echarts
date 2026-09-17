import type { StackChartSelectEvent } from '@components/chart/stack/stack-chart.props';
import { StackChart } from '@components/chart/stack/stack-chart';
import type { StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import meta from '../meta';

export default { ...meta, title: 'Charts/Stack/Interaction' };
type Story = StoryObj<typeof meta>;

const styles = StyleSheet.create({
  hint: { fontSize: 13, color: 'rgba(0,0,0,0.55)', marginBottom: 8 },
  payload: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 12,
    color: 'rgba(0,0,0,0.85)',
  },
});

const defaultData = [
  { label: 'Employee', value: 320 },
  { label: 'Employer', value: 240 },
  { label: 'Match', value: 140 },
];

/** Tap a segment of the bar. */
export const OnSelect: Story = {
  render: (args) => {
    const [selection, setSelection] = useState<StackChartSelectEvent | null>(null);
    return (
      <View>
        <Text style={styles.hint}>Tap a colored segment to trigger onSelect.</Text>
        <StackChart {...args} onSelect={(e) => setSelection(e)} />
        <Text style={styles.payload} selectable>
          {selection == null ? 'No selection yet.' : JSON.stringify(selection, null, 2)}
        </Text>
      </View>
    );
  },
  args: {
    data: defaultData,
    max: 800,
    thickness: 32,
    width: 420,
    height: 180,
  },
};

/** The unfilled track is inert — only segments emit onSelect. */
export const OnSelectArc: Story = {
  render: (args) => {
    const [selection, setSelection] = useState<StackChartSelectEvent | null>(null);
    return (
      <View>
        <Text style={styles.hint}>Tap a segment of the arc; the track ignores taps.</Text>
        <StackChart {...args} onSelect={(e) => setSelection(e)} />
        <Text style={styles.payload} selectable>
          {selection == null ? 'No selection yet.' : JSON.stringify(selection, null, 2)}
        </Text>
      </View>
    );
  },
  args: {
    data: defaultData,
    view: 'arc',
    max: 800,
    width: 380,
    height: 340,
  },
};

/** Legend entries toggle segments in and out of the stack. */
export const LegendToggle: Story = {
  render: (args) => (
    <View>
      <Text style={styles.hint}>Tap a legend entry to hide or restore that segment.</Text>
      <StackChart {...args} />
    </View>
  ),
  args: {
    data: defaultData,
    max: 800,
    thickness: 32,
    width: 420,
    height: 200,
  },
};
