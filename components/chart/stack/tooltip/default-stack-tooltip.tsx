import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ChartTheme } from '../../chart-theme.context';
import type { StackItemTooltipParams } from './stack-item-tooltip.types';

export function createDefaultStackTooltip(
  theme: Pick<ChartTheme, 'tooltip'>
): (params: StackItemTooltipParams) => React.ReactElement {
  const t = theme.tooltip;
  return function DefaultStackTooltip(params: StackItemTooltipParams) {
    const { label, value, percent, color } = params;
    return (
      <View
        style={{
          backgroundColor: t.backgroundColor,
          borderColor: t.borderColor,
          borderWidth: t.borderWidth,
          borderRadius: t.borderRadius,
          padding: t.padding,
        }}
      >
        <View style={styles.headerRow}>
          {color != null && color !== '' ? (
            <View style={[styles.swatch, { backgroundColor: color }]} />
          ) : (
            <View style={styles.swatchPlaceholder} />
          )}
          <Text style={[styles.title, { color: t.labelColor }]}>{label}</Text>
        </View>
        <Text style={[styles.line, { color: t.valueColor }]}>
          <Text style={{ color: t.labelColor }}>value: </Text>
          {String(value)}
        </Text>
        <Text style={[styles.line, { color: t.valueColor }]}>
          <Text style={{ color: t.labelColor }}>share: </Text>
          {percent.toFixed(1)}%
        </Text>
      </View>
    );
  };
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontWeight: '600',
    fontSize: 13,
    flex: 1,
  },
  line: {
    fontSize: 12,
    marginTop: 2,
  },
  swatch: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  swatchPlaceholder: {
    width: 8,
    height: 8,
    marginRight: 6,
  },
});
