import {
  Component,
  input,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Paper } from '../../models/paper.model';
import { ReadingListService } from '../../services/reading-list.service';

@Component({
  selector: 'app-paper-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="paper-card">
      <!-- Bookmark button -->
      <button
        class="bookmark-btn"
        [class.saved]="saved()"
        (click)="toggleBookmark()"
        [title]="saved() ? 'Remove from Reading List' : 'Save to Reading List'"
        aria-label="Toggle bookmark"
      >
        @if (saved()) {
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
        } @else {
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
        }
        @if (showSavedFlash()) {
          <span class="saved-flash">Saved!</span>
        }
      </button>

      <div class="card-header">
        <div class="card-meta">
          @if (paper().yearPublished) {
            <span class="year-badge">{{ paper().yearPublished }}</span>
          }
          @if ((paper().citationCount ?? 0) > 0) {
            <span class="citation-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
              {{ paper().citationCount }} citations
            </span>
          }
        </div>
        <h3 class="paper-title">
          @if (paper().downloadUrl) {
            @if (highlightTerms().length > 0) {
              <a [href]="paper().downloadUrl" target="_blank" rel="noopener noreferrer" class="title-link" [innerHTML]="highlightedTitle()"></a>
            } @else {
              <a [href]="paper().downloadUrl" target="_blank" rel="noopener noreferrer" class="title-link">{{ paper().title }}</a>
            }
          } @else {
            @if (highlightTerms().length > 0) {
              <span [innerHTML]="highlightedTitle()"></span>
            } @else {
              {{ paper().title }}
            }
          }
        </h3>
      </div>

      @if (authorsDisplay().primary.length > 0) {
        <div class="authors">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span>{{ authorsDisplay().primary.join(', ') }}</span>
          @if (authorsDisplay().remaining > 0) {
            <span class="more-authors">+{{ authorsDisplay().remaining }} more</span>
          }
        </div>
      }

      @if (publisherDisplay()) {
        <div class="publisher">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
          <span>{{ publisherDisplay() }}</span>
        </div>
      }

      @if (paper().abstract) {
        <div class="abstract">
          <p class="abstract-text">
            @if (highlightTerms().length > 0) {
              <span [innerHTML]="highlightedAbstract()"></span>
            } @else {
              {{ showFullAbstract() ? paper().abstract : truncatedAbstract() }}
            }
            @if ((paper().abstract?.length ?? 0) > 200) {
              <button class="toggle-btn" (click)="toggleAbstract()">
                {{ showFullAbstract() ? ' Show less' : '... Show more' }}
              </button>
            }
          </p>
        </div>
      }

      <div class="card-footer">
        @if (paper().doi) {
          <a [href]="'https://doi.org/' + paper().doi" target="_blank" rel="noopener noreferrer" class="doi-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            DOI
          </a>
        }
        @if (paper().downloadUrl) {
          <a [href]="paper().downloadUrl" target="_blank" rel="noopener noreferrer" class="pdf-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            View PDF
          </a>
        }

        <!-- Cite button -->
        <div class="cite-container">
          <button class="cite-btn" (click)="toggleCiteMenu($event)" aria-label="Cite this paper">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 7H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-3"></path>
              <path d="M9 15h3l8.5-8.5a1.5 1.5 0 0 0-3-3L9 12v3"></path>
            </svg>
            Cite
          </button>
          @if (showCiteMenu()) {
            <div class="cite-dropdown">
              <button class="cite-option" (click)="copyApa()">
                Copy APA
                @if (showCopiedFlash()) {
                  <span class="copied-flash">Copied!</span>
                }
              </button>
              <button class="cite-option" (click)="copyBibtex()">
                Copy BibTeX
                @if (showCopiedFlash()) {
                  <span class="copied-flash">Copied!</span>
                }
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .paper-card {
      background: #1a1d2e;
      border: 1px solid rgba(79, 142, 247, 0.15);
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
      height: 100%;
      box-sizing: border-box;
      position: relative;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(79, 142, 247, 0.3);
        border-color: rgba(79, 142, 247, 0.3);
      }
    }

    .bookmark-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      background: none;
      border: none;
      cursor: pointer;
      color: rgba(159, 168, 218, 0.5);
      padding: 4px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: color 0.2s ease, background 0.2s ease;
      z-index: 1;

      &:hover {
        color: #ffd54f;
        background: rgba(255, 213, 79, 0.1);
      }

      &.saved {
        color: #ffd54f;
      }
    }

    .saved-flash {
      font-size: 0.7rem;
      font-weight: 600;
      color: #ffd54f;
      white-space: nowrap;
      animation: fadeInOut 1.5s ease forwards;
    }

    @keyframes fadeInOut {
      0% { opacity: 0; transform: translateY(-4px); }
      20% { opacity: 1; transform: translateY(0); }
      70% { opacity: 1; }
      100% { opacity: 0; }
    }

    .card-header {
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
      padding-right: 2rem;
    }

    .card-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .year-badge {
      background: rgba(79, 142, 247, 0.12);
      color: #4f8ef7;
      border: 1px solid rgba(79, 142, 247, 0.25);
      padding: 0.2em 0.6em;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.03em;
    }

    .citation-badge {
      background: rgba(67, 160, 71, 0.12);
      color: #43a047;
      border: 1px solid rgba(67, 160, 71, 0.25);
      padding: 0.2em 0.6em;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }

    .paper-title {
      font-size: 1rem;
      font-weight: 600;
      color: #e8eaf6;
      margin: 0;
      line-height: 1.4;
    }

    .title-link {
      color: inherit;
      text-decoration: none;
      transition: color 0.2s ease;

      &:hover {
        color: #4f8ef7;
      }
    }

    .authors, .publisher {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: #9fa8da;

      svg {
        flex-shrink: 0;
        opacity: 0.7;
      }

      span {
        line-height: 1.4;
      }
    }

    .more-authors {
      flex-shrink: 0;
      background: rgba(108, 99, 255, 0.12);
      color: #6c63ff;
      border: 1px solid rgba(108, 99, 255, 0.25);
      padding: 0.1em 0.5em;
      border-radius: 20px;
      font-size: 0.7rem;
      font-weight: 600;
    }

    .abstract {
      flex: 1;
    }

    .abstract-text {
      font-size: 0.8375rem;
      color: rgba(232, 234, 246, 0.65);
      line-height: 1.6;
      margin: 0;
    }

    .toggle-btn {
      background: none;
      border: none;
      color: #4f8ef7;
      cursor: pointer;
      font-size: 0.8375rem;
      padding: 0;
      font-family: inherit;
      font-weight: 500;
      transition: opacity 0.2s ease;

      &:hover {
        opacity: 0.8;
      }
    }

    .card-footer {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding-top: 0.5rem;
      border-top: 1px solid rgba(79, 142, 247, 0.08);
      margin-top: auto;
      flex-wrap: wrap;
    }

    .doi-link, .pdf-link {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-decoration: none;
      padding: 0.35em 0.75em;
      border-radius: 20px;
      transition: background 0.2s ease, opacity 0.2s ease;
      letter-spacing: 0.03em;
    }

    .doi-link {
      color: #9fa8da;
      background: rgba(159, 168, 218, 0.08);
      border: 1px solid rgba(159, 168, 218, 0.15);

      &:hover {
        background: rgba(159, 168, 218, 0.15);
      }
    }

    .pdf-link {
      color: #4f8ef7;
      background: rgba(79, 142, 247, 0.08);
      border: 1px solid rgba(79, 142, 247, 0.2);

      &:hover {
        background: rgba(79, 142, 247, 0.15);
      }
    }

    .cite-container {
      position: relative;
      margin-left: auto;
    }

    .cite-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0.35em 0.75em;
      border-radius: 20px;
      border: 1px solid rgba(159, 168, 218, 0.2);
      background: rgba(159, 168, 218, 0.06);
      color: #9fa8da;
      font-family: inherit;
      transition: background 0.2s ease;
      letter-spacing: 0.03em;

      &:hover {
        background: rgba(159, 168, 218, 0.14);
      }
    }

    .cite-dropdown {
      position: absolute;
      bottom: calc(100% + 6px);
      right: 0;
      background: #12142080;
      backdrop-filter: blur(10px);
      background: #1e2135;
      border: 1px solid rgba(79, 142, 247, 0.2);
      border-radius: 8px;
      overflow: hidden;
      z-index: 10;
      min-width: 140px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    }

    .cite-option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 0.6em 0.9em;
      background: none;
      border: none;
      color: #c5cae9;
      font-size: 0.8rem;
      font-family: inherit;
      cursor: pointer;
      transition: background 0.15s ease;
      white-space: nowrap;

      &:hover {
        background: rgba(79, 142, 247, 0.12);
      }

      & + .cite-option {
        border-top: 1px solid rgba(79, 142, 247, 0.1);
      }
    }

    .copied-flash {
      font-size: 0.7rem;
      font-weight: 600;
      color: #69f0ae;
      animation: fadeInOut 1.5s ease forwards;
    }

    :host ::ng-deep mark {
      background: #ffd54f;
      color: #1a1d2e;
      border-radius: 2px;
      padding: 0 2px;
    }
  `]
})
export class PaperCardComponent {
  private readingListService = inject(ReadingListService);
  private sanitizer = inject(DomSanitizer);

  paper = input.required<Paper>();
  highlightTerms = input<string[]>([]);

  showFullAbstract = signal(false);
  showCiteMenu = signal(false);
  showSavedFlash = signal(false);
  showCopiedFlash = signal(false);

  saved = computed(() => this.readingListService.isSaved(this.paper().id));

  authorsDisplay = computed(() => {
    const authors = this.paper().authors ?? [];
    const maxShow = 3;
    return {
      primary: authors.slice(0, maxShow).map(a => a.name),
      remaining: Math.max(0, authors.length - maxShow)
    };
  });

  publisherDisplay = computed(() => {
    const p = this.paper();
    if (p.publisher) return p.publisher;
    if (p.journals && p.journals.length > 0) return p.journals[0].title;
    return null;
  });

  truncatedAbstract = computed(() => {
    const abstract = this.paper().abstract ?? '';
    return abstract.length > 200 ? abstract.slice(0, 200) : abstract;
  });

  highlightedTitle = computed((): SafeHtml => {
    return this.sanitizer.bypassSecurityTrustHtml(
      this.highlight(this.paper().title ?? '')
    );
  });

  highlightedAbstract = computed((): SafeHtml => {
    const abstract = this.showFullAbstract()
      ? (this.paper().abstract ?? '')
      : this.truncatedAbstract();
    return this.sanitizer.bypassSecurityTrustHtml(this.highlight(abstract));
  });

  highlight(text: string): string {
    const terms = this.highlightTerms();
    if (!terms || terms.length === 0) return text;
    const escaped = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const pattern = new RegExp(`(${escaped.join('|')})`, 'gi');
    return text.replace(pattern, '<mark>$1</mark>');
  }

  toggleAbstract(): void {
    this.showFullAbstract.update(v => !v);
  }

  toggleBookmark(): void {
    const p = this.paper();
    if (this.readingListService.isSaved(p.id)) {
      this.readingListService.remove(p.id);
    } else {
      this.readingListService.add(p);
      this.showSavedFlash.set(true);
      setTimeout(() => this.showSavedFlash.set(false), 1600);
    }
  }

  toggleCiteMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.showCiteMenu.update(v => !v);
  }

  copyApa(): void {
    const p = this.paper();
    const authors = (p.authors ?? []).map(a => a.name).join(', ') || 'Unknown Authors';
    const year = p.yearPublished ?? 'n.d.';
    const title = p.title ?? '';
    const publisher = p.publisher ?? '';
    const doi = p.doi ? `https://doi.org/${p.doi}` : '';
    const parts = [authors, `(${year})`, title ? `${title}.` : '', publisher ? `${publisher}.` : '', doi].filter(Boolean);
    const citation = parts.join(' ');
    this.copyToClipboard(citation);
  }

  copyBibtex(): void {
    const p = this.paper();
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
    const bibtex = lines.join('\n');
    this.copyToClipboard(bibtex);
  }

  private copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.showCopiedFlash.set(true);
      setTimeout(() => {
        this.showCopiedFlash.set(false);
        this.showCiteMenu.set(false);
      }, 1600);
    }).catch(() => {
      this.showCiteMenu.set(false);
    });
  }
}
