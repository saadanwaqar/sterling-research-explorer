import { Injectable, signal, computed } from '@angular/core';
import { Paper } from '../models/paper.model';

const STORAGE_KEY = 'sre_reading_list';

@Injectable({ providedIn: 'root' })
export class ReadingListService {
  private papers = signal<Paper[]>(this.loadFromStorage());

  count = computed(() => this.papers().length);

  getAll(): Paper[] {
    return this.papers();
  }

  add(paper: Paper): void {
    if (!this.isSaved(paper.id)) {
      this.papers.update(list => [...list, paper]);
      this.persist();
    }
  }

  remove(id: string): void {
    this.papers.update(list => list.filter(p => p.id !== id));
    this.persist();
  }

  isSaved(id: string): boolean {
    return this.papers().some(p => p.id === id);
  }

  clear(): void {
    this.papers.set([]);
    this.persist();
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.papers()));
    } catch {
      // ignore storage errors
    }
  }

  private loadFromStorage(): Paper[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Paper[]) : [];
    } catch {
      return [];
    }
  }
}
