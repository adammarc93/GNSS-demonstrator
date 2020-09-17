import { Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { GameComponent } from './game/game.component';
import { UsersListComponent } from './users/users-list/users-list.component';
import { KnowledgeTestComponent } from './knowledge-test/knowledge-test.component';

export const appRoutes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'game', component: GameComponent },
  { path: 'ranking', component: UsersListComponent },
  { path: 'knowledgeTest', component: KnowledgeTestComponent },
  { path: '**', redirectTo: 'home', pathMatch: 'full' }
];
