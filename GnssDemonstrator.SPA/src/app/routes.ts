import { Routes } from '@angular/router';

import { AuthGuard } from './_guards/auth.guard';
import { UserDetailResolver } from './_resolver/user-detail.resolver';
import { UserListResolver } from './_resolver/user-list.resolver';
import { GameComponent } from './game/game.component';
import { HomeComponent } from './home/home.component';
import { KnowledgeTestComponent } from './knowledge-test/knowledge-test.component';
import { UsersListComponent } from './users/users-list/users-list.component';
import { UserDetailComponent } from './users/user-detail/user-detail.component';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [AuthGuard],
    children: [
      { path: 'game', component: GameComponent },
      {
        path: 'ranking',
        component: UsersListComponent,
        resolve: { users: UserListResolver }
      },
      {
        path: 'ranking/:id',
        component: UserDetailComponent,
        resolve: { user: UserDetailResolver }
      },
      {
        path: 'knowledgeTest',
        component: KnowledgeTestComponent
      }
    ]
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
