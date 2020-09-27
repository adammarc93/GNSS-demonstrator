/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { KnowledgeTestService } from './knowledge-test.service';

describe('Service: KnowledgeTest', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KnowledgeTestService]
    });
  });

  it('should ...', inject([KnowledgeTestService], (service: KnowledgeTestService) => {
    expect(service).toBeTruthy();
  }));
});
