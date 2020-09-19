import { Routes } from '@angular/router';

import { AuthGuard } from './_guards/auth.guard';
import { PreventUnsavedChanges } from './_guards/prevent-unsaved-changes.guard';
import { UserDetailResolver } from './_resolver/user-detail.resolver';
import { UserEditResolver } from './_resolver/user-edit.resolver';
import { UserListResolver } from './_resolver/user-list.resolver';
import { GameComponent } from './game/game.component';
import { HomeComponent } from './home/home.component';
import { KnowledgeTestComponent } from './knowledge-test/knowledge-test.component';
import { UsersListComponent } from './users/users-list/users-list.component';
import { UserEditComponent } from './users/user-edit/user-edit.component';
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
        path: 'users',
        component: UsersListComponent,
        resolve: { users: UserListResolver }
      },
      {
        path: 'users/:id',
        component: UserDetailComponent,
        resolve: { user: UserDetailResolver }
      },
      {
        path: 'user/edit',
        component: UserEditComponent,
        resolve: { user: UserEditResolver },
        canDeactivate: [PreventUnsavedChanges]
      },
      {
        path: 'knowledgeTest',
        component: KnowledgeTestComponent
      }
    ]
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
