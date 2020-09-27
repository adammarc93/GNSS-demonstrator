import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import { KnowledgeTest } from '../_models/knowledgeTest';
import { Question } from '../_models/question';
import { AlertifyService } from '../_services/alertify.service';
import { AuthService } from '../_services/auth.service';
import { KnowledgeTestService } from '../_services/knowledge-test.service';

@Component({
  selector: 'app-knowledge-test',
  templateUrl: './knowledge-test.component.html',
  styleUrls: ['./knowledge-test.component.css']
})
export class KnowledgeTestComponent implements OnInit {
  knowledgeTest: KnowledgeTest;
  @ViewChild('knowledgeTest') knowledgeTestForm: NgForm;

  constructor(
    private authService: AuthService,
    private knowledgeTestService: KnowledgeTestService,
    private alertify: AlertifyService
  ) {}

  ngOnInit() {
    this.knowledgeTest = new KnowledgeTest();
    this.knowledgeTest.questions = [];
    this.loadQuestions();
  }

  setKnowledgeTest() {
    this.knowledgeTestService
      .setKnowledgeTest(
        this.authService.decodedToken.nameid,
        this.knowledgeTest
      )
      .subscribe(
        next => {
          this.alertify.success('Test wysłany');
        },
        error => {
          this.alertify.error(error);
        }
      );
  }

  loadQuestions() {
    const questionsData: string[] = [
      'Pyatnie 1',
      'Pyatnie 2',
      'Pyatnie 3',
      'Pyatnie 4',
      'Pyatnie 5',
      'Pyatnie 6',
      'Pyatnie 7',
      'Pyatnie 8',
      'Pyatnie 9',
      'Pyatnie 10'
    ];

    for (let i = 0; i < questionsData.length; i++) {
      const question: Question = {
        value: questionsData[i],
        answer: null
      };
      this.knowledgeTest.questions.push(question);
    }
  }
}
