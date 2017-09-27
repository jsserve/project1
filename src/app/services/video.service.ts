import {
  Injectable
} from '@angular/core';
import {
  GlobalVariables
} from './../models/global.model';
import {
  Video
} from './../models/video.model';
import {
  Http, RequestOptions, Headers
} from '@angular/http';
import { ProgressHttp } from 'angular-progress-http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
@Injectable()
export class VideoService {
  private baseApiUrl = GlobalVariables.BASE_API_URL;
  private baseUrl = GlobalVariables.BASE_URL;

  progress$: Observable<number>;
  private progressSubject: Subject<number>;

  constructor(private http: Http, private p_http: ProgressHttp) {
    this.progressSubject = new Subject<number>();
    this.progress$ = this.progressSubject.asObservable();
  }

  upload(data: any) {
    // console.log(data);
    const form: any = new FormData();
    form.append('user', data.user);
    form.append('title', data.title);
    form.append('videoFile', data.selectedFile._file);
    form.append('date', data.date);
    form.append('type', data.type);
    form.append('club', data.clubName);

    form.append('club2', data.clubName2);
    form.append('competition', data.competition);
    form.append('description', data.description);
    form.append('scoreTeam1', data.scoreTeam1);
    form.append('scoreTeam2', data.scoreTeam2);
    form.append('season', data.season);
    form.append('tacticsTeam1', data.tacticsTeam1);
    form.append('tacticsTeam2', data.tacticsTeam2);
    form.append('team1', data.team1);
    form.append('team2', data.team2);

    const headers = new Headers({ 'Authorization': data.token });
    const options = new RequestOptions({ headers: headers });

    return this.p_http.withUploadProgressListener(progress => {
      // console.log(`Uploading ${progress.percentage}%`);
      this.progressSubject.next(progress.percentage);
    }).post(this.baseApiUrl + 'video/upload', form, options)
  }

  getVideos(token: String) {
    const headers = new Headers({ 'Authorization': token });
    const options = new RequestOptions({ headers: headers });
    return this.http.get(this.baseApiUrl + 'video/fetchAll', options);
  }

  getVideoById(id: any, token: String) {
    const headers = new Headers({ 'Authorization': token });
    const options = new RequestOptions({ headers: headers });
    return this.http.get(this.baseApiUrl + 'video/getById?id=' + id, options);
  }

  updateVideo(id, data, token) {
    const headers = new Headers({ 'Authorization': token });
    const options = new RequestOptions({ headers: headers });
    return this.http.put(this.baseApiUrl + 'video/edit?id=' + id, data, options);
  }

  deleteVideoById(id: any, token: String) {
    const headers = new Headers({ 'Authorization': token });
    const options = new RequestOptions({ headers: headers });
    return this.http.get(this.baseApiUrl + 'video/deleteById?id=' + id, options);
  }

  assignVideo(token: String, id: any, user: any = []) {
    const headers = new Headers({ 'Authorization': token });
    const body = { token: token, id: id, users: user, url: this.baseUrl + 'videos/view/' + id };
    const options = new RequestOptions({ headers: headers });


    return this.http.post(this.baseApiUrl + 'video/assignUsers', body, options);
  }
  getVideosClub(id: any, token: String) {
    const headers = new Headers({ 'Authorization': token });
    const options = new RequestOptions({ headers: headers });
    return this.http.get(this.baseApiUrl + 'video/getVideosClub?club=' + id, options);
  }
}
