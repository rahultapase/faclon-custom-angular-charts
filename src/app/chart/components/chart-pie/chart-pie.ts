import {
  Component,
  input,
  computed,
  signal,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { SeriesItem, ChartDimensions, TooltipData } from '../../models/chart.models';
import { computePieSlices, getChartArea } from '../../utils/chart-math.utils';

@Component({
  selector: 'io-chart-pie',
  templateUrl: './chart-pie.html',
  styleUrl: './chart-pie.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartPie {
  readonly series = input.required<SeriesItem[]>();
  readonly dimensions = input.required<ChartDimensions>();
  readonly tooltipEvent = output<TooltipData | null>();

  protected hoveredIndex = signal<number | null>(null);

  protected readonly viewBox = computed(() => {
    const d = this.dimensions();
    return `0 0 ${d.width} ${d.height}`;
  });

  protected readonly center = computed(() => {
    const d = this.dimensions();
    return { cx: d.width / 2, cy: d.height / 2 };
  });

  protected readonly radius = computed(() => {
    const d = this.dimensions();
    const area = getChartArea(d);
    return Math.min(area.width, area.height) / 2 - 10;
  });

  protected readonly slices = computed(() => {
    const c = this.center();
    return computePieSlices(this.series(), c.cx, c.cy, this.radius());
  });

  protected readonly isEmpty = computed(() => this.slices().length === 0);

  protected getHoverTransform(index: number): string {
    if (this.hoveredIndex() !== index) return 'translate(0,0)';
    const slice = this.slices()[index];
    if (!slice) return 'translate(0,0)';
    const offset = 8;
    const dx = offset * Math.cos(slice.midAngle);
    const dy = offset * Math.sin(slice.midAngle);
    return `translate(${dx},${dy})`;
  }

  protected onSliceEnter(index: number, event: MouseEvent): void {
    this.hoveredIndex.set(index);
    const slice = this.slices()[index];
    if (slice) {
      this.tooltipEvent.emit({
        item: slice.item,
        x: event.clientX,
        y: event.clientY,
        percentage: slice.percentage,
      });
    }
  }

  protected onSliceLeave(): void {
    this.hoveredIndex.set(null);
    this.tooltipEvent.emit(null);
  }
}
