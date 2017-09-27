import {
  Component,
  OnInit, ViewChild, ElementRef
} from '@angular/core';
import {
  ActivatedRoute
} from '@angular/router';
import {
  UserService
} from './../../../services/user.service';
import {
  TrackingDataService
} from './../../../services/trackingData.service';
import {
  VideoService
} from './../../../services/video.service';
import {
  ClubService
} from './../../../services/club.service';
import {
  TeamService
} from './../../../services/team.service';
import {
  GlobalVariables
} from './../../../models/global.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class VideoSettingsComponent implements OnInit {
  successmsg: any;
  xmlDelete: any;
  errormsg: any;

  private sub: any;
  private videoId: any;
  selectedFile: any = {
    name: ''
  };
  uploading = false;
  videoTrackingData: any = [];
  video: any = {};
  clubData = [];
  activatedClubList: any;
  allClubList: any;
  isAdmin: boolean;
  notExistedClub = [];
  showProgressBar: boolean = false;
  xmlId: any;
  teamsList: any;
  clubTeams1: any;
  clubTeams2: any;


  xmlDataApplicationTypes = ["tagapp", "ortec", "sportscode", "telestrator", "instat_deep", "instat_simple"];
  xmlDataApplicationTypeSelected = '';

  private baseTrackingDataUrl = GlobalVariables.BASE_TRACKINGDATA_URL;
  xmlUrl: any;
  xmlOriginalName: any;


  @ViewChild('form') form;
  @ViewChild('SucessModal') SucessModal;
  @ViewChild('ErrorModal') ErrorModal;
  @ViewChild('lnkDownloadLink') lnkDownloadLink: ElementRef;
  constructor(private route: ActivatedRoute, private trackingDataService: TrackingDataService, private userService: UserService, private videoService: VideoService, private clubService: ClubService, private teamService: TeamService) { }

  ngOnInit() {
    this.video.title = '';
    this.teamService.getAllTeams(this.userService.token).subscribe(
      (response: any) => {
        this.teamsList = JSON.parse(response._body);
      },
      (error) => this.onError(error)
    );

    this.getAllClubs();
    this.getActivatedClubs();
    // this.userService.isAdmin().subscribe(
    //   (response) => this.onIsAdminClubsSuccess(response),
    //   (error) => this.onError(error)
    // );
  }

  xmlTypeSelected(xmlType) {
    // console.log(this.xmlDataApplicationTypeSelected);
  }

  onIsAdminClubsSuccess(response) {
    const userAdmin = JSON.parse(response._body);
    if (userAdmin.success) {
      this.isAdmin = true;

    }

  }

  getAllClubs() {
    this.clubService.getAllClubs(this.userService.token).subscribe(
      (response) => this.onGetAllClubsSuccess(response),
      (error) => this.onError(error)
    );
  }

  onGetAllClubsSuccess(response) {
    this.allClubList = JSON.parse(response._body);
    this.sub = this.route.params.subscribe(params => {
      this.videoId = params['id'];
      this.getVideoTrackingDataItems(this.videoId);
      this.getVideo(this.videoId);
    });
  }


  getVideo(id) {
    this.videoService.getVideoById(id, this.userService.token)
      .subscribe(
      (response) => this.onGetVideoSuccess(response),
      (error) => this.onError(error)
      );
  }

  onGetVideoSuccess(response) {
    this.video = JSON.parse(response._body);
    //  console.log(this.video);

    var clubName = this.video.club;
    var ClubData1 = this.allClubList.filter(function (element, index) {
      return (element._id === clubName);
    })[0];

    var clubName2 = this.video.club2;
    var ClubData2 = this.allClubList.filter(function (element, index) {
      return (element._id === clubName2);
    })[0];

    // var teamA = this.video.team1;
    // var teamAClub = this.allClubList.filter(function (element, index) {
    //   return (element._id === teamA);
    // })[0];

    // var teamB = this.video.team2;

    // var teamBClub = this.allClubList.filter(function (element, index) {
    //   return (element._id === teamB);
    // })[0];

    if (typeof (ClubData1) != 'undefined')
      this.video.clubName = ClubData1.name;

    if (typeof (ClubData2) != 'undefined')
      this.video.clubName2 = ClubData2.name;

    // if (typeof (teamAClub) != 'undefined')
    //   this.video.team1 = teamAClub.name;

    // if (typeof (teamBClub) != 'undefined')
    //   this.video.team2 = teamBClub.name;

    this.onChangeofClub1();
    this.onChangeofClub2();
  }


  getVideoTrackingDataItems(id: String) {
    this.trackingDataService.getDataTrackingForVideo(id, this.userService.token).subscribe(
      (response) => this.onGetVideoTrackingDataItemsSuccess(response),
      (error) => this.onError(error)
    );
  }

  onGetVideoTrackingDataItemsSuccess(response) {
    // console.log(response);
    const res = JSON.parse(response._body);
    // console.log(res);
    this.videoTrackingData = res;
  }

  onError(error) {
    this.showProgressBar = false;
    const errorBody = JSON.parse(error._body);
    // console.error(errorBody);
    this.errormsg = errorBody.message;
    this.ErrorModal.open();
  }

  onSelectFile(e) {
    // console.log(e);
    const files = e.target.files;
    for (let i = 0; i < files.length; i++) {
      this.selectedFile = {
        name: files[i].name,
        size: files[i].size,
        _file: files[i]
      };
    }
    e.target.files = null;
  }

  onSubmit(f) {
    if (!f.valid || !this.selectedFile.name) {
      return false;
    }
    // console.log('submitted');

    this.uploading = true;
    f.value.selectedFile = this.selectedFile;
    f.value.token = this.userService.token;
    f.value.user = this.userService.user._id;
    f.value.video = this.videoId;
    f.value.title = this.video.title;
    f.value.xmlDataAppType = this.xmlDataApplicationTypeSelected;
    f.value.default = this.videoTrackingData.length > 0 ? false : true;
    this.trackingDataService.addTrackingData(f.value, this.userService.token).subscribe(
      (response) => this.onUploadSuccess(response),
      (error) => this.onError(error)
    );
  }

  onVideoEditSubmit(f) {

    if (!f.valid) {
      return false;
    }

    this.showProgressBar = true;
    if (f.value.type != 'Training') {
      f.value.title = '';
      var clubName = f.value.clubName;
      if (clubName != '' && clubName != null) {
        var ClubData1 = this.allClubList.filter(function (element, index) {
          return (element.name.toLowerCase() === clubName.toLowerCase());
        })[0];
      }

      var clubName2 = f.value.clubName2;
      if (clubName2 != '' && clubName2 != null) {
        var ClubData2 = this.allClubList.filter(function (element, index) {
          return (element.name.toLowerCase() === clubName2.toLowerCase());
        })[0];
      }

      // var teamName1 = f.value.team1;
      // if (teamName1 != '' && teamName1 != null) {
      //   var TeamData1 = this.allClubList.filter(function (element, index) {
      //     return (element.name.toLowerCase() === teamName1.toLowerCase());
      //   })[0];
      // }

      // var teamName2 = f.value.team2;
      // if (teamName2 != '' && teamName2 != null) {
      //   var TeamData2 = this.allClubList.filter(function (element, index) {
      //     return (element.name.toLowerCase() === teamName2.toLowerCase());
      //   })[0];
      // }

      this.notExistedClub = [];
      if (typeof (ClubData1) == 'undefined' && clubName && clubName != '' && clubName != null) {
        this.notExistedClub.push({ name: clubName });
      } else {
        f.value.clubName = ClubData1._id;
      }

      if (typeof (ClubData2) == 'undefined' && clubName2 && clubName2 != '' && clubName2 != null) {

        var existclub = this.notExistedClub.filter(function (element, index) {
          return (element.name.toLowerCase() === clubName2.toLowerCase());
        });

        if (typeof (existclub) == 'undefined' || existclub.length == 0)
          this.notExistedClub.push({ name: clubName2 });
      } else {
        f.value.clubName2 = ClubData2._id;
      }

      // if (typeof (TeamData1) == 'undefined' && teamName1 && teamName1 != '' && teamName1 != null) {
      //   var existclub = this.notExistedClub.filter(function (element, index) {
      //     return (element.name.toLowerCase() === teamName1.toLowerCase());
      //   });

      //   if (typeof (existclub) == 'undefined' || existclub.length == 0)
      //     this.notExistedClub.push({ name: teamName1 });
      // } else {
      //   if (teamName1 && teamName1 != '' && teamName1 != null)
      //     f.value.team1 = TeamData1._id;
      //   else
      //     f.value.team1 = '';
      // }

      // if (typeof (TeamData2) == 'undefined' && teamName2 && teamName2 != '' && teamName2 != null) {
      //   var existclub = this.notExistedClub.filter(function (element, index) {
      //     return (element.name.toLowerCase() === teamName2.toLowerCase());
      //   });

      //   if (typeof (existclub) == 'undefined' || existclub.length == 0)
      //     this.notExistedClub.push({ name: teamName2 });
      // } else {
      //   if (teamName2 && teamName2 != '' && teamName2 != null)
      //     f.value.team2 = TeamData2._id;
      //   else
      //     f.value.team2 = '';
      // }

      if (this.notExistedClub.length > 0) {
        var count = 0;
        this.notExistedClub.forEach(element => {
          this.clubService.createClub({ name: element.name })
            .subscribe(
            (response1: any) => {
              count++;

              var response = JSON.parse(response1._body);
              element.clubId = response.club._id;
              this.allClubList.push(response.club);

              if (this.notExistedClub.length == count) {

                if (typeof (ClubData1) == 'undefined' && clubName && clubName != '' && clubName != null) {
                  var existclub = this.notExistedClub.filter(function (element, index) {
                    return (element.name.toLowerCase() === clubName.toLowerCase());
                  })[0];
                  f.value.clubName = existclub.clubId;
                }

                if (typeof (ClubData2) == 'undefined' && clubName2 && clubName2 != '' && clubName2 != null) {
                  var existclub = this.notExistedClub.filter(function (element, index) {
                    return (element.name.toLowerCase() === clubName2.toLowerCase());
                  })[0];
                  f.value.clubName2 = existclub.clubId;
                }

                // if (typeof (TeamData1) == 'undefined' && teamName1 && teamName1 != '' && teamName1 != null) {
                //   var existclub = this.notExistedClub.filter(function (element, index) {
                //     return (element.name.toLowerCase() === teamName1.toLowerCase());
                //   })[0];
                //   f.value.team1 = existclub.clubId;
                // }

                // if (typeof (TeamData2) == 'undefined' && teamName2 && teamName2 != '' && teamName2 != null) {
                //   var existclub = this.notExistedClub.filter(function (element, index) {
                //     return (element.name.toLowerCase() === teamName2.toLowerCase());
                //   })[0];
                //   f.value.team2 = existclub.clubId;
                // }
                this.updateVideo(f);
              }
            },
            (error) => this.onError(error)
            );

        });
      }
      else {
        this.updateVideo(f);
      }
    } else {
      this.updateVideo(f);
    }

  }

  updateVideo(f) {

    if (typeof (f.value.season) == 'undefined')
      f.value.season = '';

    if (typeof (f.value.competition) == 'undefined')
      f.value.competition = '';

    if (typeof (f.value.description) == 'undefined')
      f.value.description = '';

    if (typeof (f.value.tacticsTeam1) == 'undefined')
      f.value.tacticsTeam1 = '';

    if (typeof (f.value.tacticsTeam2) == 'undefined')
      f.value.tacticsTeam2 = '';

    if (typeof (f.value.scoreTeam1) == 'undefined')
      f.value.scoreTeam1 = '';

    if (typeof (f.value.scoreTeam2) == 'undefined')
      f.value.scoreTeam2 = '';

    if (typeof (f.value.team1) == 'undefined')
      f.value.team1 = '';

    if (typeof (f.value.team2) == 'undefined')
      f.value.team2 = '';

    if (f.value.type != 'Training') {
      f.value.club = f.value.clubName;
      f.value.club2 = f.value.clubName2;
    } else {
      f.value.club = '';
      f.value.club2 = '';
    }
    this.getAllClubs();

    this.videoService.updateVideo(this.videoId, f.value, this.userService.token)
      .subscribe(
      (response) => this.onUpdateVideoSuccess(response),
      (error) => this.onError(error)
      );
  }

  onUpdateVideoSuccess(response) {
    this.showProgressBar = false;
    // console.log(response);
    alert('data updated successfully.');
    // TODO: Handle this
  }

  onUploadSuccess(response) {
    // console.log(response);
    this.selectedFile = { name: '' };
    this.form.nativeElement.reset();
    this.uploading = false;
    const res = JSON.parse(response._body);
    this.getVideoTrackingDataItems(this.videoId);
    alert(res.msg);
  }

  getActivatedClubs() {
    this.clubService.getActivatedClubs(this.userService.token).subscribe(
      (response) => this.onGetActivatedClubsSuccess(response),
      (error) => this.onError(error)
    );
  }

  onGetActivatedClubsSuccess(response) {
    this.activatedClubList = JSON.parse(response._body);
    this.activatedClubList.forEach(element => {
      this.clubData.push(element.name);
    });

  }
  confirmDelete(id, e) {
    this.xmlId = id;
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure to delete this XML ?")) {
      this.trackingDataService.deleteXmlById(id, this.userService.token).subscribe(
        (response) => { this.xmlDeleteSuccess(response) },
        (error) => this.onError(error)
      );
    }
  }
  xmlDeleteSuccess(response) {
    this.xmlDelete = JSON.parse(response._body);
    this.successmsg = this.xmlDelete.message;
    this.videoTrackingData = this.videoTrackingData.filter(item => item._id != this.xmlId);
    this.SucessModal.open();
  }

  onChangeofClub1() {
    var clubname = this.video.clubName;

    if (clubname != null) {
      if (this.allClubList.length > 0) {
        var userclub = this.allClubList.filter(function (element, index) {
          return (element.name.toLowerCase() === clubname.toLowerCase());
        })[0];
      }

      this.clubTeams1 = [];
      if (typeof (userclub) != 'undefined') {
        this.teamsList.forEach((element, index) => {
          if (userclub.teams.indexOf(element._id) > -1) {
            this.clubTeams1.push(element);
          }
        });
      }
    }

    if (this.clubTeams1.length == 0) {
      this.video.team1 = null;
    }
    // console.log(this.clubTeams1);

  }

  onChangeofClub2() {
    var clubname = this.video.clubName2;

    if (clubname != null) {
      if (this.allClubList.length > 0) {
        var userclub = this.allClubList.filter(function (element, index) {
          return (element.name.toLowerCase() === clubname.toLowerCase());
        })[0];
      }

      this.clubTeams2 = [];
      if (typeof (userclub) != 'undefined') {
        this.teamsList.forEach((element, index) => {
          if (userclub.teams.indexOf(element._id) > -1) {
            this.clubTeams2.push(element);
          }
        });
      }
    }

    if (this.clubTeams2.length == 0) {
      this.video.team2 = null;
    }

  }

  downloadVideo(xml, e) {
    e.preventDefault();
    e.stopPropagation();
    this.xmlUrl = this.baseTrackingDataUrl + xml.path;
    this.xmlOriginalName = xml.original_filename;
    const elem= this.lnkDownloadLink;
    setTimeout(function () {
      elem.nativeElement.click();
      this.xmlUrl = '';
    }, 1000);
  }

}
