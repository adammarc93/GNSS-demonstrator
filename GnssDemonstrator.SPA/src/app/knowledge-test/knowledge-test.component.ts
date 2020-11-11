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
      'https://res.cloudinary.com/duvmum0tm/image/upload/c_scale,w_400/v1604622765/test_00_hcfprs.png',
      'https://res.cloudinary.com/duvmum0tm/image/upload/c_scale,w_400/v1604622765/test_01_xak457.png',
      'https://res.cloudinary.com/duvmum0tm/image/upload/c_scale,w_400/v1604622765/test_02_rptd27.png',
      'https://res.cloudinary.com/duvmum0tm/image/upload/c_scale,w_400/v1604622764/test_03_upqmu2.png',
      'https://res.cloudinary.com/duvmum0tm/image/upload/c_scale,w_400/v1604622764/test_04_mjmphr.png',
      'https://res.cloudinary.com/duvmum0tm/image/upload/c_scale,w_400/v1604622764/test_05_lwxgc4.png',
      'https://res.cloudinary.com/duvmum0tm/image/upload/c_scale,w_400/v1604622764/test_06_jjghnc.png',
      'https://res.cloudinary.com/duvmum0tm/image/upload/c_scale,w_400/v1604622764/test_07_eduegz.png',
      'https://res.cloudinary.com/duvmum0tm/image/upload/c_scale,w_400/v1604622764/test_08_dhjrwx.png',
      'https://res.cloudinary.com/duvmum0tm/image/upload/c_scale,w_400/v1604622764/test_09_ra8ymj.png'
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
