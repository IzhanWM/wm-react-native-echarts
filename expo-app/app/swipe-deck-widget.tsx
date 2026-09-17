import { SwipeDeck } from '@wavemaker/react-native-echarts/swipedeck';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

const CARDS = [
  {
    id: 1,
    title: 'Ada Lovelace',
    subtitle: 'Mathematician · wrote the first published algorithm',
    image: 'https://i.pravatar.cc/600?img=1',
  },
  {
    id: 2,
    title: 'Grace Hopper',
    subtitle: 'Rear Admiral · built the first compiler',
    image: 'https://i.pravatar.cc/600?img=2',
  },
  {
    id: 3,
    title: 'Alan Turing',
    subtitle: 'Logician · formalised computation itself',
    image: 'https://i.pravatar.cc/600?img=3',
  },
  {
    id: 4,
    title: 'Katherine Johnson',
    subtitle: 'Orbital mechanics · hand-checked the Friendship 7 trajectory',
    image: 'https://i.pravatar.cc/600?img=4',
  },
];

export default function SwipeDeckScreen() {
  const { colorScheme } = useTheme();
  const dark = colorScheme === 'dark';
  const [log, setLog] = useState<string[]>([]);

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
    readout: {
      marginTop: 16,
      alignSelf: 'stretch',
      fontSize: 13,
      color: dark ? '#93c5fd' : '#1E3A8A',
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.heading}>Drag the top card past the threshold</Text>
        <SwipeDeck
          dataset={CARDS}
          cardColor={dark ? '#111827' : '#FFFFFF'}
          onSwipeRight={(event) =>
            setLog((prev) => [`✓ accepted ${String(event.card.title)}`, ...prev])
          }
          onSwipeLeft={(event) =>
            setLog((prev) => [`✕ rejected ${String(event.card.title)}`, ...prev])
          }
          onDeckEmpty={() => setLog((prev) => ['— deck empty —', ...prev])}
        />
        <Text style={styles.readout}>
          {log.length === 0 ? 'Swipe a card left or right.' : log.join('\n')}
        </Text>
      </View>
    </ScrollView>
  );
}
