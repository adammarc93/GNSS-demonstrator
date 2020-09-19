import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { User } from '../_models/user';
import { UserService } from '../_services/user.service';
import { AlertifyService } from '../_services/alertify.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../_services/auth.service';

@Injectable()
export class UserEditResolver implements Resolve<User> {
  constructor(
    private userService: UserService,
    private router: Router,
    private alertify: AlertifyService,
    private authService: AuthService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<User> {
    return this.userService.getUser(this.authService.decodedToken.nameid).pipe(
      catchError(() => {
        this.alertify.error('Problem z pobraniem danych');
        this.router.navigate(['']);
        return of(null);
      })
    );
  }
}
