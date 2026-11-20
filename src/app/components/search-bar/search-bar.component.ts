import {
  Component,
  EventEmitter,
  input,
  Output,
  ChangeDetectionStrategy
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface SearchEvent {
  query: string;
  limit: number;
}

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="search-bar-container">
      <div class="search-header">
        <h2 class="search-title">Discover Research</h2>
        <p class="search-subtitle">Search millions of open access papers from the CORE database</p>
      </div>
      <div class="search-form">
        <div class="query-field">
          <label class="field-label" for="query-input">Research Query</label>
          <div class="input-wrapper">
            <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              id="query-input"
              type="text"
              class="query-input"
              [(ngModel)]="query"
              placeholder="e.g. drone AND (package OR delivery)"
              (keydown.enter)="onSubmit()"
            />
          </div>
          <span class="helper-text">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            Boolean syntax: use <code>AND</code>, <code>OR</code>, <code>NOT</code> operators and parentheses for grouping
          </span>
        </div>
        <div class="controls-row">
          <div class="limit-field">
            <label class="field-label" for="limit-input">Results Limit</label>
            <input
              id="limit-input"
              type="number"
              class="limit-input"
              [(ngModel)]="limit"
              [min]="1"
              [max]="100"
            />
          </div>
          <button
            class="search-btn"
            [disabled]="loading() || !query.trim()"
            (click)="onSubmit()"
          >
            @if (loading()) {
              <span class="btn-spinner"></span>
              Searching...
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              Search Papers
            }
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-bar-container {
      background: linear-gradient(135deg, rgba(26, 29, 46, 0.9) 0%, rgba(15, 17, 23, 0.95) 100%);
      border: 1px solid rgba(79, 142, 247, 0.2);
      border-radius: 16px;
      padding: 2rem;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05);
    }

    .search-header {
      margin-bottom: 1.5rem;
    }

    .search-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #e8eaf6;
      margin: 0 0 0.25rem 0;
      letter-spacing: -0.02em;
    }

    .search-subtitle {
      font-size: 0.875rem;
      color: #9fa8da;
      margin: 0;
    }

    .search-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .query-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .field-label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: #9fa8da;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .input-wrapper {
      position: relative;
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      width: 18px;
      height: 18px;
      color: #9fa8da;
      pointer-events: none;
    }

    .query-input {
      width: 100%;
      background: rgba(15, 17, 23, 0.6);
      border: 1px solid rgba(79, 142, 247, 0.2);
      border-radius: 10px;
      padding: 0.875rem 1rem 0.875rem 2.75rem;
      font-size: 0.9375rem;
      color: #e8eaf6;
      font-family: 'Inter', sans-serif;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
      box-sizing: border-box;

      &::placeholder {
        color: rgba(159, 168, 218, 0.4);
      }

      &:focus {
        outline: none;
        border-color: #4f8ef7;
        box-shadow: 0 0 0 3px rgba(79, 142, 247, 0.15);
      }
    }

    .helper-text {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.75rem;
      color: rgba(159, 168, 218, 0.6);

      svg {
        flex-shrink: 0;
      }

      code {
        background: rgba(79, 142, 247, 0.1);
        color: #4f8ef7;
        padding: 0.1em 0.4em;
        border-radius: 4px;
        font-size: 0.7rem;
        font-family: 'Courier New', monospace;
      }
    }

    .controls-row {
      display: flex;
      align-items: flex-end;
      gap: 1rem;
    }

    .limit-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .limit-input {
      background: rgba(15, 17, 23, 0.6);
      border: 1px solid rgba(79, 142, 247, 0.2);
      border-radius: 10px;
      padding: 0.875rem 1rem;
      font-size: 0.9375rem;
      color: #e8eaf6;
      width: 100px;
      font-family: 'Inter', sans-serif;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;

      &:focus {
        outline: none;
        border-color: #4f8ef7;
        box-shadow: 0 0 0 3px rgba(79, 142, 247, 0.15);
      }
    }

    .search-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #4f8ef7 0%, #6c63ff 100%);
      border: none;
      border-radius: 10px;
      padding: 0.875rem 1.5rem;
      font-size: 0.9375rem;
      font-weight: 600;
      color: #fff;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      transition: opacity 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
      box-shadow: 0 4px 15px rgba(79, 142, 247, 0.3);

      &:hover:not(:disabled) {
        opacity: 0.9;
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(79, 142, 247, 0.4);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .btn-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      flex-shrink: 0;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 600px) {
      .search-bar-container {
        padding: 1.25rem;
      }

      .controls-row {
        flex-direction: column;
        align-items: stretch;
      }

      .limit-input {
        width: 100%;
      }
    }
  `]
})
export class SearchBarComponent {
  loading = input<boolean>(false);

  @Output() search = new EventEmitter<SearchEvent>();

  query = '';
  limit = 10;

  onSubmit(): void {
    if (!this.query.trim() || this.loading()) return;
    this.search.emit({ query: this.query.trim(), limit: this.limit });
  }
}
