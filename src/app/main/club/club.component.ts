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
  Club
} from './../../models/club.model';
import {
  UserService
} from './../../services/user.service';
import {
  ClubService
} from './../../services/club.service';
import {
  ActivatedRoute
} from '@angular/router';
import {
  GlobalVariables
} from './../../models/global.model';
import {
  Video
} from './../../models/video.model';
import {
  VideoService
} from './../../services/video.service';
import {
  TeamService
} from './../../services/team.service';

@Component({
  selector: 'app-club',
  templateUrl: './club.component.html',
  styleUrls: ['./club.component.css']
})
export class ClubComponent implements OnInit {
  video_type: string = 'All';
  videoSucess: any;
  errormsg: string;
  private sub: any;
  private id: String;
  private club;
  private baseImageUrl = GlobalVariables.BASE_IMAGE_URL;
  private baseVideoUrl = GlobalVariables.BASE_VIDEO_URL;
  private baseAmazonVideoUrl = GlobalVariables.BASE_AMAZON_VIDEO_URL;
  private clubActive: boolean;
  grid: boolean;
  list: boolean;
  videoList: Video[];
  loadingIndicator: boolean = true;
  usersList: User[];
  isCoachOrAnalyst: boolean = false;
  allVideos: Video[];
  teamsList: any;
  videoUrl: any;
  videoOriginalName: any;

  @ViewChild('SucessModal') SucessModal;
  @ViewChild('ErrorModal') ErrorModal;
  @ViewChild('lnkDownloadLink') lnkDownloadLink: ElementRef;
  constructor(private clubService: ClubService, private userService: UserService, private route: ActivatedRoute, private videoService: VideoService, private teamService: TeamService) {
  }

  ngOnInit() {
    this.teamService.getAllTeams(this.userService.token).subscribe(
      (response: any) => {
        this.teamsList = JSON.parse(response._body);
      },
      (error) => this.onError(error)
    );

    this.sub = this.route.params.subscribe(params => {
      this.id = params['id'];
      this.getClub(this.id);
      this.getVideos();
      this.getVideos();
      this.gridView();
      this.getUsers()
    });

    var user = this.userService.loadUserFromStorage();

    if (user['role'] == 3 || user['role'] == 4) {
      this.isCoachOrAnalyst = true;
    } else {
      this.isCoachOrAnalyst = false;
    }

    

  }
  getVideos() {
    // console.info("users: "+JSON.stringify(this.userService));
    // console.log(this.userService.user.club);
    this.videoService.getVideosClub(this.id, this.userService.token).subscribe(
      (response) => this.onGetVideosSuccess(response),
      (error) => this.onError(error)
    );
  }
  gridView() {
    this.grid = true;
    this.list = false;
  }
  listView() {
    this.grid = false;
    this.list = true;
  }
  onGetVideosSuccess(response) {
    this.videoSucess = JSON.parse(response._body);

    if (this.videoSucess.message) {
      this.errormsg = this.videoSucess.message;
      this.ErrorModal.open();
    } else {
      this.allVideos = this.videoSucess;
      this.typeFilter();
      // this.videoList = this.videoSucess;
    }


  }
  getClub(id) {
    this.clubService.getClubBySlug(id)
      .subscribe(
      (response) => this.onGetClubSuccess(response),
      (error) => this.onError(error)
      );
  }

  onGetClubSuccess(response) {
    this.club = JSON.parse(response._body);

    if (this.club && this.club.name) {
      document.getElementById("site-title").textContent = this.club.name;
      document.getElementById("site-logo").setAttribute('src', this.baseImageUrl + this.club.logo);
    }
    if (this.club) {
      this.clubActive = this.club.activated;

      if (!this.club.success) {
        this.errormsg = this.club.message;
      }
      if (!this.club.activated) {
        this.errormsg = "Club is deactivated by Admin.";
        this.ErrorModal.open();
      }

    }


  }

  onError(error) {
    const errorBody = JSON.parse(error._body);
    this.errormsg = errorBody.message
    this.ErrorModal.open();
  }

  getUsers() {
    this.userService.getAllUsersByClubId(this.id, this.userService.token).subscribe(
      (response) => this.onGetUsersSuccess(response),
      (error) => this.onError(error)
    );
  }

  onGetUsersSuccess(response) {
    this.usersList = JSON.parse(response._body);

    this.usersList.forEach(element => {
      if (this.teamsList.length > 0) {
        var userTeam = this.teamsList.filter(function (element1, index) {
          return (element1._id === element.teams[0]);
        })[0];

        if (typeof (userTeam) != 'undefined')
          element.teams = userTeam.name;
        else
          element.teams = '';
      } else {
        element.teams = '';
      }
    });
    
    this.loadingIndicator = false;
  }
  typeFilter() {

    var type = this.video_type;
    this.videoList = this.allVideos.filter(function (element, index) {
      return (type == "All" || element.type == type);
    });
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
