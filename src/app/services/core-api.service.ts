import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { SearchResponse } from '../models/paper.model';

@Injectable({
  providedIn: 'root'
})
export class CoreApiService {
  private http = inject(HttpClient);

  searchPapers(query: string, limit: number): Observable<SearchResponse> {
    const url = `${environment.coreApiUrl}/search/works?q=${encodeURIComponent(query)}&limit=${limit}&apiKey=${environment.coreApiKey}`;
    return this.http.get<SearchResponse>(url).pipe(
      catchError((error) => {
        console.error('CORE API error:', error);
        return of({ totalHits: 0, limit, offset: 0, results: [] });
      })
    );
  }
}
