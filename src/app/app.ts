import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreApiService } from './services/core-api.service';
import { Paper } from './models/paper.model';
import { SearchBarComponent, SearchEvent } from './components/search-bar/search-bar.component';
import { PaperCardComponent } from './components/paper-card/paper-card.component';
import { PapersChartComponent } from './components/papers-chart/papers-chart.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SearchBarComponent, PaperCardComponent, PapersChartComponent],
  styleUrl: './app.scss',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private coreApiService = inject(CoreApiService);

  papers = signal<Paper[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  totalHits = signal(0);
  currentQuery = signal('');

  onSearch(event: SearchEvent): void {
    const { query, limit } = event;
    this.loading.set(true);
    this.error.set(null);
    this.currentQuery.set(query);

    this.coreApiService.searchPapers(query, limit).subscribe({
      next: (response) => {
        this.papers.set(response.results ?? []);
        this.totalHits.set(response.totalHits ?? 0);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Search error:', err);
        this.error.set('An unexpected error occurred. Please try again.');
        this.loading.set(false);
      }
    });
  }
}
