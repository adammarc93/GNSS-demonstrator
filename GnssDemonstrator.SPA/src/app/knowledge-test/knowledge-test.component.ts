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
      'https://res.cloudinary.com/duvmum0tm/image/upload/v1603722722/test00_x6mchl.png',
      'https://res.cloudinary.com/duvmum0tm/image/upload/v1603722722/test01_jc7tge.png',
      'https://res.cloudinary.com/duvmum0tm/image/upload/v1603722722/test02_ilvtpx.png',
      'https://res.cloudinary.com/duvmum0tm/image/upload/v1603722722/test03_ktlfsv.png',
      'https://res.cloudinary.com/duvmum0tm/image/upload/v1603722722/test04_migetr.png',
      'https://res.cloudinary.com/duvmum0tm/image/upload/v1603722722/test05_vei2kn.png',
      'https://res.cloudinary.com/duvmum0tm/image/upload/v1603722723/test06_itzz4a.png',
      'https://res.cloudinary.com/duvmum0tm/image/upload/v1603722723/test07_bf77ph.png',
      'https://res.cloudinary.com/duvmum0tm/image/upload/v1603722723/test08_qixt0q.png',
      'https://res.cloudinary.com/duvmum0tm/image/upload/v1603722723/test09_bhewx4.png'
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
