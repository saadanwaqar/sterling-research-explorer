import {
  Component,
  inject,
  output,
  ChangeDetectionStrategy,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReadingListService } from '../../services/reading-list.service';
import { Paper } from '../../models/paper.model';

@Component({
  selector: 'app-reading-list-panel',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="panel">
      <div class="panel-header">
        <div class="panel-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
          Reading List
          @if (readingListService.count() > 0) {
            <span class="count-badge">{{ readingListService.count() }}</span>
          }
        </div>
        <button class="close-btn" (click)="close.emit()" aria-label="Close reading list">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      @if (papers().length === 0) {
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
          <p>No papers saved yet.</p>
          <p class="empty-hint">Click the bookmark icon on any paper card.</p>
        </div>
      } @else {
        <div class="panel-actions">
          <button class="action-btn export-btn" (click)="exportBibtex()">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export All as BibTeX
          </button>
          <button class="action-btn clear-btn" (click)="clearAll()">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6l-1 14H6L5 6"></path>
              <path d="M10 11v6"></path>
              <path d="M14 11v6"></path>
              <path d="M9 6V4h6v2"></path>
            </svg>
            Clear All
          </button>
        </div>

        <ul class="papers-list">
          @for (paper of papers(); track paper.id) {
            <li class="paper-item">
              <div class="paper-info">
                <span class="paper-title">{{ paper.title }}</span>
                <div class="paper-meta">
                  @if (paper.yearPublished) {
                    <span class="paper-year">{{ paper.yearPublished }}</span>
                  }
                  @if (paper.authors && paper.authors.length > 0) {
                    <span class="paper-authors">{{ paper.authors.slice(0, 2).map(a => a.name).join(', ') }}{{ paper.authors.length > 2 ? ' et al.' : '' }}</span>
                  }
                </div>
              </div>
              <button class="remove-btn" (click)="remove(paper.id)" aria-label="Remove from reading list">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: [`
    .panel {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #12142a;
      color: #e8eaf6;
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.25rem 1rem;
      border-bottom: 1px solid rgba(79, 142, 247, 0.15);
      flex-shrink: 0;
    }

    .panel-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1rem;
      font-weight: 700;
      color: #ffd54f;
    }

    .count-badge {
      background: rgba(255, 213, 79, 0.2);
      color: #ffd54f;
      border: 1px solid rgba(255, 213, 79, 0.3);
      padding: 0.1em 0.5em;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: rgba(159, 168, 218, 0.6);
      padding: 4px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      transition: color 0.2s ease;

      &:hover {
        color: #e8eaf6;
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      gap: 0.5rem;
      padding: 2rem;
      text-align: center;
      color: rgba(159, 168, 218, 0.5);

      svg {
        opacity: 0.3;
        margin-bottom: 0.5rem;
      }

      p {
        margin: 0;
        font-size: 0.9rem;
      }
    }

    .empty-hint {
      font-size: 0.8rem !important;
      opacity: 0.7;
    }

    .panel-actions {
      display: flex;
      gap: 0.5rem;
      padding: 0.875rem 1.25rem;
      border-bottom: 1px solid rgba(79, 142, 247, 0.1);
      flex-shrink: 0;
      flex-wrap: wrap;
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0.4em 0.8em;
      border-radius: 20px;
      font-family: inherit;
      transition: background 0.2s ease;
      letter-spacing: 0.03em;
    }

    .export-btn {
      border: 1px solid rgba(79, 142, 247, 0.3);
      background: rgba(79, 142, 247, 0.1);
      color: #4f8ef7;

      &:hover {
        background: rgba(79, 142, 247, 0.2);
      }
    }

    .clear-btn {
      border: 1px solid rgba(239, 83, 80, 0.3);
      background: rgba(239, 83, 80, 0.08);
      color: #ef5350;

      &:hover {
        background: rgba(239, 83, 80, 0.16);
      }
    }

    .papers-list {
      list-style: none;
      margin: 0;
      padding: 0;
      overflow-y: auto;
      flex: 1;
    }

    .paper-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.875rem 1.25rem;
      border-bottom: 1px solid rgba(79, 142, 247, 0.07);
      transition: background 0.15s ease;

      &:hover {
        background: rgba(79, 142, 247, 0.05);
      }
    }

    .paper-info {
      flex: 1;
      min-width: 0;
    }

    .paper-title {
      display: block;
      font-size: 0.8rem;
      font-weight: 500;
      color: #c5cae9;
      line-height: 1.4;
      margin-bottom: 0.3rem;
    }

    .paper-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .paper-year {
      font-size: 0.72rem;
      color: #4f8ef7;
      font-weight: 600;
    }

    .paper-authors {
      font-size: 0.72rem;
      color: rgba(159, 168, 218, 0.6);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 180px;
    }

    .remove-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: rgba(159, 168, 218, 0.4);
      padding: 2px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      flex-shrink: 0;
      transition: color 0.2s ease;

      &:hover {
        color: #ef5350;
      }
    }
  `]
})
export class ReadingListPanelComponent {
  readingListService = inject(ReadingListService);
  close = output<void>();

  papers = computed(() => this.readingListService.getAll());

  remove(id: string): void {
    this.readingListService.remove(id);
  }

  clearAll(): void {
    if (confirm('Remove all saved papers?')) {
      this.readingListService.clear();
    }
  }

  exportBibtex(): void {
    const entries = this.papers().map(p => this.toBibtex(p));
    const content = entries.join('\n\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reading-list.bib';
    a.click();
    URL.revokeObjectURL(url);
  }

  private toBibtex(p: Paper): string {
    const firstAuthorLastName = (p.authors?.[0]?.name ?? 'unknown').split(' ').pop()?.toLowerCase() ?? 'unknown';
    const year = p.yearPublished ?? 'nd';
    const key = `${firstAuthorLastName}${year}`;
    const authors = (p.authors ?? []).map(a => a.name).join(' and ') || 'Unknown';
    const lines = [
      `@article{${key},`,
      `  author    = {${authors}},`,
      `  title     = {${p.title ?? ''}},`,
      `  year      = {${year}},`,
      p.publisher ? `  journal   = {${p.publisher}},` : '',
      p.doi ? `  doi       = {${p.doi}},` : '',
      p.downloadUrl ? `  url       = {${p.downloadUrl}},` : '',
      `}`
    ].filter(l => l !== '');
    return lines.join('\n');
  }
}
