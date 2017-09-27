import {
    Component,
    OnInit,
    ViewChild
} from '@angular/core';
import {
    UserService
} from './../../services/user.service';
import {
    User
} from './../../models/user.model';
import {
    Router,
    ActivatedRoute
} from '@angular/router';
import {
    ClubService
} from './../../services/club.service';
import {
    FormControl
} from "@angular/forms";
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';
import {
    CompleterService,
    CompleterData
} from 'ng2-completer';
import {
    TeamService
} from './../../services/team.service';


@Component({
    selector: 'app-users',
    templateUrl: './admin-edit-user.component.html',
    styleUrls: ['./admin-edit-user.css']
})
export class AdminEditUserComponent implements OnInit {
    userdetails: any;
    public user: User = new User();
    successmsg: string;
    errormsg: string;
    private router: Router;
    clubCtrl: FormControl;
    filteredClubs: any;
    userid: any;
    sub: any;
    clubData = [];
    activatedClubList: any;
    AllClubList: any;
    public roles = [
        { value: 2, display: 'Club Admin' },
        { value: 3, display: 'Analyst' },
        { value: 4, display: 'Coach' },
        { value: 5, display: 'Player' },
        { value: 6, display: 'Viewer' }
    ];
    public cpass: any = {};
    showProgressBar: boolean = false;
    teamsList: any;
    clubTeams: any;


    @ViewChild('editUserSuccessModel') editUserSuccessModel;
    @ViewChild('editUserErrorModal') editUserErrorModal;
    constructor(private route: ActivatedRoute, private completerService: CompleterService, private clubService: ClubService, private userService: UserService, r: Router, private teamService: TeamService) {
        this.router = r;
        this.clubCtrl = new FormControl();
    }

    ngOnInit() {
        this.user.teams = null;
        this.showProgressBar = true;
        this.getActivatedClubs();
        this.filteredClubs = this.clubCtrl.valueChanges
            .startWith(null)
            .map(name => this.filterClubs(name));
        this.sub = this.route.params.subscribe(params => {
            this.userid = params['id'];
            this.getEditUser(this.userid);
        });

        this.teamService.getAllTeams(this.userService.token).subscribe(
            (response: any) => {
                this.teamsList = JSON.parse(response._body);
            },
            (error) => this.onError(error)
        );
    }
    filterClubs(val: string) {
        return val ? this.clubData.filter(s => s.toLowerCase().indexOf(val.toLowerCase()) === 0) :
            this.clubData;
    }
    onSubmit(f) {
        if (!f.valid) {
            return false;
        }

        this.showProgressBar = true;
        // console.log(this.user);

        var clubname = this.user.club;
        var userclub = this.AllClubList.filter(function (element, index) {
            return (element.name.toLowerCase() === clubname.toLowerCase());
        })[0];

        if (typeof (userclub) == 'undefined') {
            this.clubService.createClub({ name: clubname })
                .subscribe(
                (response) => this.updateClubId(response),
                (error) => this.onError(error)
                );
        } else {
            this.user.club = userclub._id;
            this.updateProfile(this.user);
        }
    }

    updateClubId(response) {
        response._body = JSON.parse(response._body);
        this.AllClubList.push(response._body.club);
        this.user.club = response._body.club._id;
        this.updateProfile(this.user);
    }

    updateProfile(user) {
        this.userService.updateProfile(user)
            .subscribe(
            (response) => this.onEditProfileSuccess(response),
            (error) => this.onErrorEditProfile(error)
            );
    }

    editSuccessPopupClose() {
        this.router.navigateByUrl('/backoffice/users');
    }
    onEditProfileSuccess(response) {
        this.showProgressBar = false;
        const responseBody = JSON.parse(response._body);
        this.successmsg = responseBody.message;
        this.editUserSuccessModel.open();
        this.user = new User();
    }

    onError(error) {
        this.showProgressBar = false;
        const errorBody = JSON.parse(error._body);
        // console.error(errorBody);
        this.errormsg = errorBody.message;
        this.editUserErrorModal.open();
    }

    onErrorEditProfile(error) {
        this.showProgressBar = false;
        const errorBody = JSON.parse(error._body);
        console.error(errorBody);
        this.errormsg = errorBody.message;
        this.editUserErrorModal.open();

        var clubId = this.user.club;
        var userclub = this.AllClubList.filter(function (element, index) {
            return (element._id === clubId);
        })[0];

        if (typeof (userclub) != 'undefined')
            this.user.club = userclub.name;

        // alert(errorBody.msg);
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
    getEditUser(userId) {
        this.userService.getUserForEdit(this.userService.token, userId).subscribe(
            (response) => this.onFetchUserSuccess(response),
            (error) => this.onError(error)
        );
    }
    onFetchUserSuccess(response) {
        this.user = JSON.parse(response._body);

        if (typeof (this.user.teams) != 'undefined') {
            if (this.user.teams.length > 0) {
                this.user.teams = this.user.teams[0];
            }else{
                this.user.teams = null;
            }
        }else{
            this.user.teams = null;
        }

        this.cpass._id = this.user._id;
        this.clubService.getAllClubs(this.userService.token).subscribe(
            (response) => this.OnSuccessOfGetAllClubs(response),
            (error) => this.onError(error)
        );
    }

    OnSuccessOfGetAllClubs(response) {
        this.showProgressBar = false;
        this.AllClubList = JSON.parse(response._body);
        var clubId = this.user.club;
        var userclub = this.AllClubList.filter(function (element, index) {
            return (element._id === clubId);
        })[0]
        if (typeof (userclub) != 'undefined')
            this.user.club = userclub.name;
        else
            this.user.club = '';

        this.onChangeofClub();
    }
    changePassword(p) {

        if (!p.valid) {
            return false;
        }
        this.showProgressBar = true;
        this.cpass.backoffice = true;

        this.userService.changePassword(this.cpass)
            .subscribe(
            (response) => this.onEditProfileSuccess(response),
            (error) => this.onError(error)
            );
    }

    onChangeofClub() {
        var clubname = this.user.club;

        if (this.AllClubList.length > 0) {
            var userclub = this.AllClubList.filter(function (element, index) {
                return (element.name.toLowerCase() === clubname.toLowerCase());
            })[0];
        }

        this.clubTeams = [];
        if (typeof (userclub) != 'undefined') {
            this.teamsList.forEach((element, index) => {
                if (userclub.teams.indexOf(element._id) > -1) {
                    this.clubTeams.push(element);
                }
            });
        }

        if (this.clubTeams.length == 0) {
            this.user.teams = null;
        }
        // console.log(this.clubTeams);

    }
}