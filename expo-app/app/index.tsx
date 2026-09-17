import { ThemeToggle } from '@/components/theme-toggle';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { ScrollView } from 'react-native-gesture-handler';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const chartTypes = [
  {
    id: 'area-chart',
    title: 'Area Chart',
    description: 'Filled area visualization with smooth gradients',
    icon: 'analytics' as const,
    color: '#3b82f6',
  },
  {
    id: 'line-chart',
    title: 'Line Chart',
    description: 'Sales trend visualization with smooth curves',
    icon: 'trending-up' as const,
    color: '#5470c6',
  },
  {
    id: 'bar-chart',
    title: 'Bar Chart',
    description: 'Monthly revenue comparison across products',
    icon: 'bar-chart' as const,
    color: '#91cc75',
  },
  {
    id: 'pie-chart',
    title: 'Pie Chart',
    description: 'Market share distribution across companies',
    icon: 'pie-chart' as const,
    color: '#fac858',
  },
  {
    id: 'gauge-chart',
    title: 'Gauge Chart',
    description: 'Progress tracking with multiple metrics',
    icon: 'speedometer' as const,
    color: '#ee6666',
  },
  // {
  //   id: 'scatter-chart',
  //   title: 'Scatter Chart',
  //   description: 'Data correlation and distribution analysis',
  //   icon: 'radio-button-off' as const,
  //   color: '#73c0de',
  // },
  {
    id: 'radar-chart',
    title: 'Radar Chart',
    description: 'Multi-dimensional data comparison',
    icon: 'radio-button-on' as const,
    color: '#3fb1e3',
  },
  // {
  //   id: 'funnel-chart',
  //   title: 'Funnel Chart',
  //   description: 'Conversion process visualization',
  //   icon: 'funnel' as const,
  //   color: '#6be6c1',
  // },
  {
    id: 'heatmap-chart',
    title: 'Heatmap Chart',
    description: 'Data density and correlation patterns',
    icon: 'grid' as const,
    color: '#626c91',
  },
      {
        id: 'candlestick-chart',
        title: 'Candlestick Chart',
        description: 'Financial data and stock price analysis',
        icon: 'trending-up' as const,
        color: '#a0a7e6',
      },
      {
        id: 'radial-chart',
        title: 'Radial Chart',
        description: 'Circular data visualization with polar coordinates',
        icon: 'radio-button-on' as const,
        color: '#ff9a9e',
      },
      {
        id: 'geo-chart',
        title: 'Geo Chart',
        description: 'Interactive world maps with geographic data',
        icon: 'map' as const,
        color: '#74b9ff',
      },
];

const uiWidgets = [
  {
    id: 'qr-code-widget',
    title: 'QR Code',
    description: 'Vector QR symbol with an optional centered logo',
    icon: 'qr-code' as const,
    color: '#0f172a',
  },
  {
    id: 'avatar-stack-widget',
    title: 'Avatar Stack',
    description: 'Overlapping avatars with presence dots and +N overflow',
    icon: 'people' as const,
    color: '#8b5cf6',
  },
  {
    id: 'segment-progress-widget',
    title: 'Segment Progress',
    description: 'Multi-segment bar with per-segment rounded caps',
    icon: 'stats-chart' as const,
    color: '#10b981',
  },
  {
    id: 'swipe-deck-widget',
    title: 'Swipe Deck',
    description: 'Card deck with pan physics and accept/reject gestures',
    icon: 'layers' as const,
    color: '#f43f5e',
  },
  {
    id: 'reorder-list-widget',
    title: 'Reorder List',
    description: 'Long-press and drag rows into a new order',
    icon: 'reorder-three' as const,
    color: '#f59e0b',
  },
  {
    id: 'signature-pad-widget',
    title: 'Signature Pad',
    description: 'Freehand capture exported as a base64 PNG',
    icon: 'create' as const,
    color: '#2563eb',
  },
  {
    id: 'skia-effect-widget',
    title: 'Skia Effect',
    description: 'Blend modes and blur through a per-pixel canvas',
    icon: 'color-filter' as const,
    color: '#22d3ee',
  },
];

export default function HomeScreen() {
  const { colorScheme } = useTheme();
  
  const styles = StyleSheet.create({
    safeRoot: {
      flex: 1,
      backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5',
    },
    container: {
      flex: 1,
      backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5',
    },
    header: {
      padding: 20,
      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#fff',
      marginBottom: 10,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    headerContent: {
      flex: 1,
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 5,
      color: colorScheme === 'dark' ? '#ffffff' : '#333333',
    },
    headerSubtitle: {
      fontSize: 16,
      opacity: 0.7,
      textAlign: 'center',
      color: colorScheme === 'dark' ? '#cccccc' : '#666666',
    },
    chartsGrid: {
      paddingHorizontal: 10,
      paddingBottom: 20,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      paddingHorizontal: 10,
      paddingTop: 6,
      paddingBottom: 10,
      color: colorScheme === 'dark' ? '#9ca3af' : '#6b7280',
    },
    chartCard: {
      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#fff',
      marginBottom: 15,
      borderRadius: 12,
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: colorScheme === 'dark' ? '#000' : '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: colorScheme === 'dark' ? 0.3 : 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    iconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 15,
    },
    chartInfo: {
      flex: 1,
    },
    chartTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 4,
      color: colorScheme === 'dark' ? '#ffffff' : '#333333',
    },
    chartDescription: {
      fontSize: 14,
      opacity: 0.7,
      lineHeight: 20,
      color: colorScheme === 'dark' ? '#cccccc' : '#666666',
    },
  });

  return (
    <SafeAreaView style={styles.safeRoot} edges={['top', 'left', 'right', 'bottom']}>
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              Component Gallery
            </Text>
            <Text style={styles.headerSubtitle}>
              ECharts visualizations and UI widgets, with dark mode support
            </Text>
          </View>
          <ThemeToggle />
        </View>
      </View>

      {[
        { heading: 'Charts', entries: chartTypes },
        { heading: 'UI Widgets', entries: uiWidgets },
      ].map((section) => (
        <View key={section.heading}>
          <Text style={styles.sectionTitle}>{section.heading}</Text>
          <View style={styles.chartsGrid}>
            {section.entries.map((entry) => (
              <Link key={entry.id} href={entry.id as any} asChild>
                <TouchableOpacity style={styles.chartCard}>
                  <View style={[styles.iconContainer, { backgroundColor: entry.color }]}>
                    <Ionicons name={entry.icon as any} size={32} color="white" />
                  </View>
                  <View style={styles.chartInfo}>
                    <Text style={styles.chartTitle}>
                      {entry.title}
                    </Text>
                    <Text style={styles.chartDescription}>
                      {entry.description}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colorScheme === 'dark' ? '#cccccc' : '#999'}
                  />
                </TouchableOpacity>
              </Link>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
    </SafeAreaView>
  );
}
