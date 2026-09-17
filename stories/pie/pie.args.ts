/**
 * ArgTypes for Pie chart (common + pie-specific).
 */
import { commonChartArgTypes } from '../args/common';
import { legendPositionArgType } from '../args/legend-position';

const pieOnlyArgTypes = {
  data: {
    ...commonChartArgTypes.data,
    description:
      'Single pie: [{ name, value }, ...]. Concentric: [{ name?, radius: [inner, outer], data: [{ name, value }, ...] }, ...].',
  },
  radius: {
    control: 'text',
    description: 'Radius of the pie. Number, string (e.g. "60%"), or [inner, outer] for donut. Default: "75%"',
  },
  showLegend: {
    control: 'boolean',
    description: 'Whether to show the legend for slices. Default: true',
  },
  ...legendPositionArgType,
  showLabel: {
    control: 'boolean',
    description: 'Whether to show slice labels on the chart. Default: true',
  },
  labelPosition: {
    control: 'select',
    options: ['outside', 'inside', 'center'],
    description: 'Label position: outside, inside, or center. Default: outside',
  },
  showLabelLine: {
    control: 'boolean',
    description: 'Whether to show label lines (connectors). Default: true when labels outside',
  },
  labelFormatter: {
    control: false,
    description: 'Formatter for pie slice labels. ({ name, value, percent, dataIndex, seriesName? }) => string',
  },
  tooltip: {
    control: 'select',
    options: ['card', 'compact', 'kpi', 'striped', 'none'],
    description:
      "Built-in item tooltip preset when renderTooltip is omitted. Default: 'card'. Use 'none' to hide.",
  },
  renderTooltip: {
    control: false,
    description: 'Custom React Native tooltip body for pie slices.',
  },
  onSelect: {
    control: false,
    description:
      'Called when the user taps/clicks a slice. Receives seriesIndex, dataIndex, name, value, optional seriesName, percent.',
  },
} as const;

export const pieChartArgTypes = {
  ...commonChartArgTypes,
  ...pieOnlyArgTypes,
} as const;
