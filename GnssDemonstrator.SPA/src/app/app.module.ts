import { JwtModule } from '@auth0/angular-jwt';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';

import { FileUploadModule } from 'ng2-file-upload';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { AuthGuard } from './_guards/auth.guard';
import { PreventUnsavedChanges } from './_guards/prevent-unsaved-changes.guard';
import { TimeAgoPipe } from './_pipes/time-age-pipe';
import { UserDetailResolver } from './_resolver/user-detail.resolver';
import { UserEditResolver } from './_resolver/user-edit.resolver';
import { UserListResolver } from './_resolver/user-list.resolver';
import { AlertifyService } from './_services/alertify.service';
import { AuthService } from './_services/auth.service';
import { ErrorInterceptorProvider } from './_services/error.interceptor';
import { GameService } from './_services/game.service';
import { KnowledgeTestService } from './_services/knowledge-test.service';
import { UserService } from './_services/user.service';
import { AppComponent } from './app.component';
import { GameComponent } from './game/game.component';
import { HomeComponent } from './home/home.component';
import { KnowledgeTestComponent } from './knowledge-test/knowledge-test.component';
import { NavComponent } from './nav/nav.component';
import { RegisterComponent } from './register/register.component';
import { appRoutes } from './routes';
import { UserCardComponent } from './users/user-card/user-card.component';
import { UserDetailComponent } from './users/user-detail/user-detail.component';
import { UserEditComponent } from './users/user-edit/user-edit.component';
import { UsersListComponent } from './users/users-list/users-list.component';
import { UserResultsComponent } from './users/user-results/user-results.component';

export function tokenGetter() {
  return localStorage.getItem('token');
}

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    HomeComponent,
    RegisterComponent,
    UsersListComponent,
    GameComponent,
    KnowledgeTestComponent,
    UserCardComponent,
    UserDetailComponent,
    UserEditComponent,
    UserResultsComponent,
    TimeAgoPipe
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    JwtModule.forRoot({
      config: {
        tokenGetter,
        allowedDomains: ['localhost:5000'],
        disallowedRoutes: ['localhost:5000/api/auth']
      }
    }),
    RouterModule.forRoot(appRoutes),
    BsDropdownModule.forRoot(),
    BsDatepickerModule.forRoot(),
    BrowserAnimationsModule,
    FileUploadModule,
    ReactiveFormsModule
  ],
  providers: [
    AuthService,
    AlertifyService,
    UserService,
    AuthGuard,
    ErrorInterceptorProvider,
    UserDetailResolver,
    UserListResolver,
    UserEditResolver,
    PreventUnsavedChanges,
    KnowledgeTestService,
    GameService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
