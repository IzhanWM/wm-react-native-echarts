/**
 * ArgTypes for Heatmap chart (common + heatmap-specific only).
 */
import { commonChartArgTypes } from '../args/common';

const heatmapOnlyArgTypes = {
  xAxisData: {
    control: 'object',
    description: 'Category labels for the X axis (columns).',
  },
  yAxisData: {
    control: 'object',
    description: 'Category labels for the Y axis (rows).',
  },
  data: {
    control: 'object',
    description: 'Cell values as [xIndex, yIndex, value] tuples.',
  },
  showLabel: {
    control: 'boolean',
    description: 'When true, shows the numeric value on each cell. Default: false',
  },
  labelFormatter: {
    control: false,
    description: 'Formatter for heatmap cell labels. ({ value: [xIndex, yIndex, value], dataIndex, seriesName? }) => string',
  },
  showXAxis: {
    control: 'boolean',
    description: 'Whether to show the X-axis labels. Default: true',
  },
  showYAxis: {
    control: 'boolean',
    description: 'Whether to show the Y-axis labels. Default: true',
  },
  tooltip: {
    control: 'select',
    options: ['card', 'compact', 'kpi', 'striped', 'none'],
    description: "Built-in cell tooltip preset when renderTooltip is omitted. Default: 'card'.",
  },
  renderTooltip: {
    control: false,
    description: 'Custom React Native tooltip body for the hovered cell.',
  },
  onSelect: {
    control: false,
    description: 'Called when the user taps/clicks a cell. Receives indices, labels, and value.',
  },
} as const;

export const heatmapChartArgTypes = {
  ...commonChartArgTypes,
  ...heatmapOnlyArgTypes,
} as const;

export const heatmapDemoHours = ['12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a'];

export const heatmapDemoDays = ['Sat', 'Fri', 'Thu', 'Wed', 'Tue', 'Mon', 'Sun'];

export function buildHeatmapDemoData(
  hourCount = heatmapDemoHours.length,
  dayCount = heatmapDemoDays.length
): Array<[number, number, number]> {
  const points: Array<[number, number, number]> = [];
  for (let x = 0; x < hourCount; x++) {
    for (let y = 0; y < dayCount; y++) {
      points.push([x, y, (x * 7 + y * 3 + (x ^ y)) % 10]);
    }
  }
  return points;
}

export const heatmapBaseArgs = {
  width: 420,
  height: 280,
  xAxisData: heatmapDemoHours,
  yAxisData: heatmapDemoDays,
  data: buildHeatmapDemoData(),
} as const;
