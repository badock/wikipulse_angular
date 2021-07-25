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
    let dateObj = new Date();
    let yearStr = `${dateObj.getUTCFullYear()}`;
    let monthStr = (dateObj.getUTCMonth() + 1) < 10 ? `0${dateObj.getUTCMonth() + 1}`: `${dateObj.getUTCMonth() + 1}`
    let dayStr = dateObj.getUTCDate() < 10 ? `0${dateObj.getUTCDate()}`: `${dateObj.getUTCDate()}`
    let todayAsStr = `${yearStr}${monthStr}${dayStr}00`;  
    const url = `https://api.spiral.jonathanpastor.fr/pages/views/${matchingKeywords}/2016122700/${todayAsStr}`;
    return this.http.get(url);
  }

  getSummary(matchingKeywords: string): Observable<any> {
    const url = `https://fr.wikipedia.org/api/rest_v1/page/summary/${matchingKeywords}`;
    return this.http.get(url);
  }

}
