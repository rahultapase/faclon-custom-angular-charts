import {
  Component,
  input,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { TooltipData } from '../../models/chart.models';

@Component({
  selector: 'io-chart-tooltip',
  templateUrl: './chart-tooltip.html',
  styleUrl: './chart-tooltip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartTooltip {
  readonly data = input<TooltipData | null>(null);

  protected readonly visible = computed(() => this.data() !== null);

  protected readonly style = computed(() => {
    const d = this.data();
    if (!d) return {};
    return {
      left: d.x + 12 + 'px',
      top: d.y - 10 + 'px',
    };
  });
}
