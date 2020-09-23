import { Photo } from './Photo';
import { Result } from './Result';

export interface User {
  id: number;
  userName: string;
  gender: string;
  age: number;
  dateOfBirth: Date;
  description: string;
  created: Date;
  lastActive: Date;
  bestResult: number;
  averageResult: number;
  results: Result[];
  photo: Photo;
  photoUrl: string;
}
