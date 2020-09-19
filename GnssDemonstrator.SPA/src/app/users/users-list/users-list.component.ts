import { Component, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { User } from 'src/app/_models/user';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { UserService } from 'src/app/_services/user.service';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {
  users: User[];
  @Output() place: number;

  constructor(
    private userService: UserService,
    private alertify: AlertifyService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // this.loadUsers();
    this.route.data.subscribe(data => {
      this.users = data.users;
    });
  }

  // loadUsers() {
  //   this.userService.getUsers().subscribe((users: User[]) => {
  //     this.users = users;
  //   }, error => {
  //     this.alertify.error(error);
  //   });
  // }
}
