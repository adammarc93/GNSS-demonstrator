import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';

import { User } from '../_models/user';
import { AlertifyService } from '../_services/alertify.service';
import { UserService } from '../_services/user.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class UserListResolver implements Resolve<User[]> {
  constructor(
    private userService: UserService,
    private router: Router,
    private alertify: AlertifyService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<User[]> {
    return this.userService.getUsers().pipe(
      catchError(() => {
        this.alertify.error('Problem z pobraniem danych');
        this.router.navigate(['']);
        return of(null);
      })
    );
  }
}
