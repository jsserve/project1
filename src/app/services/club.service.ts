import {
  Injectable
} from '@angular/core';
import {
  GlobalVariables
} from './../models/global.model';
import {
  User
} from './../models/user.model';
import {
  Http,
  RequestOptions,
  Headers
} from '@angular/http';
import {
  LocalStorageService
} from 'angular-2-local-storage';
import {
  ProgressHttp
} from 'angular-progress-http';
import {
  Observable
} from 'rxjs/Observable';
import {
  Subject
} from 'rxjs/Subject';
@Injectable()
export class ClubService {
  private baseApiUrl = GlobalVariables.BASE_API_URL;
  progress$: Observable<number>;
  private progressSubject: Subject<number>;

  constructor(private http: Http, private p_http: ProgressHttp) {
    this.progressSubject = new Subject<number>();
    this.progress$ = this.progressSubject.asObservable();
  }

  getRequestedClubs(token: String) {
    const headers = new Headers({
      'Authorization': token
    });
    const options = new RequestOptions({
      headers: headers
    });
    return this.http.get(this.baseApiUrl + 'club/fetchAllUnActivated', options);
  }

  approveClub(data: any, token: String) {
    // console.log(data);
    const headers = new Headers({
      'Authorization': token
    });
    const options = new RequestOptions({
      headers: headers
    });
    const form: any = new FormData();
    form.append('name', data.name);
    form.append('slug', data.slug);
    form.append('logoFile', data.logo._file);
    form.append('id', data.id);
    form.append('activate', data.activate);
    form.append('teams', data.teams);
    return this.p_http.withUploadProgressListener(progress => {
      // console.log(`Uploading ${progress.percentage}%`);
      this.progressSubject.next(progress.percentage);
    }).post(this.baseApiUrl + 'club/activate', form, options);
  }

  getActivatedClubs(token: String) {
    const headers = new Headers({
      'Authorization': token
    });
    const options = new RequestOptions({
      headers: headers
    });
    return this.http.get(this.baseApiUrl + 'club/fetchAllActivated', options);
  }

  getClubBySlug(slug) {
    return this.http.get(this.baseApiUrl + 'club/getBySlug?slug=' + slug);
  }
  checkClubActive(token: String) {
    const headers = new Headers({
      'Authorization': token
    });
    const options = new RequestOptions({
      headers: headers
    });
    return this.http.get(this.baseApiUrl + 'club/checkClubActive', options);
  }
  deleteClub(clubId, token) {
    const headers = new Headers({
      'Authorization': token
    });
    const options = new RequestOptions({
      headers: headers
    });
    return this.http.delete(this.baseApiUrl + 'club/delete?id=' + clubId, options);
  }

  createClub(club) {
    return this.http.post(this.baseApiUrl + 'club/create', club);
  }

  getAllClubs(token: String) {
    const headers = new Headers({
      'Authorization': token
    });
    const options = new RequestOptions({
      headers: headers
    });
    return this.http.get(this.baseApiUrl + 'club/fetchAll', options);
  }

  addAndApproveClub(data: any, token: String) {
    // console.log(data);
    const headers = new Headers({
      'Authorization': token
    });
    const options = new RequestOptions({
      headers: headers
    });
    const form: any = new FormData();
    form.append('name', data.newClubName);
    form.append('slug', data.newClubSlug);
    form.append('logoFile', data.logo._file);
    form.append('activate', data.activate);
    form.append('teams', data.teams);
    return this.p_http.withUploadProgressListener(progress => {
      // console.log(`Uploading ${progress.percentage}%`);
      this.progressSubject.next(progress.percentage);
    }).post(this.baseApiUrl + 'club/addandapprove', form, options);
  }

  editClub(data: any, token: String) {
    // console.log(data);
    const headers = new Headers({
      'Authorization': token
    });
    const options = new RequestOptions({
      headers: headers
    });
    const form: any = new FormData();
    form.append('name', data.editClubName);
    form.append('slug', data.editClubSlug);
    if (data.updatelogo)
      form.append('logoFile', data.logo._file);
    form.append('id', data.id);
    form.append('updateLogo', data.updatelogo);
    form.append('activate', true);
    form.append('teams', data.teams);
    return this.p_http.withUploadProgressListener(progress => {
      // console.log(`Uploading ${progress.percentage}%`);
      this.progressSubject.next(progress.percentage);
    }).post(this.baseApiUrl + 'club/activate', form, options);
  }

  updateClubwithoutLogo(token: String, club) {
    const headers = new Headers({
      'Authorization': token
    });
    const options = new RequestOptions({
      headers: headers
    });
    return this.http.post(this.baseApiUrl + 'club/updateClubwithoutLogo', club, options);
  }

  deactiveClub(club, token) {
    const headers = new Headers({
      'Authorization': token
    });
    const options = new RequestOptions({
      headers: headers
    });
    return this.http.post(this.baseApiUrl + 'club/deactive', club, options);
  }

}
