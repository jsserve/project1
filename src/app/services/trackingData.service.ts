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
  TrackingData
} from './../models/trackingData.model';
import {
  Http,
  RequestOptions,
  Headers
} from '@angular/http';
import {
  ProgressHttp
} from 'angular-progress-http';
import {
  Observable
} from 'rxjs/Observable';
import {
  Subject
} from 'rxjs/Subject';
import {
  Parser
} from 'xml2js';

@Injectable()
export class TrackingDataService {
  private baseApiUrl = GlobalVariables.BASE_API_URL;
  private baseUrl = GlobalVariables.BASE_URL;
  private baseTrackingDataUrl = GlobalVariables.BASE_TRACKINGDATA_URL;
  progress$: Observable<number>;
  private progressSubject: Subject<number>;

  constructor(private http: Http, private p_http: ProgressHttp) {
    this.progressSubject = new Subject<number>();
    this.progress$ = this.progressSubject.asObservable();
  }

  addTrackingData(data: any, token: String) {
    // console.log(data);
    const headers = new Headers({
      'Authorization': token
    });
    const options = new RequestOptions({
      headers: headers
    });
    const form: any = new FormData();
    form.append('user', data.user);
    form.append('title', data.title);
    form.append('trackingDataFile', data.trackingDataFile);
    form.append('video', data.video);
    form.append('default', data.default);
    form.append('xmlDataAppType', data.xmlDataAppType);
    return this.p_http.withUploadProgressListener(progress => {
      // console.log(`Uploading ${progress.percentage}%`);
      this.progressSubject.next(progress.percentage);
    }).post(this.baseApiUrl + 'trackingData/upload', form, options);
  }
  getEventDetails(videoId: any, eventId: any, token: String) {
    const headers = new Headers({
      'Authorization': token
    });
    const body = { token: token, videoId: videoId, eventId: eventId, };
    const options = new RequestOptions({
      headers: headers
    });
    return this.http.post(this.baseApiUrl + 'eventData/getEventDetails', body, options);
  }
  shareEvent(videoId: any, event: any, user: any = [], token: String) {
    const headers = new Headers({
      'Authorization': token
    });
    // console.log(event);
    const body = { token: token, videoId: videoId, event: event, users: user, url: this.baseUrl + 'videos/view/' + videoId + '/' + event.eventDataId + '/' + event.id };
    const options = new RequestOptions({
      headers: headers
    });
    return this.http.post(this.baseApiUrl + 'eventData/shareEvent', body, options);
  }
  getDataTrackingForVideo(videoId: any, token: String) {
    const headers = new Headers({
      'Authorization': token
    });
    const options = new RequestOptions({
      headers: headers
    });
    return this.http.get(this.baseApiUrl + 'trackingData/getForVideo?id=' + videoId, options);
  }

  getXmlFile(trackingData: any) {
    // console.log(trackingData);
    return this.http.get(this.baseTrackingDataUrl + trackingData.path);
  }

  parseXML(xml: String) {
    var parser = new Parser({
      trim: true,
      explicitArray: false
    });
    return new Promise(function (resolve, reject) {
      parser.parseString(xml, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  groupEvents(trackingData: Array<any>, duration: number) {
    const groupedObj = trackingData.reduce((prev, cur) => {
      const start = parseFloat(cur.start);
      const end = parseFloat(cur.end);
      if (cur.start !== "NaN" && start < duration) {
        cur.durationPercentange = ((end - start) * duration) / 100;
        cur.startPercentange = (start * duration) / 100;
        cur.duration = end - start;
        if (!prev[cur["name"]]) {
          prev[cur["name"]] = [cur];
        } else {
          prev[cur["name"]].push(cur);
        }
      }
      return prev;
    }, {});
    return Object.keys(groupedObj).map(key => ({
      key,
      values: groupedObj[key]
    }));
  }
  deleteXmlById(id: any, token: String) {
    const headers = new Headers({ 'Authorization': token });
    const options = new RequestOptions({ headers: headers });
    return this.http.get(this.baseApiUrl + 'trackingData/deleteById?id=' + id, options);
  }

  getEventsByVideo(videoId: any, token: String) {
    const headers = new Headers({
      'Authorization': token
    });
    const body = { token: token, videoId: videoId };
    const options = new RequestOptions({
      headers: headers
    });
    return this.http.post(this.baseApiUrl + 'eventData/getEventsByVideo', body, options);
  }
}
