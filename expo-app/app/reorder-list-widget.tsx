import { ReorderList } from '@wavemaker/react-native-echarts/reorderlist';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

const ROWS = [
  { id: 'a', label: 'Draft the release notes' },
  { id: 'b', label: 'Cut the 1.1 branch' },
  { id: 'c', label: 'Run the device matrix' },
  { id: 'd', label: 'Update the Studio manifests' },
  { id: 'e', label: 'Publish to npm' },
  { id: 'f', label: 'Announce in #releases' },
];

export default function ReorderListScreen() {
  const { colorScheme } = useTheme();
  const dark = colorScheme === 'dark';
  const [status, setStatus] = useState('Long-press a row, then drag.');

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: dark ? '#1a1a1a' : '#f5f5f5' },
    heading: {
      fontSize: 13,
      fontWeight: '600',
      padding: 20,
      paddingBottom: 12,
      color: dark ? '#e5e7eb' : '#374151',
    },
    list: { flex: 1 },
    readout: { padding: 20, fontSize: 13, color: dark ? '#93c5fd' : '#1E3A8A' },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Drag to reorder</Text>
      <View style={styles.list}>
        <ReorderList
          dataset={ROWS}
          rowColor={dark ? '#111827' : '#FFFFFF'}
          draggingRowColor={dark ? '#1F2937' : '#EEF2FF'}
          labelColor={dark ? '#F9FAFB' : '#111827'}
          onReorder={(event) =>
            setStatus(`Moved "${String(event.row.label)}" from ${event.from} to ${event.to}.`)
          }
          onItemPress={(event) => setStatus(`Tapped "${String(event.row.label)}".`)}
        />
      </View>
      <Text style={styles.readout}>{status}</Text>
    </View>
  );
}
