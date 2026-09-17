import React from 'react';
import { Text } from 'react-native';
import type { ChartTooltipPreset } from '../../tooltip';
import {
  TooltipPresetCard,
  TooltipPresetCompact,
  TooltipPresetKpi,
  TooltipPresetStriped,
} from '../../tooltip/chart-tooltip-preset-shells';
import type { StackItemTooltipParams } from './stack-item-tooltip.types';

function stackCardFromParams(p: StackItemTooltipParams) {
  const { label, value, percent, color } = p;
  return (
    <TooltipPresetCard header={{ swatchColor: color, title: label, marginBottom: 6 }}>
      <Text style={{ fontSize: 14, fontWeight: '700', color: '#0f172a' }}>
        {value} <Text style={{ fontWeight: '500', color: '#64748b' }}>({percent.toFixed(1)}%)</Text>
      </Text>
    </TooltipPresetCard>
  );
}

function stackCompactFromParams(p: StackItemTooltipParams) {
  const { label, value, percent } = p;
  return <TooltipPresetCompact emphasis={label} detail={`${value} (${percent.toFixed(1)}%)`} wrap />;
}

function stackKpiFromParams(p: StackItemTooltipParams) {
  const { label, value, percent, color } = p;
  return (
    <TooltipPresetKpi
      accentColor={color ?? '#3b82f6'}
      minWidth={140}
      overline={label}
      metric={String(value)}
      caption={`${percent.toFixed(1)}% share`}
    />
  );
}

function stackStripedFromParams(p: StackItemTooltipParams) {
  const { label, value, percent, total, color } = p;
  return (
    <TooltipPresetStriped
      headerSwatch={{ color: color ?? '#64748b', title: label }}
      rows={[
        { key: 'value', leftLabel: 'value', right: String(value) },
        { key: 'share', leftLabel: 'share', right: `${percent.toFixed(1)}%` },
        { key: 'total', leftLabel: 'total', right: String(total) },
      ]}
    />
  );
}

export function createStackTooltipPreset(
  preset: ChartTooltipPreset
): (params: StackItemTooltipParams) => React.ReactElement {
  switch (preset) {
    case 'card':
      return (p) => stackCardFromParams(p);
    case 'compact':
      return (p) => stackCompactFromParams(p);
    case 'kpi':
      return (p) => stackKpiFromParams(p);
    case 'striped':
      return (p) => stackStripedFromParams(p);
  }
  throw new Error(`Unknown tooltip preset: ${String(preset)}`);
}
