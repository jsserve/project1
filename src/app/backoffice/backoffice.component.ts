import { Component, OnInit } from '@angular/core';
import {
  LocalStorageService
} from 'angular-2-local-storage';
import {
  Router, ActivatedRoute
} from '@angular/router';

@Component({
  selector: 'app-backoffice',
  templateUrl: './backoffice.component.html',
  styleUrls: ['./backoffice.component.css']
})
export class BackofficeComponent implements OnInit {
  isAnalyst: boolean;
  isClubAdmin: boolean;
  isAdmin: boolean;


  private _opened = true;
  private router: Router;
  private _toggleSidebar() {
    this._opened = !this._opened;
  }

  constructor(private localStorageService: LocalStorageService, r: Router) { this.router = r; }

  ngOnInit() {
    let user: any = this.localStorageService.get('user');
    if (user['role'] == 1) {
      this.isAdmin = true;
    }
    else if (user['role'] == 2) {
      this.isClubAdmin = true;
    }
    else if (user['role'] == 3 || user['role'] == 4) {
      this.isAnalyst = true;
    }
    else {
      this.isClubAdmin = false;
      this.isAdmin = false;
      this.isAnalyst = false;
    }
  }
  logout() {
    this.localStorageService.remove('token');
    this.localStorageService.remove('user');
    this.router.navigateByUrl('/auth/login');
  }

}
