/**
 * ArgTypes for Stack chart (common + stack-specific).
 */
import { commonChartArgTypes } from '../args/common';
import { legendPositionArgType } from '../args/legend-position';

const stackOnlyArgTypes = {
  data: {
    control: 'object',
    description:
      'Segments stacked into one track, in draw order. Example: [{ label: "Salary", value: 120 }, { label: "Bonus", value: 80 }]. Plain numbers are accepted as a shorthand.',
  },
  view: {
    control: 'select',
    options: ['bar', 'semi-circle', 'arc'],
    description:
      "Shape of the track: 'bar' (horizontal pill), 'semi-circle' (180°) or 'arc' (270° gauge). Default: 'bar'.",
  },
  layout: {
    control: 'inline-radio',
    options: ['overlap', 'stack'],
    description:
      "How segments share the track: 'overlap' (every segment starts at min, longest drawn first) or 'stack' (end to end). Default: 'overlap'.",
  },
  min: {
    control: 'number',
    description: 'Start of the scale. Default: 0',
  },
  max: {
    control: 'number',
    description:
      'End of the scale. When omitted the stack fills the whole track; set a larger value to leave an unfilled remainder.',
  },
  interval: {
    control: 'number',
    description: 'Distance between axis labels, in value units. Auto when omitted.',
  },
  trackColor: {
    control: 'color',
    description: 'Color of the unfilled part of the track. Default: #e8e8e899',
  },
  thickness: {
    control: { type: 'number', min: 4, max: 80, step: 2 },
    description: 'Thickness of the bar in pixels (bar view only). Default: 24',
  },
  innerRadius: {
    control: 'text',
    description: 'Inner radius of the ring (arc views), e.g. "58%".',
  },
  outerRadius: {
    control: 'text',
    description: 'Outer radius of the ring (arc views), e.g. "82%".',
  },
  edge: {
    control: 'inline-radio',
    options: ['curve', 'flat'],
    description:
      "Shape of the two ends of the track: 'curve' (rounded) or 'flat' (square). Default: 'curve'.",
  },
  startAngle: {
    control: { type: 'number', min: -90, max: 360, step: 5 },
    description: 'Angle the scale starts at (arc views). 0 = right, 90 = top, 180 = left.',
  },
  endAngle: {
    control: { type: 'number', min: -90, max: 360, step: 5 },
    description: 'Angle the scale ends at (arc views).',
  },
  showAxisLabels: {
    control: 'boolean',
    description: 'Whether to show the scale labels along the track. Default: true',
  },
  axisLabelFormatter: {
    control: false,
    description: 'Formats a scale label, e.g. (v) => `$${v}`.',
  },
  axisLabelMargin: {
    control: { type: 'number', min: -60, max: 60, step: 2 },
    description:
      'Distance between the track and its scale labels. Negative values move labels inside the ring. Default: 8',
  },
  showSegmentLabels: {
    control: 'boolean',
    description: 'Whether to draw each segment value inside the segment. Default: false',
  },
  segmentLabelFormatter: {
    control: false,
    description: 'Formats the label drawn inside a segment. Implies showSegmentLabels.',
  },
  centerText: {
    control: 'text',
    description: 'Text at the center of the ring (arc views).',
  },
  centerSubtext: {
    control: 'text',
    description: 'Text below centerText (arc views).',
  },
  showLegend: {
    control: 'boolean',
    description: 'Whether to show the legend (segment labels). Default: true',
  },
  ...legendPositionArgType,
  tooltip: {
    control: 'select',
    options: ['card', 'compact', 'kpi', 'striped', 'none'],
    description:
      "Built-in item tooltip preset when renderTooltip is omitted. Default: 'card'. Use 'none' to hide.",
  },
  renderTooltip: {
    control: false,
    description: 'Custom React Native tooltip body for the hovered segment.',
  },
  onSelect: {
    control: false,
    description:
      'Called when the user taps/clicks a segment. Receives seriesIndex, dataIndex, label, value, percent.',
  },
} as const;

export const stackChartArgTypes = {
  ...commonChartArgTypes,
  ...stackOnlyArgTypes,
} as const;
