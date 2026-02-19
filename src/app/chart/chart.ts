import {
  Component,
  input,
  computed,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  group,
} from '@angular/animations';
import { ChartOptions, TooltipData } from './models/chart.models';
import { defaultDimensions, pieDimensions } from './utils/chart-math.utils';
import { ChartLine } from './components/chart-line/chart-line';
import { ChartColumn } from './components/chart-column/chart-column';
import { ChartPie } from './components/chart-pie/chart-pie';
import { ChartLegend } from './components/chart-legend/chart-legend';
import { ChartTooltip } from './components/chart-tooltip/chart-tooltip';

@Component({
  selector: 'io-chart',
  imports: [ChartLine, ChartColumn, ChartPie, ChartLegend, ChartTooltip],
  templateUrl: './chart.html',
  styleUrl: './chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('chartSwap', [
      transition('* <=> *', [
        group([
          query(
            ':leave',
            [
              style({ opacity: 1, position: 'absolute', width: '100%' }),
              animate(
                '250ms ease-out',
                style({ opacity: 0, transform: 'scale(0.95)' })
              ),
            ],
            { optional: true }
          ),
          query(
            ':enter',
            [
              style({ opacity: 0, transform: 'scale(0.95)' }),
              animate(
                '350ms 100ms ease-out',
                style({ opacity: 1, transform: 'scale(1)' })
              ),
            ],
            { optional: true }
          ),
        ]),
      ]),
    ]),
  ],
})
export class IoChart {
  readonly chartOptions = input.required<ChartOptions>();

  protected readonly tooltipData = signal<TooltipData | null>(null);

  protected readonly chartType = computed(
    () => this.chartOptions()?.type ?? 'column'
  );

  protected readonly title = computed(
    () => this.chartOptions()?.title ?? ''
  );

  protected readonly series = computed(
    () => this.chartOptions()?.series ?? []
  );

  protected readonly dimensions = computed(() => {
    const type = this.chartType();
    return type === 'pie' ? pieDimensions() : defaultDimensions();
  });

  protected readonly isEmpty = computed(() => this.series().length === 0);

  protected onTooltip(data: TooltipData | null): void {
    this.tooltipData.set(data);
  }
}
