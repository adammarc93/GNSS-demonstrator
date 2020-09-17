/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { KnowledgeTestComponent } from './knowledge-test.component';

describe('KnowledgeTestComponent', () => {
  let component: KnowledgeTestComponent;
  let fixture: ComponentFixture<KnowledgeTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KnowledgeTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KnowledgeTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
