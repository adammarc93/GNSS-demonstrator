import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

import { Result } from '../_models/Result';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  baseUrl = environment.apiUrl + 'users/';

  constructor(private http: HttpClient) {}

  setResult(id: number, result: Result) {
    return this.http.post(this.baseUrl + id + '/results', result);
  }
}
