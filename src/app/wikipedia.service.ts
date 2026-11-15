import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WikipediaService {

  constructor(private http: HttpClient) { }

  findMatchingArticles(keywords: string): Observable<any> {
    const url = `https://fr.wikipedia.org/w/api.php?action=opensearch&search=${keywords}&limit=10&namespace=0&profile=engine_autoselect&redirects=resolve&exchars=1000&origin=*&format=json`;
    return this.http.get(url);
  }

  getStatisticsKeywords(matchingKeywords: string): Observable<any> {
    // The Wikimedia REST API allows CORS, so the browser calls it directly (no proxy needed).
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const article = encodeURIComponent(matchingKeywords.replace(/ /g, '_'));
    const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/fr.wikipedia/all-access/user/${article}/daily/20161227/${today}`;
    // No custom header (e.g. Api-User-Agent): it would trigger a CORS preflight, which Wikimedia rejects (405).
    return this.http.get(url);
  }

  getSummary(matchingKeywords: string): Observable<any> {
    const url = `https://fr.wikipedia.org/api/rest_v1/page/summary/${matchingKeywords}`;
    return this.http.get(url);
  }

}
