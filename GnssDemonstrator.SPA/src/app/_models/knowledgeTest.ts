import { Question } from './question';

export interface KnowledgeTest {
  id: number;
  date: Date;
  questions: Question[];
}

export class KnowledgeTest {
  knowledgeTest: KnowledgeTest;
}