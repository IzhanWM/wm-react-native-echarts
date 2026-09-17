import { AvatarStack } from '@wavemaker/react-native-echarts/avatarstack';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

const MEMBERS = [
  { id: 1, name: 'Ava Johnson', imageUrl: 'https://i.pravatar.cc/150?img=1', status: 'online' },
  { id: 2, name: 'Liam Smith', imageUrl: 'https://i.pravatar.cc/150?img=2', status: 'online' },
  { id: 3, name: 'Sophia Brown', imageUrl: 'https://i.pravatar.cc/150?img=3', status: 'away' },
  { id: 4, name: 'Noah Williams', imageUrl: 'https://i.pravatar.cc/150?img=4', status: 'offline' },
  { id: 5, name: 'Emma Davis', imageUrl: 'https://i.pravatar.cc/150?img=5', status: 'online' },
  { id: 6, name: 'Oliver Wilson', imageUrl: 'https://i.pravatar.cc/150?img=6', status: 'away' },
  { id: 7, name: 'Mia Taylor', imageUrl: 'https://i.pravatar.cc/150?img=7', status: 'online' },
  { id: 8, name: 'James Anderson', imageUrl: 'https://i.pravatar.cc/150?img=8', status: 'offline' },
];

export default function AvatarStackScreen() {
  const { colorScheme } = useTheme();
  const dark = colorScheme === 'dark';
  const [selected, setSelected] = useState<string>('Tap an avatar.');

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: dark ? '#1a1a1a' : '#f5f5f5' },
    section: { padding: 20 },
    heading: {
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 12,
      color: dark ? '#e5e7eb' : '#374151',
    },
    readout: { marginTop: 8, fontSize: 13, color: dark ? '#93c5fd' : '#1E3A8A' },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.heading}>Default — 4 visible, rest collapse to +N</Text>
        <AvatarStack
          dataset={MEMBERS}
          borderColor={dark ? '#1a1a1a' : '#FFFFFF'}
          onMemberSelect={(event) =>
            setSelected(`Selected ${String(event.member.name)} at index ${event.index}.`)
          }
        />
        <Text style={styles.readout}>{selected}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Large, wider overlap</Text>
        <AvatarStack
          dataset={MEMBERS}
          avatarSize={64}
          overlap={22}
          maxVisible={5}
          borderColor={dark ? '#1a1a1a' : '#FFFFFF'}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Compact, no status dots</Text>
        <AvatarStack
          dataset={MEMBERS}
          avatarSize={28}
          overlap={10}
          showStatus={false}
          borderColor={dark ? '#1a1a1a' : '#FFFFFF'}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Initials fallback (no images)</Text>
        <AvatarStack
          dataset={MEMBERS.map(({ imageUrl, ...rest }) => rest)}
          borderColor={dark ? '#1a1a1a' : '#FFFFFF'}
        />
      </View>
    </ScrollView>
  );
}
