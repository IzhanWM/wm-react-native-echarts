import { SkiaEffect } from '@wavemaker/react-native-echarts/skiaeffect';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

const GLOW = [
  { id: 1, color: '#F43F5E', radius: 0.34 },
  { id: 2, color: '#3B82F6', radius: 0.34 },
  { id: 3, color: '#22D3EE', radius: 0.34 },
];

const SUNSET = [
  { id: 1, color: '#FB7185', radius: 0.38 },
  { id: 2, color: '#FBBF24', radius: 0.32 },
  { id: 3, color: '#F97316', radius: 0.3 },
  { id: 4, color: '#A855F7', radius: 0.26 },
];

export default function SkiaEffectScreen() {
  const { colorScheme } = useTheme();
  const dark = colorScheme === 'dark';

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: dark ? '#1a1a1a' : '#f5f5f5' },
    section: { padding: 20, alignItems: 'center' },
    heading: {
      alignSelf: 'flex-start',
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 12,
      color: dark ? '#e5e7eb' : '#374151',
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.heading}>Screen blend on a dark ground</Text>
        <SkiaEffect dataset={GLOW} size={260} backgroundColor="#0B1020" />
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Sunset palette, heavier blur</Text>
        <SkiaEffect dataset={SUNSET} size={260} blurAmount={40} backgroundColor="#0B1020" />
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Multiply on a light ground</Text>
        <SkiaEffect
          dataset={GLOW}
          size={260}
          blendMode="multiply"
          backgroundColor="#F8FAFC"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>No blur — the underlying geometry</Text>
        <SkiaEffect dataset={GLOW} size={220} blurAmount={0} backgroundColor="#0B1020" />
      </View>
    </ScrollView>
  );
}
