import {
  Component,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  User
} from './../../models/user.model';
import {
  Playlist
} from './../../models/playlist.model';
import {
  UserService
} from './../../services/user.service';
import {
  PlaylistService
} from './../../services/playlist.service';
import {
  ClubService
} from './../../services/club.service';

import { IMultiSelectOption, IMultiSelectSettings, IMultiSelectTexts } from 'angular-2-dropdown-multiselect';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.css']
})
export class PlaylistComponent implements OnInit {
  playdata: any = [];
  successmsg: any;
  isCoachOrAnalyst: Boolean = false;
  errormsg: string;
  clubActive: any;
  playList: Playlist[];
  trackPlaylist: any = [];
  loadingIndicator: boolean = true;
  playlistOptions: IMultiSelectOption[];
  playlistModel: any[];
  allClubList: any;

  playlistSettings: IMultiSelectSettings = {
    enableSearch: false,
    checkedStyle: 'fontawesome',
    containerClasses: 'no-button-arrow',
    buttonClasses: 'btn btn-default btn-block',
    selectionLimit: 1,
    autoUnselect: true,
    closeOnSelect: true,
    // fixedTitle: true
  };
  playlistTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'Playlist selected',
    checkedPlural: 'Playlist selected',
    searchPlaceholder: 'Find',
    defaultTitle: ' Select Playlist ',
    allSelected: 'All Playlist ',
  };
  @ViewChild('SucessModal') SucessModal;
  @ViewChild('ErrorModal') ErrorModal;
  constructor(router: Router, private userService: UserService, private playlistService: PlaylistService, private clubService: ClubService) { }

  ngOnInit() {
    var user = this.userService.loadUserFromStorage();
    if (user['role'] != 3 && user['role'] != 4) {
      this.isCoachOrAnalyst = false;
    } else {
      this.isCoachOrAnalyst = true;
    }
    this.ClubStatus();
    this.getAllClubs();
  }

  getAllClubs() {
    this.clubService.getAllClubs(this.userService.token).subscribe(
      (response) => this.onGetAllClubsSuccess(response),
      (error) => this.onError(error)
    );
  }

  onGetAllClubsSuccess(response) {
    this.allClubList = JSON.parse(response._body);
    this.getPlaylist();

  }

  getPlaylist() {
    this.playlistService.getPlaylists(this.userService.token).subscribe(
      (response) => this.onGetPlaylistSuccess(response),
      (error) => this.onError(error)
    );
  }
  ClubStatus() {
    this.clubService.checkClubActive(this.userService.token).subscribe(
      (response) => this.onClubStatusSuccess(response),
      (error) => this.onError(error)
    );
  }
  onClubStatusSuccess(response) {
    const clubResp = JSON.parse(response._body);
    if (clubResp) {
      this.clubActive = clubResp.activated;
      if (!this.clubActive) {
        this.errormsg = "Club is deactivated by Admin.";
        this.ErrorModal.open();
      }
    }
  }
  onGetPlaylistSuccess(response) {
    this.playList = JSON.parse(response._body);
    this.playList = this.playList['playlists'];
    this.playdata = this.playList['playdata'];

    this.playList.forEach(element => {

      var videoClubName = element['user'].club;
      var videoClub = this.allClubList.filter(function (element1, index) {
        return (element1._id === videoClubName);
      })[0];

      if (typeof (videoClub) != 'undefined') {
        element['user'].club = videoClub.name;
      } else {
        element['user'].club = '';
      }
    });

    this.playList.forEach((play, index) => {
      this.trackPlaylist.push({
        'id': play._id,
        'name': play.name
      });

    });
    this.playlistOptions = this.trackPlaylist;

    this.loadingIndicator = false;
  }
  onError(error) {
    const errorBody = JSON.parse(error._body);
    this.errormsg = errorBody.message;
    this.ErrorModal.open()

  }
  deletePlaylist(id) {
    if (confirm("Are you sure to delete this playlist ?")) {
      this.playlistService.deletePlaylist(this.userService.token, id).subscribe(
        (response) => this.onDeletePlaylistSuccess(response),
        (error) => this.onError(error)
      );
    }
  }
  onDeletePlaylistSuccess(response) {
    const deleteMsgBody = JSON.parse(response._body);
    this.successmsg = deleteMsgBody.message;
    this.SucessModal.open();
    this.getPlaylist();
  }

}
