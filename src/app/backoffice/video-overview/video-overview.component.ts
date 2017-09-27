import {
  Component,
  OnInit,
  ViewChild, 
  ElementRef
} from '@angular/core';
import {
  User
} from './../../models/user.model';
import {
  Video
} from './../../models/video.model';
import {
  UserService
} from './../../services/user.service';
import {
  VideoService
} from './../../services/video.service';
import {
  ClubService
} from './../../services/club.service';
import {
  Router, ActivatedRoute
} from '@angular/router';

import { IMultiSelectOption, IMultiSelectSettings, IMultiSelectTexts } from 'angular-2-dropdown-multiselect';
import { GlobalVariables } from "app/models/global.model";
import { PlatformLocation } from '@angular/common';

@Component({
  selector: 'app-users',
  templateUrl: './video-overview.component.html',
  styleUrls: ['./video-overview.css']
})
export class VideoOverviewComponent implements OnInit {
  successmsg: any;
  videoId: any;
  trackUserlist: any[];

  userlistOptions: IMultiSelectOption[];
  userlistModel: any[];
  userlistSettings: IMultiSelectSettings = {
    enableSearch: true,
    checkedStyle: 'fontawesome',
    containerClasses: 'no-button-arrow',
    buttonClasses: 'btn btn-default btn-block',
    fixedTitle: false,
    maxHeight: '200px',
    dynamicTitleMaxItems: 2,
    closeOnClickOutside: true
  };
  userlistTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'Video selected',
    checkedPlural: 'Video selected',
    searchPlaceholder: 'Find',
    searchEmptyResult: 'Nothing found',
    searchNoRenderText: 'Type in search box',
    defaultTitle: ' Select Users  ',
    allSelected: 'All Video ',
  };
  videoList: User[];
  loadingIndicator: boolean = true;
  reorderable: boolean = true;
  allClubList: any;
  showProgressBar: boolean = false;

  columns = [{
    prop: 'title'
  },
  {
    prop: 'type'
  },
  {
    prop: 'original_filename'
  },
  {
    prop: '_id'
  },
  {
    prop: 'user.club',
    name: 'Club'
  },
  {
    prop: 'path',
    name: 'File path'
  },
  {
    name: 'Action'
  }
  ];
  private router: Router;
  videoUrl: any;
  videoOriginalName: any;
  private baseAmazonVideoUrl = GlobalVariables.BASE_AMAZON_VIDEO_URL;

  @ViewChild('assignVideoModal') assignVideoModal;
  @ViewChild('videoSucessModal') videoSucessModal;
  @ViewChild('lnkDownloadLink') lnkDownloadLink: ElementRef;
  constructor(platformLocation: PlatformLocation, private videoService: VideoService, private userService: UserService, private clubService: ClubService, r: Router, private route: ActivatedRoute) {
    this.router = r;
  }

  ngOnInit() {
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
    this.getVideos();
  }

  getVideos() {
    this.videoService.getVideos(this.userService.token).subscribe(
      (response) => this.onGetVideosSuccess(response),
      (error) => this.onError(error)
    );
  }

  onGetVideosSuccess(response) {
    this.videoList = JSON.parse(response._body);
    // console.log(this.videoList);

    if (this.videoList.length > 0) {
      this.videoList.forEach(element => {
        // console.log(element);
        element['id'] = element._id;
        element['ofilename'] = element['original_filename'];

        var videoClubName = element['user']['club'];
        var videoClub = this.allClubList.filter(function (element1, index) {
          return (element1._id === videoClubName);
        })[0];

        if (typeof (videoClub) != 'undefined') {
          element.club = videoClub.name;
        } else {
          element.club = '';
        }

      });

    }

    // console.log(this.videoList);
    this.loadingIndicator = false;
  }

  onError(error) {
    this.showProgressBar = false;
    const errorBody = JSON.parse(error._body);
    console.error(errorBody);
    alert(errorBody.msg);
  }
  confirmDelete(id) {
    if (confirm("Are you sure to delete this video ?")) {
      this.videoService.deleteVideoById(id, this.userService.token).subscribe(
        (response) => { this.getVideos() },
        (error) => this.onError(error)
      );
    }
  }
  assignVideo(id) {

    this.videoId = id;
    this.userService.getUsers(this.userService.token).subscribe(
      (response) => this.onGetUsersSuccess(response),
      (error) => this.onError(error)
    );
    this.assignVideoModal.open();



  }
  onGetUsersSuccess(response) {
    const userlist = JSON.parse(response._body);
    this.trackUserlist = [];
    userlist.forEach((usr, index) => {
      this.trackUserlist.push({
        'id': usr._id,
        'name': usr.firstName + ' ' + usr.lastName
      });
    });
    this.userlistOptions = this.trackUserlist;

  }
  usersToVideo() {
    this.showProgressBar = true;
    // console.log(this.videoId);
    // console.log(this.userlistModel);
    this.videoService.assignVideo(this.userService.token, this.videoId, this.userlistModel).subscribe(
      (response) => this.usersToVideoSuccess(response),
      (error) => this.onError(error)
    );
  }
  usersToVideoSuccess(response) {
    this.showProgressBar = false;
    const responseBody = JSON.parse(response._body);
    this.successmsg = responseBody.message;
    this.assignVideoModal.close();
    this.videoSucessModal.open();
  }

  downloadVideo(video, e) {
    e.preventDefault();
    e.stopPropagation();
    this.videoUrl = this.baseAmazonVideoUrl + video.path;
    this.videoOriginalName = video.original_filename;
    const elem= this.lnkDownloadLink;
    setTimeout(function () {
      elem.nativeElement.click();
      this.videoUrl = '';
    }, 1000);

  }
}
