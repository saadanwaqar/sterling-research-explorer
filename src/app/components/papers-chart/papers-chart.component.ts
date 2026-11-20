import {
  Component,
  input,
  OnChanges,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  SimpleChanges
} from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { Paper } from '../../models/paper.model';

Chart.register(...registerables);

@Component({
  selector: 'app-papers-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="chart-container">
      <div class="chart-header">
        <h3 class="chart-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          Papers by Publication Year
        </h3>
        <span class="chart-subtitle">Distribution of results across years</span>
      </div>
      <div class="canvas-wrapper">
        <canvas #chartCanvas></canvas>
      </div>
    </div>
  `,
  styles: [`
    .chart-container {
      background: #1a1d2e;
      border: 1px solid rgba(79, 142, 247, 0.15);
      border-radius: 12px;
      padding: 1.5rem;
    }

    .chart-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .chart-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1rem;
      font-weight: 600;
      color: #e8eaf6;
      margin: 0;

      svg {
        color: #4f8ef7;
      }
    }

    .chart-subtitle {
      font-size: 0.75rem;
      color: #9fa8da;
      opacity: 0.7;
    }

    .canvas-wrapper {
      position: relative;
      height: 240px;
    }

    canvas {
      width: 100% !important;
      height: 100% !important;
    }
  `]
})
export class PapersChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  papers = input<Paper[]>([]);

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chartInstance: Chart | null = null;
  private isViewInitialized = false;

  ngAfterViewInit(): void {
    this.isViewInitialized = true;
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['papers'] && this.isViewInitialized) {
      this.renderChart();
    }
  }

  ngOnDestroy(): void {
    this.destroyChart();
  }

  private destroyChart(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  }

  private renderChart(): void {
    const papers = this.papers();
    const yearMap = new Map<number, number>();

    for (const paper of papers) {
      if (paper.yearPublished && paper.yearPublished > 1900 && paper.yearPublished <= new Date().getFullYear() + 1) {
        yearMap.set(paper.yearPublished, (yearMap.get(paper.yearPublished) ?? 0) + 1);
      }
    }

    const sortedYears = Array.from(yearMap.keys()).sort((a, b) => a - b);
    const labels = sortedYears.map(String);
    const data = sortedYears.map(y => yearMap.get(y) ?? 0);

    this.destroyChart();

    if (!this.chartCanvas?.nativeElement) return;
    if (labels.length === 0) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, 240);
    gradient.addColorStop(0, 'rgba(79, 142, 247, 0.85)');
    gradient.addColorStop(1, 'rgba(108, 99, 255, 0.4)');

    this.chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Papers',
            data,
            backgroundColor: gradient,
            borderColor: 'rgba(79, 142, 247, 0.9)',
            borderWidth: 1,
            borderRadius: 6,
            borderSkipped: false,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(26, 29, 46, 0.95)',
            borderColor: 'rgba(79, 142, 247, 0.3)',
            borderWidth: 1,
            titleColor: '#e8eaf6',
            bodyColor: '#9fa8da',
            padding: 10,
            callbacks: {
              label: (ctx) => ` ${ctx.parsed.y} paper${ctx.parsed.y !== 1 ? 's' : ''}`
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(79, 142, 247, 0.06)',
            },
            ticks: {
              color: '#9fa8da',
              font: { size: 11 },
              maxRotation: 45,
            },
            border: {
              color: 'rgba(79, 142, 247, 0.15)'
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(79, 142, 247, 0.06)',
            },
            ticks: {
              color: '#9fa8da',
              font: { size: 11 },
              stepSize: 1,
              precision: 0,
            },
            border: {
              color: 'rgba(79, 142, 247, 0.15)'
            }
          }
        }
      }
    });
  }
}
