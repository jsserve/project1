import { Component, OnInit } from '@angular/core';
import {
  LocalStorageService
} from 'angular-2-local-storage';
import {
  Router, ActivatedRoute
} from '@angular/router';

@Component({
  selector: 'app-matches',
  templateUrl: './matches.component.html',
  styleUrls: ['./matches.component.css']
})
export class MatchesComponent implements OnInit {
  coach: Boolean;
  admin: Boolean;
  constructor(private localStorageService: LocalStorageService, private r: Router) {
    let user: any = this.localStorageService.get('user');
    this.admin = user['admin'];
    this.coach = user['coach'];
  }

  ngOnInit() {
    if (!this.admin) {
      this.r.navigateByUrl('/videos');
    }

  }

}
