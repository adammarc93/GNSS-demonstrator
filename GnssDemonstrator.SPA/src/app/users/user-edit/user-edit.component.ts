import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FileUploader } from 'ng2-file-upload';

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
  hasBaseDropZoneOver: boolean;
  baseUrl = environment.apiUrl;
  fileUploaded: boolean;
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
    this.initializUploader();
    this.authService.currentPhotoUrl.subscribe(
      photoUrl => (this.photoUrl = photoUrl)
    );
    this.authService.currentUser.photoUrl = this.photoUrl;
    localStorage.setItem('user', JSON.stringify(this.authService.currentUser));
  }

  updateUser() {
    this.userService
      .updateUser(this.authService.decodedToken.nameid, this.user)
      .subscribe(
        next => {
          this.editForm.reset(this.user);
        },
        error => {
          this.alertify.error(error);
        }
      );

    this.uploader.uploadAll();

    // wait for cloudinary - to fix
    setTimeout(() => {
      this.getUpdatedPhoto();
    }, 5000);
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
        this.authService.changeUserPhoto(user.photo.url);
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
      this.fileUploaded = true;
    }
    else{
      this.fileUploaded = false;
    }
  }
}
