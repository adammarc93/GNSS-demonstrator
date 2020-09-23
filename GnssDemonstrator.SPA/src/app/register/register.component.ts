import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder
} from '@angular/forms';

import { AuthService } from '../_services/auth.service';
import { AlertifyService } from '../_services/alertify.service';
import { User } from '../_models/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  @Output() cancelRegister = new EventEmitter();

  user: User;
  registerForm: FormGroup;

  constructor(
    private authService: AuthService,
    private alertify: AlertifyService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    this.createRegisterForm();
  }

  register() {
    this.user = Object.assign({}, this.registerForm.value);

    if (this.registerForm.valid) {
      this.authService.register(this.user).subscribe(
        () => {
          this.alertify.success('Rejestracja udana');
        },
        error => {
          this.alertify.error(error);
        },
        () => {
          this.authService
            .login(this.user)
            .subscribe(() => this.router.navigate(['/game']));
        }
      );
    }
  }

  cancel() {
    this.cancelRegister.emit(false);
  }

  passwordMatchValidator(fg: FormControl) {
    return fg.get('password').value === fg.get('confirmPassword').value
      ? null
      : { mismatch: true };
  }

  createRegisterForm() {
    this.registerForm = this.fb.group(
      {
        username: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required]
      },
      { validator: this.passwordMatchValidator }
    );
  }
}
