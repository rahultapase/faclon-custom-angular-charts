export interface SeriesItem {
  name: string;
  value: number;
  color: string;
}

export interface ChartOptions {
  type: 'line' | 'column' | 'pie';
  title: string;
  series: SeriesItem[];
}

export interface ChartDimensions {
  width: number;
  height: number;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface ComputedPoint {
  x: number;
  y: number;
  item: SeriesItem;
  index: number;
}

export interface ComputedBar {
  x: number;
  y: number;
  width: number;
  height: number;
  item: SeriesItem;
  index: number;
}

export interface ComputedSlice {
  startAngle: number;
  endAngle: number;
  path: string;
  midAngle: number;
  percentage: number;
  item: SeriesItem;
  index: number;
  labelX: number;
  labelY: number;
}

export interface TooltipData {
  item: SeriesItem;
  x: number;
  y: number;
  percentage?: number;
}
