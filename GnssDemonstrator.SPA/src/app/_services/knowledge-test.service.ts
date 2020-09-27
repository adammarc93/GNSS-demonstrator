import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { KnowledgeTest } from '../_models/knowledgeTest';

@Injectable({
  providedIn: 'root'
})
export class KnowledgeTestService {
  baseUrl = environment.apiUrl + 'users/';

  constructor(private http: HttpClient) {}

  setKnowledgeTest(id: number, knowledgeTest: KnowledgeTest) {
    return this.http.post(this.baseUrl + id + '/tests', knowledgeTest);
  }
}
