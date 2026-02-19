import {
  SeriesItem,
  ChartDimensions,
  ComputedPoint,
  ComputedBar,
  ComputedSlice,
} from '../models/chart.models';

/**
 * Convert polar coordinates to cartesian.
 */
export function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleRad: number
): { x: number; y: number } {
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

/**
 * Get the usable chart area from dimensions.
 */
export function getChartArea(dim: ChartDimensions): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  return {
    x: dim.padding.left,
    y: dim.padding.top,
    width: dim.width - dim.padding.left - dim.padding.right,
    height: dim.height - dim.padding.top - dim.padding.bottom,
  };
}

/**
 * Clamp a value to >= 0.
 */
function clamp(v: number): number {
  return Math.max(0, v);
}

/**
 * Get the maximum value from a series, clamped and with a minimum of 1 to avoid division by zero.
 */
export function getMaxValue(series: SeriesItem[]): number {
  if (!series.length) return 1;
  const max = Math.max(...series.map((s) => clamp(s.value)));
  return max > 0 ? max : 1;
}

/**
 * Compute nice Y-axis ticks for line and column charts.
 */
export function computeYAxisTicks(
  maxValue: number,
  tickCount: number = 5
): number[] {
  if (maxValue <= 0) return [0];

  const rawStep = maxValue / tickCount;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const residual = rawStep / magnitude;

  let niceStep: number;
  if (residual <= 1.5) niceStep = 1 * magnitude;
  else if (residual <= 3) niceStep = 2 * magnitude;
  else if (residual <= 7) niceStep = 5 * magnitude;
  else niceStep = 10 * magnitude;

  const ticks: number[] = [];
  for (let v = 0; v <= maxValue + niceStep * 0.01; v += niceStep) {
    ticks.push(Math.round(v * 1000) / 1000);
  }

  // Ensure maxValue is reachable
  if (ticks[ticks.length - 1] < maxValue) {
    ticks.push(ticks[ticks.length - 1] + niceStep);
  }

  return ticks;
}

/**
 * Compute points for a line chart.
 */
export function computeLinePoints(
  series: SeriesItem[],
  dim: ChartDimensions
): ComputedPoint[] {
  if (!series.length) return [];

  const area = getChartArea(dim);
  const maxVal = getMaxValue(series);
  const ticks = computeYAxisTicks(maxVal);
  const scaleMax = ticks[ticks.length - 1] || 1;

  const count = series.length;
  const xStep = count > 1 ? area.width / (count - 1) : 0;

  return series.map((item, i) => {
    const val = clamp(item.value);
    return {
      x: count > 1 ? area.x + i * xStep : area.x + area.width / 2,
      y: area.y + area.height - (val / scaleMax) * area.height,
      item,
      index: i,
    };
  });
}

/**
 * Compute bars for a column chart.
 */
export function computeColumnBars(
  series: SeriesItem[],
  dim: ChartDimensions
): ComputedBar[] {
  if (!series.length) return [];

  const area = getChartArea(dim);
  const maxVal = getMaxValue(series);
  const ticks = computeYAxisTicks(maxVal);
  const scaleMax = ticks[ticks.length - 1] || 1;

  const count = series.length;
  const totalSlotWidth = area.width / count;
  const barWidth = Math.min(totalSlotWidth * 0.6, 60);
  const gap = (totalSlotWidth - barWidth) / 2;

  return series.map((item, i) => {
    const val = clamp(item.value);
    const barHeight = (val / scaleMax) * area.height;
    return {
      x: area.x + i * totalSlotWidth + gap,
      y: area.y + area.height - barHeight,
      width: barWidth,
      height: barHeight,
      item,
      index: i,
    };
  });
}

/**
 * Build an SVG arc path string for a pie slice.
 */
export function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
}

/**
 * Compute slices for a pie chart.
 */
export function computePieSlices(
  series: SeriesItem[],
  cx: number,
  cy: number,
  radius: number
): ComputedSlice[] {
  if (!series.length) return [];

  const total = series.reduce((sum, s) => sum + clamp(s.value), 0);
  if (total === 0) return [];

  let currentAngle = -Math.PI / 2; // Start from top
  const labelRadius = radius * 0.65;

  return series.map((item, i) => {
    const val = clamp(item.value);
    const sliceAngle = (val / total) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    const midAngle = startAngle + sliceAngle / 2;

    const labelPos = polarToCartesian(cx, cy, labelRadius, midAngle);

    // For a full circle (single item), use a special path
    let path: string;
    if (series.length === 1 || sliceAngle >= 2 * Math.PI - 0.001) {
      // Full circle — use two arcs
      const r = radius;
      path = `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy} Z`;
    } else {
      path = describeArc(cx, cy, radius, startAngle, endAngle);
    }

    currentAngle = endAngle;

    return {
      startAngle,
      endAngle,
      path,
      midAngle,
      percentage: Math.round((val / total) * 100),
      item,
      index: i,
      labelX: labelPos.x,
      labelY: labelPos.y,
    };
  });
}

/**
 * Format large numbers for display.
 */
export function formatValue(value: number): string {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
  if (value >= 1_000) return (value / 1_000).toFixed(1) + 'K';
  return value.toString();
}

/**
 * Default chart dimensions.
 */
export function defaultDimensions(): ChartDimensions {
  return {
    width: 500,
    height: 320,
    padding: { top: 30, right: 30, bottom: 50, left: 55 },
  };
}

/**
 * Pie-specific dimensions (less padding needed).
 */
export function pieDimensions(): ChartDimensions {
  return {
    width: 500,
    height: 320,
    padding: { top: 20, right: 20, bottom: 20, left: 20 },
  };
}
