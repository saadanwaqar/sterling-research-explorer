export interface Author {
  name: string;
}

export interface Paper {
  id: string;
  title: string;
  abstract?: string;
  authors?: Author[];
  yearPublished?: number;
  publishedDate?: string;
  publisher?: string;
  downloadUrl?: string;
  doi?: string;
  languages?: Array<{ code: string; name?: string }>;
  journals?: Array<{ title: string }>;
  citationCount?: number;
}

export interface SearchResponse {
  totalHits: number;
  limit: number;
  offset: number;
  results: Paper[];
}
