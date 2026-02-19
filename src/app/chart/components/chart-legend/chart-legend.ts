import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { SeriesItem } from '../../models/chart.models';

@Component({
  selector: 'io-chart-legend',
  templateUrl: './chart-legend.html',
  styleUrl: './chart-legend.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartLegend {
  readonly series = input.required<SeriesItem[]>();
  readonly hovered = output<number | null>();

  protected onItemEnter(index: number): void {
    this.hovered.emit(index);
  }

  protected onItemLeave(): void {
    this.hovered.emit(null);
  }
}
