import { Component, OnInit, ViewChild } from '@angular/core';
import {
  UserService
} from './../../../services/user.service';
import {
  User
} from './../../../models/user.model';
import {
  Router
} from '@angular/router';
import {
  ClubService
} from './../../../services/club.service';

import { FormControl } from "@angular/forms";
@Component({
  selector: 'app-profile-main',
  templateUrl: './profile-main.component.html',
  styleUrls: ['./profile-main.component.css']
})
export class ProfileMainComponent implements OnInit {
  clubName: any;
  uPhone: any;
  fName: string;
  lName: string;
  uemail: string;
  cFunction: string;
  private router: Router;
  public user: User = new User();
  public cpass: User = new User();
  successmsg: string;
  errormsg: string;
  public userList: User;
  loadingIndicator: boolean = true;
  public roles = [
    { value: 2, display: 'Club Admin' },
    { value: 3, display: 'Analyst' },
    { value: 4, display: 'Coach' },
    { value: 5, display: 'Player' },
    { value: 6, display: 'Viewer' }
  ];
  showProgressBar: boolean = false;

  @ViewChild('updateSucessModal') updateSucessModal;
  @ViewChild('updateErrorModal') updateErrorModal;
  @ViewChild('form') form;
  constructor(private userService: UserService, r: Router) { }



  ngOnInit() {
    this.showProgressBar = true;
    this.fetchUsers();
  }

  fetchUsers() {
    this.userService.fetchUsers(this.userService.token).subscribe(
      (response) => this.onFetchUserSuccess(response),
      (error) => this.onError(error)
    );
  }

  onFetchUserSuccess(response) {
    this.showProgressBar = false;
    this.user = JSON.parse(response._body);
    console.log(this.userList);
    this.loadingIndicator = false;
    this.clubName = this.user.club['name'];
    this.cpass._id = this.user._id;
    // this.fName = this.userList['firstName'];
    // this.lName = this.userList['lastName'];
    // this.uemail = this.userList['email'];
    // this.uPhone = this.userList['phone'];
    // this.cFunction = this.userList['clubFunction'];



  }

  onError(error) {
    this.showProgressBar = false;
    const errorBody = JSON.parse(error._body);
    this.errormsg = errorBody.message;
    this.updateErrorModal.open();
  }
  onSubmit(f) {
    if (!f.valid) {
      return false;
    }
    this.showProgressBar = true;

    this.userService.updateProfile(this.user)
      .subscribe(
      (response) => this.onupdateProfileSuccess(response),
      (error) => this.onError(error)
      );
  }
  changePassword(p) {

    if (!p.valid) {
      return false;
    }
    this.showProgressBar = true;

    this.userService.changePassword(this.cpass)
      .subscribe(
      (response) => this.onupdateProfileSuccess(response),
      (error) => this.onError(error)
      );
  }
  onupdateProfileSuccess(response) {
    this.showProgressBar = false;
    this.form.nativeElement.reset();
    const responseBody = JSON.parse(response._body);
    console.log(responseBody);
    // alert(responseBody.msg);
    this.successmsg = responseBody.message;
    this.updateSucessModal.open();


    // this.router.navigateByUrl('/auth/login');
  }

}
