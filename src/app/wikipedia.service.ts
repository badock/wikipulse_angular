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
    //const url = `https://en.wikipedia.org/w/rest.php/v1/pageviews/per-article/en.wikipedia/all-access/user/${matchingKeywords}/daily/2016122700/2020122600`;
    const url = `https://api.spiral.jonathanpastor.fr/pages/views/${matchingKeywords}/2016122700/2020122600`;
    return this.http.get(url);
  }

  getSummary(matchingKeywords: string): Observable<any> {
    const url = `https://fr.wikipedia.org/api/rest_v1/page/summary/${matchingKeywords}`;
    return this.http.get(url);
  }

}
