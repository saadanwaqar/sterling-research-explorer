import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreApiService } from './services/core-api.service';
import { ReadingListService } from './services/reading-list.service';
import { Paper } from './models/paper.model';
import { SearchBarComponent, SearchEvent } from './components/search-bar/search-bar.component';
import { PaperCardComponent } from './components/paper-card/paper-card.component';
import { PapersChartComponent } from './components/papers-chart/papers-chart.component';
import { ReadingListPanelComponent } from './components/reading-list-panel/reading-list-panel.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SearchBarComponent, PaperCardComponent, PapersChartComponent, ReadingListPanelComponent],
  styleUrl: './app.scss',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private coreApiService = inject(CoreApiService);
  readingListService = inject(ReadingListService);

  papers = signal<Paper[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  totalHits = signal(0);
  currentQuery = signal('');
  showReadingList = signal(false);
  highlightTerms = signal<string[]>([]);

  readingListCount = this.readingListService.count;

  onSearch(event: SearchEvent): void {
    const { query, limit } = event;
    this.loading.set(true);
    this.error.set(null);
    this.currentQuery.set(query);

    // Parse highlight terms: split on spaces and boolean operators, strip parens
    const terms = query
      .replace(/[()]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 0 && !['AND', 'OR', 'NOT'].includes(t.toUpperCase()));
    this.highlightTerms.set(terms);

    this.coreApiService.searchPapers(query, limit).subscribe({
      next: (response) => {
        this.papers.set(response.results ?? []);
        this.totalHits.set(response.totalHits ?? 0);
        this.loading.set(false);
      },
      error: (err: string) => {
        this.error.set(err);
        this.papers.set([]);
        this.loading.set(false);
      }
    });
  }

  toggleReadingList(): void {
    this.showReadingList.update(v => !v);
  }
}
