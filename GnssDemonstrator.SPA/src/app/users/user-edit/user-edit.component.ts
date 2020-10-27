import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FileUploader } from 'ng2-file-upload';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

import { AlertifyService } from 'src/app/_services/alertify.service';
import { AuthService } from 'src/app/_services/auth.service';
import { UserService } from 'src/app/_services/user.service';
import { User } from 'src/app/_models/user';
import { Photo } from 'src/app/_models/Photo';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css']
})
export class UserEditComponent implements OnInit {
  user: User;
  photoUrl: string;
  uploader: FileUploader;
  baseUrl = environment.apiUrl;
  bsConfig: Partial<BsDatepickerConfig>;
  @ViewChild('editForm') editForm: NgForm;
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.editForm.dirty) {
      $event.returnValue = true;
    }
  }

  constructor(
    private route: ActivatedRoute,
    private alertify: AlertifyService,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.user = data.user;
    });
    this.bsConfig = Object.assign(
      {},
      { dateInputFormat: 'YYYY-MM-DD', containerClass: 'theme-dark-blue' }
    );
    this.initializUploader();
    this.authService.currentPhotoUrl.subscribe(
      photoUrl => (this.photoUrl = photoUrl)
    );
    this.authService.currentUser.photoUrl = this.photoUrl;
    localStorage.setItem('user', JSON.stringify(this.authService.currentUser));
  }

  updateUser() {
    const userDate = new Date(this.user.dateOfBirth);
    const date = new Date(userDate.getFullYear(), userDate.getMonth(), userDate.getDay());

    this.user.dateOfBirth = date;
    this.userService
      .updateUser(this.authService.decodedToken.nameid, this.user)
      .subscribe(
        next => {
          this.alertify.success('Profil zaktualizowany');
          this.editForm.reset(this.user);
        },
        error => {
          this.alertify.error(error);
        }
      );
  }

  initializUploader() {
    this.uploader = new FileUploader({
      url:
        this.baseUrl +
        'users/' +
        this.authService.decodedToken.nameid +
        '/photo',
      authToken: 'Bearer ' + localStorage.getItem('token'),
      isHTML5: true,
      allowedFileType: ['image'],
      removeAfterUpload: true,
      autoUpload: false,
      maxFileSize: 10 * 1024 * 1024,
      queueLimit: 1
    });

    this.uploader.onAfterAddingFile = file => {
      file.withCredentials = false;
    };

    this.uploader.onSuccessItem = (item, respons, status, headres) => {
      if (respons) {
        const res: Photo = JSON.parse(respons);
        const photo = {
          id: res.id,
          url: res.url,
          dateAdded: res.dateAdded
        };
      }
    };
  }

  getUpdatedPhoto() {
    this.userService.getUser(this.user.id).subscribe(
      (user: User) => {
        this.photoUrl = user.photo.url;
        this.authService.changeUserPhoto(this.photoUrl);
        this.authService.currentUser.photoUrl = this.photoUrl;
        localStorage.setItem(
          'user',
          JSON.stringify(this.authService.currentUser)
        );
        this.alertify.success('Profil zaktualizowany');
      },
      error => {
        console.log(error);
      }
    );
  }

  onFileChanged(event) {
    if (event.target.files[0] != null) {
      this.photoUrl = null;
      this.authService.changeUserPhoto(this.photoUrl);
      this.authService.currentUser.photoUrl = this.photoUrl;
      localStorage.setItem(
        'user',
        JSON.stringify(this.authService.currentUser)
      );
      this.uploader.uploadAll();
      this.alertify.message('Ładowanie zjęcia');
      // wait for cloudinary - to fix
      setTimeout(() => {
        this.getUpdatedPhoto();
      }, 15000);
    }
  }

  deletePhoto(id: number) {
    this.alertify.confirm('Usunąć zdjęcie?', () => {
      this.userService
        .deletePhoto(this.authService.decodedToken.nameid)
        .subscribe(
          () => {
            this.photoUrl = null;
            this.authService.changeUserPhoto(this.photoUrl);
            this.authService.currentUser.photoUrl = this.photoUrl;
            localStorage.setItem(
              'user',
              JSON.stringify(this.authService.currentUser)
            );
            this.alertify.success('Zdjęcie zostało usunięte');
          },
          error => {
            this.alertify.error('Nie udało się usunąć zdjęcia');
          }
        );
    });
  }
}
