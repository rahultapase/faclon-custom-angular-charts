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
  computeColumnBars,
  computeYAxisTicks,
  getMaxValue,
  getChartArea,
  formatValue,
} from '../../utils/chart-math.utils';

@Component({
  selector: 'io-chart-column',
  templateUrl: './chart-column.html',
  styleUrl: './chart-column.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartColumn {
  readonly series = input.required<SeriesItem[]>();
  readonly dimensions = input.required<ChartDimensions>();
  readonly tooltipEvent = output<TooltipData | null>();

  protected hoveredIndex = signal<number | null>(null);

  protected readonly viewBox = computed(() => {
    const d = this.dimensions();
    return `0 0 ${d.width} ${d.height}`;
  });

  protected readonly area = computed(() => getChartArea(this.dimensions()));

  protected readonly bars = computed(() =>
    computeColumnBars(this.series(), this.dimensions())
  );

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

  protected onBarEnter(index: number, event: MouseEvent): void {
    this.hoveredIndex.set(index);
    const bar = this.bars()[index];
    if (bar) {
      this.tooltipEvent.emit({ item: bar.item, x: event.clientX, y: event.clientY });
    }
  }

  protected onBarLeave(): void {
    this.hoveredIndex.set(null);
    this.tooltipEvent.emit(null);
  }
}
