import {
  Component,
  OnInit
} from '@angular/core';
import {
  Club
} from './../../models/club.model';
import {
  ClubService
} from './../../services/club.service';
import {
  UserService
} from './../../services/user.service';
import {
  GlobalVariables
} from './../../models/global.model';
import { ViewChild } from '@angular/core';
import {
  Router, ActivatedRoute
} from '@angular/router';
import { IMultiSelectOption, IMultiSelectSettings, IMultiSelectTexts } from 'angular-2-dropdown-multiselect';
import {
  TeamService
} from './../../services/team.service';

@Component({
  selector: 'app-clubs-administration',
  templateUrl: './clubs-administration.component.html',
  styleUrls: ['./clubs-administration.component.css']
})
export class ClubsAdministrationComponent implements OnInit {
  clubData: any;
  clubId: any;
  isCoachAdmin: boolean = false;
  isAdmin: boolean;

  private baseUrl = GlobalVariables.BASE_VIDEO_URL;
  clubList: Club[] = [];
  loadingIndicator: boolean = true;
  reorderable: boolean = true;
  activatedClubList: Club[] = [];
  newClub: any = [];
  editClub: any = [];
  showEditForm: boolean = false;
  selectedIndex: number = 0;
  showProgressBar: boolean = false;
  errormsg: string;
  successmsg: string;
  private router: Router;
  teamslistOptions: IMultiSelectOption[];
  teamsModel: any[];

  teamslistSettings: IMultiSelectSettings = {
    enableSearch: true,
    checkedStyle: 'fontawesome',
    containerClasses: 'no-button-arrow',
    buttonClasses: 'btn btn-default btn-block',
    fixedTitle: false,
    maxHeight: '100px',
    dynamicTitleMaxItems: 2,
    closeOnClickOutside: true
  };
  teamslistTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'Team selected',
    checkedPlural: 'Teams selected',
    searchPlaceholder: 'Find',
    defaultTitle: ' Select Team  ',
    allSelected: 'All Teams ',
  };

  // columns = [
  //   { prop: 'ClubName' }
  // ];

  @ViewChild('form') form;
  @ViewChild('ErrorModal') errorModal;
  @ViewChild('successModal') successModal;
  constructor(private clubService: ClubService, private userService: UserService, private teamService: TeamService, r: Router) {
    //this.selectedIndex = "1";
    this.router = r;
  }

  ngOnInit() {
    var user = this.userService.loadUserFromStorage();
    if (user['role'] == 1) {
      this.isAdmin = true;
    } else {
      this.isAdmin = false;
      // this.router.navigate(['/backoffice']);
    }
    if (user['role'] == 2) {
      this.isCoachAdmin = true;
      this.clubId = user['club'];
    }

    this.getClubs();
    this.getActivatedClubs();
    this.teamService.getAllTeams(this.userService.token).subscribe(
      (response: any) => {
        const teamslLst = JSON.parse(response._body);
        this.teamslistOptions = [];
        teamslLst.forEach((obj, index) => {
          this.teamslistOptions.push({
            'id': obj._id,
            'name': obj.name
          });
        });
        // console.log(this.teamslistOptions);

      },
      (error) => this.onError(error)
    );
  }

  getClubs() {
    this.clubService.getRequestedClubs(this.userService.token).subscribe(
      (response) => this.onGetRequestedClubsSuccess(response),
      (error) => this.onError(error)
    );
  }

  onGetRequestedClubsSuccess(response) {
    this.clubList = JSON.parse(response._body);
    // console.log(this.clubList);
    this.loadingIndicator = false;

    this.clubList.forEach((obj: any, index) => {
      //obj.teams = typeof (obj.teams) != 'undefined' && obj.teams[0] == 'undefined' ? [] : obj.teams;

      if (typeof (obj.teams) != 'undefined' && obj.teams != null) {
        if (obj.teams[0] == 'undefined') {
          obj.teams = [];
        }
      } else {
        obj.teams = [];
      }

    });

    if (this.selectedClub != null) {
      this.selectedClub = [];
    }
  }

  onError(error) {
    this.showProgressBar = false;
    const errorBody = JSON.parse(error._body);
    // console.error(errorBody);
    // alert(errorBody.msg);
    this.errormsg = errorBody.msg || errorBody.message;
    this.errorModal.open();
  }

  selectedClub = [];
  onRowActivate(e) {
    // console.log(e);
  }

  onRowSelected(e) {
    // console.log(this.selectedClub);
    this.generateNiceLinkName();
  }

  generateNiceLinkName() {
    this.selectedClub[0].NiceLinkName = this.slugify(this.selectedClub[0].name);
    //  console.log(this.selectedClub[0].NiceLinkName)
  }

  generateNewClubNiceLinkName() {
    if (this.newClub.name)
      this.newClub.NiceLinkName = this.slugify(this.newClub.name);
  }

  slugify(text) {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
  }

  selectedFile;
  name;
  onSubmit(f, acivate) {
    // console.log(f.value);
    // console.log(acivate);
    if (!f.valid) {
      return false;
    }
    this.showProgressBar = true;
    // console.log(f.value.teams);

    if (typeof (f.value.teams) != 'undefined' && f.value.teams != null && f.value.teams.length > 0) {
      if (this.selectedClub[0].logo == '' || this.selectedClub[0].updateLogo) {
        if (typeof (this.selectedFile) != 'undefined') {
          let data = f.form.getRawValue();
          data.token = this.userService.token;
          data.user = this.userService.user._id;
          data.logo = this.selectedFile;
          data.id = this.selectedClub[0]._id;
          data.activate = acivate;
          // console.log(data);
          this.clubService.approveClub(data, this.userService.token).subscribe(
            (response) => this.onApproveClubSuccess(response),
            (error) => this.onError(error)
          );
        } else {
          //alert('Please select file.');
          this.errormsg = 'Please select file.';
          this.errorModal.open();
          this.showProgressBar = false;
        }
      } else {
        this.clubService.updateClubwithoutLogo(this.userService.token, { id: this.selectedClub[0]._id, name: f.value.name, slug: f.value.slug, location: null, activate: acivate, teams: f.value.teams }).subscribe(
          (response) => this.onApproveClubSuccess(response),
          (error) => this.onError(error)
        );
      }
    } else {
      this.errormsg = 'Please select team(s).';
      this.errorModal.open();
      this.showProgressBar = false;
    }
  }

  onSubmitNewClub(f, activate) {
    // console.log(f.value);

    if (!f.valid) {
      return false;
    }
    this.showProgressBar = true;

    if (typeof (f.value.teams) != 'undefined' && f.value.teams != null && f.value.teams.length > 0) {
      if (typeof (this.newClub.selectedFile) != 'undefined') {
        let data = f.form.getRawValue();
        data.token = this.userService.token;
        data.user = this.userService.user._id;
        data.logo = this.newClub.selectedFile;
        data.activate = activate;
        //data.id = this.selectedClub[0]._id;
        //console.log(data);
        this.clubService.addAndApproveClub(data, this.userService.token).subscribe(
          (response) => this.onAddAndApproveClubSuccess(response),
          (error) => this.onError(error)
        );
      } else {
        //alert('Please select file.');
        this.errormsg = 'Please select file.';
        this.errorModal.open();
        this.showProgressBar = false;
      }
    } else {
      this.errormsg = 'Please select team(s).';
      this.errorModal.open();
      this.showProgressBar = false;
    }
  }

  onSubmitEditClub(f) {
    // console.log(f.value);

    if (!f.valid) {
      return false;
    }
    this.showProgressBar = true;


    if (typeof (this.editClub.teams) != 'undefined' && this.editClub.teams != null && this.editClub.teams.length > 0) {
      if (this.editClub.updateLogo) {
        if (typeof (this.editClub.selectedFile) != 'undefined') {
          let data = f.form.getRawValue();
          data.token = this.userService.token;
          data.user = this.userService.user._id;
          data.logo = this.editClub.selectedFile;
          data.id = this.editClub.Id;
          data.updatelogo = this.editClub.updateLogo;
          data.teams = this.editClub.teams;
          this.clubService.editClub(data, this.userService.token).subscribe(
            (response) => this.oneditClubSuccess(response),
            (error) => this.onError(error)
          );
        } else {
          // alert('Please select file.');
          this.errormsg = 'Please select file.';
          this.errorModal.open();
          this.showProgressBar = false;
        }
      } else {
        this.clubService.updateClubwithoutLogo(this.userService.token, { id: this.editClub.Id, name: this.editClub.name, slug: this.editClub.NiceLinkName, location: null, activate: true, teams: this.editClub.teams }).subscribe(
          (response) => this.oneditClubSuccess(response),
          (error) => this.onError(error)
        );
      }
    } else {
      this.errormsg = 'Please select team(s).';
      this.errorModal.open();
      this.showProgressBar = false;
    }
  }

  onApproveClubSuccess(response) {
    this.showProgressBar = false;
    // console.log(response);
    this.getClubs();
    this.getActivatedClubs();

    // alert("Club Approved");
    this.successmsg = 'Club Updated Successfully.';
    this.successModal.open();
  }

  oneditClubSuccess(response) {
    this.showProgressBar = false;
    this.showEditForm = false;
    //this.getClubs();
    this.getActivatedClubs();
    // alert("Club Updated Successfully");
    this.successmsg = "Club Updated Successfully.";
    this.successModal.open();
  }

  selectedIndexChange(val: number) {
    // console.log(val);
    this.selectedIndex = val;
  }

  onAddAndApproveClubSuccess(response) {
    this.showProgressBar = false;
    // console.log(response);
    this.form.nativeElement.reset();
    // console.log(this.newClub);
    //this.getClubs();
    this.getActivatedClubs();
    this.getClubs();
    // alert("Club Approved");
    this.successmsg = "Club Created";
    this.successModal.open();
    this.newClub = [];
    //  this.selectedIndexChange(1);

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

  onSelectNewLogoFile(e) {
    const files = e.target.files;
    for (let i = 0; i < files.length; i++) {
      this.newClub.selectedFile = {
        name: files[i].name,
        size: files[i].size,
        _file: files[i]
      };
    }
    e.target.files = null;
  }

  getActivatedClubs() {
    if (this.isCoachAdmin) {
      this.clubService.getClubBySlug(this.clubId)
        .subscribe(
        (response) => this.onGetActivatedClubsSuccess(response),
        (error) => this.onError(error)
        );
    } else {
      this.clubService.getActivatedClubs(this.userService.token).subscribe(
        (response) => this.onGetActivatedClubsSuccess(response),
        (error) => this.onError(error)
      );
    }

  }

  onGetActivatedClubsSuccess(response) {
    this.clubData = JSON.parse(response._body);
    if (this.isCoachAdmin && this.clubData != null) {
      this.activatedClubList = [];
      this.activatedClubList.push(JSON.parse(response._body));

    } else {
      this.activatedClubList = JSON.parse(response._body);
    }

    this.activatedClubList.forEach((obj: any, index) => {
      // obj.teams = typeof (obj.teams) != 'undefined' && obj.teams[0] == 'undefined' ? [] : obj.teams;
      if (typeof (obj.teams) != 'undefined' && obj.teams != null) {
        if (obj.teams[0] == 'undefined') {
          obj.teams = [];
        }
      } else {
        obj.teams = [];
      }
    });
  }

  deleteClub(club, flag) {
    var isValid = true;
    if (flag == 1 && (club.users.length > 0 || club.videos.length > 0)) {
      isValid = false;
    }

    if (isValid) {
      this.showProgressBar = true;
      this.clubService.deleteClub(club._id, this.userService.token).subscribe(
        (response) => {
          if (flag == 1) {
            this.activatedClubList = this.activatedClubList.filter(function (element, index) {
              return (element._id != club._id);
            });
          } else {
            this.clubList = this.clubList.filter(function (element, index) {
              return (element._id != club._id);
            });
            this.selectedClub = [];
          }
          //this.getActivatedClubs();
          //this.getClubs();
          this.showProgressBar = false;
        },
        (error) => this.onError(error)
      );
    } else {
      // alert("Delete is not possible for the club because of there are users or videos behind");
      this.errormsg = "Delete is not possible for the club because of there are users or videos behind";
      this.errorModal.open();
    }
  }

  editClubDetails(club) {

    this.showEditForm = true;
    this.editClub.Id = club._id;
    this.editClub.name = club.name;
    this.editClub.NiceLinkName = club.slug;
    this.editClub.logo = club.logo;
    this.editClub.updateLogo = false;
    this.editClub.teams = club.teams;
  }

  updateLogo(club) {
    this.editClub.updateLogo = true;
  }

  updateDeactivatedClubLogo(club) {
    club.updateLogo = true;
  }

  cancelUpdateLogo(club) {
    this.editClub.updateLogo = false;
  }

  cancelUpdate(club) {
    this.showEditForm = false;
    this.editClub = [];
  }

  onSelectEditLogoFile(e) {
    const files = e.target.files;
    for (let i = 0; i < files.length; i++) {
      this.editClub.selectedFile = {
        name: files[i].name,
        size: files[i].size,
        _file: files[i]
      };
    }
    e.target.files = null;
  }

  deactivateClubDetails(club) {
    this.showProgressBar = true;
    this.clubService.deactiveClub({ id: club._id, logo: club.logo }, this.userService.token).subscribe(
      (response) => {
        //this. getActivatedClubs();
        //this.getClubs();
        this.activatedClubList = this.activatedClubList.filter(function (element, index) {
          return (element._id != club._id);
        });
        this.clubList.push(club);
        this.showProgressBar = false;
      },
      (error) => this.onError(error)
    );
  }

}
