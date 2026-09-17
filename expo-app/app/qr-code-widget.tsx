import { QrCode } from '@wavemaker/react-native-echarts/qrcode';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function QrCodeScreen() {
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
        <Text style={styles.heading}>Default</Text>
        <QrCode value="https://www.wavemaker.com" />
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Branded colors, larger</Text>
        <QrCode
          value="https://wavemaker.github.io/wm-react-native-echarts"
          size={240}
          color="#1E3A8A"
          backgroundColor="#EFF6FF"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>High error correction (pairs with a logo)</Text>
        <QrCode value="https://www.wavemaker.com" size={200} errorCorrection="H" />
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Plain text</Text>
        <QrCode value="WaveMaker — build apps visually." size={180} />
      </View>
    </ScrollView>
  );
}
