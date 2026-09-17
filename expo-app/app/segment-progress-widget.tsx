import { SegmentProgress } from '@wavemaker/react-native-echarts/segmentprogress';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

const SEGMENTS = [
  { id: 'docs', label: 'Documents', value: 34, color: '#2563EB' },
  { id: 'media', label: 'Media', value: 22, color: '#10B981' },
  { id: 'backups', label: 'Backups', value: 16, color: '#F59E0B' },
  { id: 'other', label: 'Other', value: 8, color: '#8B5CF6' },
];

export default function SegmentProgressScreen() {
  const { colorScheme } = useTheme();
  const dark = colorScheme === 'dark';
  const [selected, setSelected] = useState('Tap a segment.');

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: dark ? '#1a1a1a' : '#f5f5f5' },
    section: { padding: 20 },
    heading: {
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 12,
      color: dark ? '#e5e7eb' : '#374151',
    },
    readout: { marginTop: 10, fontSize: 13, color: dark ? '#93c5fd' : '#1E3A8A' },
  });

  const track = dark ? '#374151' : '#E5E7EB';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.heading}>Summed total — the bar always fills</Text>
        <SegmentProgress
          dataset={SEGMENTS}
          barHeight={20}
          trackColor={track}
          onSegmentSelect={(event) =>
            setSelected(
              `${String(event.segment.label)} — ${event.value} (${event.percent.toFixed(1)}%)`
            )
          }
        />
        <Text style={styles.readout}>{selected}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Fixed total of 128 — remaining capacity stays visible</Text>
        <SegmentProgress dataset={SEGMENTS} total={128} barHeight={20} trackColor={track} />
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Thin, square caps</Text>
        <SegmentProgress
          dataset={SEGMENTS}
          barHeight={6}
          cornerRadius={0}
          trackColor={track}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Wide gaps read as chips</Text>
        <SegmentProgress
          dataset={SEGMENTS}
          total={100}
          gap={8}
          barHeight={16}
          trackColor={track}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Palette fallback (rows carry no color)</Text>
        <SegmentProgress
          dataset={SEGMENTS.map(({ color, ...rest }) => rest)}
          barHeight={16}
          trackColor={track}
        />
      </View>
    </ScrollView>
  );
}
