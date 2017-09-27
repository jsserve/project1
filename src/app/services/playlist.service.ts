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
    Playlist
} from './../models/playlist.model';
import {
    Http, RequestOptions, Headers
} from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
@Injectable()
export class PlaylistService {
    private baseApiUrl = GlobalVariables.BASE_API_URL;
    private baseUrl = GlobalVariables.BASE_URL;
    progress$: Observable<number>;
    private progressSubject: Subject<number>;

    public plist: Playlist;
    public aUser: any;
    constructor(private http: Http) {
        this.progressSubject = new Subject<number>();
        this.progress$ = this.progressSubject.asObservable();
    }
    assignPlaylist(token: String, id: any, user: any = []) {
        const headers = new Headers({ 'Authorization': token });
        const body = { token: token, id: id, users: user, url: this.baseUrl + 'playlist/view/' + id };
        const options = new RequestOptions({ headers: headers });

        return this.http.post(this.baseApiUrl + 'playlist/assignUsers', body, options);
    }
    getPlaylists(token: String) {
        const headers = new Headers({ 'Authorization': token });
        const options = new RequestOptions({ headers: headers });

        return this.http.get(this.baseApiUrl + 'playlist/fetchAll', options);
    }
    createPlaylists(plist: Playlist) {
        // console.log('plist' + plist);
        return this.http.post(this.baseApiUrl + 'playlist/create', plist);
    }
    updatePlaylists(plist: Playlist) {
        // console.log('plist' + plist);
        return this.http.post(this.baseApiUrl + 'playlist/updatePlaylist', plist);
    }
    fetchPlaylistData(token: String, id) {
        const headers = new Headers({ 'Authorization': token });
        const options = new RequestOptions({ headers: headers, params: { id: id } });

        return this.http.get(this.baseApiUrl + 'playlist/fetchPlaylistData', options);
    }
    createPlaylistsEvents(playlist: any = [], plist: Playlist) {
        const body = { plist: plist, events: playlist };
        return this.http.post(this.baseApiUrl + 'playlist/create', body);
    }
    updatePlaylistsEvents(playlist: any = [], plist: Playlist) {
        const body = { plist: plist, events: playlist };
        return this.http.post(this.baseApiUrl + 'playlist/updatePlaylist', body);
    }
    deletePlaylist(token: String, id: any) {
        const headers = new Headers({ 'Authorization': token });
        const body = { token: token, id: id };
        const options = new RequestOptions({ headers: headers });

        return this.http.post(this.baseApiUrl + 'playlist/deletePlaylist', body, options);
    }
}