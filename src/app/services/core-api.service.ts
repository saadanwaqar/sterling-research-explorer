import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { SearchResponse } from '../models/paper.model';

@Injectable({
  providedIn: 'root'
})
export class CoreApiService {
  private http = inject(HttpClient);

  searchPapers(query: string, limit: number): Observable<SearchResponse> {
    const apiKeyParam = environment.coreApiKey ? `&apiKey=${environment.coreApiKey}` : '';
    const url = `${environment.coreApiUrl}/search/works/?q=${encodeURIComponent(query)}&limit=${limit}${apiKeyParam}`;
    return this.http.get<SearchResponse>(url).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('CORE API error:', error);
        return throwError(() => this.toUserMessage(error));
      })
    );
  }

  private toUserMessage(error: HttpErrorResponse): string {
    if (error.status === 429) {
      return 'Rate limit exceeded. Add a free API key in environment.ts for higher limits (core.ac.uk/services/api), or wait a minute and try again.';
    }
    if (error.status === 401 || error.status === 403) {
      return 'API key invalid or unauthorised. Check your key in environment.ts.';
    }
    if (error.status === 0) {
      return 'Network error — unable to reach the CORE API. Check your internet connection.';
    }
    return `API error (${error.status}): ${error.message}`;
  }
}
