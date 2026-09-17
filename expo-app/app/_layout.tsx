import 'react-native-gesture-handler';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { ThemeProvider as CustomThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { ChartTheme, ChartThemeProvider, DARK_THEME, extendChartTheme, LIGHT_THEME } from '@wavemaker/react-native-echarts/chart-theme.context';
import { useMemo } from 'react';

export const unstable_settings = {
  anchor: 'index',
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <CustomThemeProvider>
          <ThemeProviderWrapper />
        </CustomThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const lightChartTheme: ChartTheme = extendChartTheme(LIGHT_THEME);

const darkChartTheme: ChartTheme = extendChartTheme(DARK_THEME);

function ThemeProviderWrapper() {
  const { colorScheme } = useTheme();

  const chartTheme = useMemo(() => {
    return colorScheme === 'dark' ? darkChartTheme : lightChartTheme; 
  }, [colorScheme]);
  
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ChartThemeProvider theme={chartTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="area-chart" options={{ title: 'Area Chart' }} />
          <Stack.Screen name="line-chart" options={{ title: 'Line Chart' }} />
          <Stack.Screen name="bar-chart" options={{ title: 'Bar Chart' }} />
          <Stack.Screen name="pie-chart" options={{ title: 'Pie Chart' }} />
          <Stack.Screen name="gauge-chart" options={{ title: 'Gauge Chart' }} />
          <Stack.Screen name="radar-chart" options={{ title: 'Radar Chart' }} />
          <Stack.Screen name="candlestick-chart" options={{ title: 'Candlestick Chart' }} />
          <Stack.Screen name="radial-chart" options={{ title: 'Radial Chart' }} />
          <Stack.Screen name="geo-chart" options={{ title: 'Geo Chart' }} />
          <Stack.Screen name="qr-code-widget" options={{ title: 'QR Code' }} />
          <Stack.Screen name="avatar-stack-widget" options={{ title: 'Avatar Stack' }} />
          <Stack.Screen name="segment-progress-widget" options={{ title: 'Segment Progress' }} />
          <Stack.Screen name="swipe-deck-widget" options={{ title: 'Swipe Deck' }} />
          <Stack.Screen name="reorder-list-widget" options={{ title: 'Reorder List' }} />
          <Stack.Screen name="signature-pad-widget" options={{ title: 'Signature Pad' }} />
          <Stack.Screen name="skia-effect-widget" options={{ title: 'Skia Effect' }} />
        </Stack>
      </ChartThemeProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
