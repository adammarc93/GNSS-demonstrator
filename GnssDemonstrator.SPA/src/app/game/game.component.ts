import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Result } from '../_models/Result';
import { AlertifyService } from '../_services/alertify.service';
import { AuthService } from '../_services/auth.service';
import { GameService } from '../_services/game.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  result: Result;

  @ViewChild('game') gameForm: NgForm;

  constructor(
    private authService: AuthService,
    private gameService: GameService,
    private alertify: AlertifyService
  ) {}

  ngOnInit() {
    this.result = new Result();
  }

  setResult() {
    this.gameService
      .setResult(this.authService.decodedToken.nameid, this.result)
      .subscribe(
        next => {
          this.alertify.success('Wynik wysłany');
        },
        error => {
          this.alertify.error(error);
        }
      );
  }
}
