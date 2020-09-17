import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../_services/auth.service';
import { AlertifyService } from '../_services/alertify.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  model: any = {};

  constructor(
    public authService: AuthService,
    private alertify: AlertifyService,
    private router: Router
  ) {}

  ngOnInit() {}

  login() {
    console.log(this.model);

    this.authService.login(this.model).subscribe(
      next => {
        this.alertify.success('Zalogowałeś się do aplikacji');
      },
      error => {
        this.alertify.error('Wystąpił błąd logowania');
      },
      () => {
        this.router.navigate(['/game']);
      }
    );
  }

  loggedIn() {
    return this.authService.loggedIn();
  }

  logout() {
    localStorage.removeItem('token');
    this.alertify.message('Zostałeś wylogowany');
    this.router.navigate(['/home']);
  }
}
