import { Component, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { IoChart } from './chart/chart';
import { ChartOptions, SeriesItem } from './chart/models/chart.models';

const PALETTE = [
  '#f97316', '#6366f1', '#14b8a6', '#ec4899',
  '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444',
  '#22c55e', '#a855f7',
];

@Component({
  selector: 'app-root',
  imports: [IoChart, FormsModule, TitleCasePipe],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly isDark = signal(true);

  ngOnInit(): void {
    const saved = localStorage.getItem('datapulse-theme');
    if (saved === 'light') {
      this.isDark.set(false);
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }

  protected toggleTheme(): void {
    const dark = !this.isDark();
    this.isDark.set(dark);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('datapulse-theme', dark ? 'dark' : 'light');
  }

  protected readonly playType = signal<'line' | 'column' | 'pie'>('column');
  protected readonly playTitle = signal('Sales Report');
  protected readonly playSeries = signal<SeriesItem[]>([
    { name: 'Offline', value: 30, color: '#ef4444' },
    { name: 'Online', value: 70, color: '#3b82f6' },
  ]);

  protected readonly playOptions = computed<ChartOptions>(() => ({
    type: this.playType(),
    title: this.playTitle(),
    series: this.playSeries(),
  }));

  protected onPlayTypeChange(type: 'line' | 'column' | 'pie'): void {
    this.playType.set(type);
  }

  protected onPlayTitleChange(title: string): void {
    this.playTitle.set(title);
  }

  protected onSeriesNameChange(index: number, name: string): void {
    this.updateSeriesAt(index, (item) => ({ ...item, name }));
  }

  protected onSeriesValueChange(index: number, value: number): void {
    this.updateSeriesAt(index, (item) => ({ ...item, value: value || 0 }));
  }

  protected onSeriesColorChange(index: number, color: string): void {
    this.updateSeriesAt(index, (item) => ({ ...item, color }));
  }

  protected addSeriesItem(): void {
    const current = this.playSeries();
    const idx = current.length;
    this.playSeries.set([
      ...current,
      { name: `Item ${idx + 1}`, value: Math.floor(Math.random() * 80) + 10, color: PALETTE[idx % PALETTE.length] },
    ]);
  }

  protected removeSeriesItem(index: number): void {
    this.playSeries.set(this.playSeries().filter((_, i) => i !== index));
  }

  protected loadPreset(preset: 'line' | 'column' | 'pie'): void {
    const presets: Record<string, { title: string; series: SeriesItem[] }> = {
      line: {
        title: 'Monthly Revenue',
        series: [
          { name: 'Jan', value: 42, color: '#f97316' },
          { name: 'Feb', value: 58, color: '#f97316' },
          { name: 'Mar', value: 35, color: '#f97316' },
          { name: 'Apr', value: 78, color: '#f97316' },
          { name: 'May', value: 65, color: '#f97316' },
          { name: 'Jun', value: 90, color: '#f97316' },
        ],
      },
      column: {
        title: 'Sales by Region',
        series: [
          { name: 'North', value: 120, color: '#6366f1' },
          { name: 'South', value: 85, color: '#ec4899' },
          { name: 'East', value: 145, color: '#14b8a6' },
          { name: 'West', value: 70, color: '#f59e0b' },
        ],
      },
      pie: {
        title: 'Market Share',
        series: [
          { name: 'Offline', value: 30, color: '#f97316' },
          { name: 'Online', value: 45, color: '#6366f1' },
          { name: 'Retail', value: 15, color: '#14b8a6' },
          { name: 'Wholesale', value: 10, color: '#ec4899' },
        ],
      },
    };
    const p = presets[preset];
    this.playType.set(preset);
    this.playTitle.set(p.title);
    this.playSeries.set([...p.series]);
  }

  private updateSeriesAt(index: number, fn: (item: SeriesItem) => SeriesItem): void {
    this.playSeries.set(
      this.playSeries().map((item, i) => (i === index ? fn(item) : item))
    );
  }
}
