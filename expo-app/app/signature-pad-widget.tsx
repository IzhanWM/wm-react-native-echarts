import { SignaturePad, type SignaturePadHandle } from '@wavemaker/react-native-echarts/signaturepad';
import { useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function SignaturePadScreen() {
  const { colorScheme } = useTheme();
  const dark = colorScheme === 'dark';
  const padRef = useRef<SignaturePadHandle>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [strokes, setStrokes] = useState(0);

  const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: dark ? '#1a1a1a' : '#f5f5f5' },
    heading: {
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 12,
      color: dark ? '#e5e7eb' : '#374151',
    },
    pad: {
      height: 240,
      borderWidth: 1,
      borderColor: dark ? '#374151' : '#E5E7EB',
      borderRadius: 8,
      overflow: 'hidden',
    },
    row: { flexDirection: 'row', gap: 8, marginTop: 12 },
    button: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 6,
      backgroundColor: '#2563EB',
    },
    buttonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
    readout: { marginTop: 12, fontSize: 13, color: dark ? '#93c5fd' : '#1E3A8A' },
    preview: {
      marginTop: 12,
      height: 120,
      borderWidth: 1,
      borderColor: dark ? '#374151' : '#E5E7EB',
      borderRadius: 6,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Sign below — each stroke exports a base64 PNG</Text>

      <View style={styles.pad}>
        <SignaturePad
          ref={padRef}
          penColor={dark ? '#F8FAFC' : '#1D1B20'}
          backgroundColor={dark ? '#0F172A' : '#FFFFFF'}
          onSignatureEnd={(event) => {
            setSignature(event.signature);
            setStrokes(event.strokeCount);
          }}
          onClear={() => {
            setSignature(null);
            setStrokes(0);
          }}
        />
      </View>

      <View style={styles.row}>
        <Pressable style={styles.button} onPress={() => padRef.current?.clear()}>
          <Text style={styles.buttonText}>Clear</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => padRef.current?.readSignature()}>
          <Text style={styles.buttonText}>Read</Text>
        </Pressable>
      </View>

      <Text style={styles.readout}>
        {signature == null
          ? 'Nothing captured yet.'
          : `${strokes} stroke(s) · ${signature.length} chars of base64`}
      </Text>

      {signature != null && signature !== '' && (
        <Image source={{ uri: signature }} style={styles.preview} resizeMode="contain" />
      )}
    </View>
  );
}
