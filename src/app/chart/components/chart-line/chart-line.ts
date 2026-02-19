import {
  Component,
  input,
  computed,
  signal,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { SeriesItem, ChartDimensions, TooltipData } from '../../models/chart.models';
import {
  computeLinePoints,
  computeYAxisTicks,
  getMaxValue,
  getChartArea,
  formatValue,
} from '../../utils/chart-math.utils';

@Component({
  selector: 'io-chart-line',
  templateUrl: './chart-line.html',
  styleUrl: './chart-line.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartLine {
  readonly series = input.required<SeriesItem[]>();
  readonly dimensions = input.required<ChartDimensions>();
  readonly tooltipEvent = output<TooltipData | null>();

  protected hoveredIndex = signal<number | null>(null);

  protected readonly viewBox = computed(() => {
    const d = this.dimensions();
    return `0 0 ${d.width} ${d.height}`;
  });

  protected readonly area = computed(() => getChartArea(this.dimensions()));

  protected readonly points = computed(() =>
    computeLinePoints(this.series(), this.dimensions())
  );

  protected readonly polylinePoints = computed(() =>
    this.points()
      .map((p) => `${p.x},${p.y}`)
      .join(' ')
  );

  protected readonly areaPath = computed(() => {
    const pts = this.points();
    if (pts.length < 2) return '';
    const a = this.area();
    const baseline = a.y + a.height;
    const first = pts[0];
    const last = pts[pts.length - 1];
    const linePoints = pts.map((p) => `L ${p.x} ${p.y}`).join(' ');
    return `M ${first.x} ${baseline} ${linePoints} L ${last.x} ${baseline} Z`;
  });

  protected readonly yTicks = computed(() => {
    const maxVal = getMaxValue(this.series());
    return computeYAxisTicks(maxVal);
  });

  protected readonly scaleMax = computed(() => {
    const ticks = this.yTicks();
    return ticks[ticks.length - 1] || 1;
  });

  protected readonly gridLines = computed(() => {
    const ticks = this.yTicks();
    const a = this.area();
    const max = this.scaleMax();
    return ticks.map((tick) => ({
      y: a.y + a.height - (tick / max) * a.height,
      label: formatValue(tick),
      value: tick,
    }));
  });

  protected readonly lineColor = computed(() => {
    const s = this.series();
    return s.length > 0 ? s[0].color : '#888';
  });

  protected onPointEnter(index: number, event: MouseEvent): void {
    this.hoveredIndex.set(index);
    const pt = this.points()[index];
    if (pt) {
      this.tooltipEvent.emit({ item: pt.item, x: event.clientX, y: event.clientY });
    }
  }

  protected onPointLeave(): void {
    this.hoveredIndex.set(null);
    this.tooltipEvent.emit(null);
  }
}
