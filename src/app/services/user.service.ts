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

@Injectable()
export class UserService {
  private baseApiUrl = GlobalVariables.BASE_API_URL;
  public user: User;
  public token: String;

  constructor(private http: Http, private localStorageService: LocalStorageService) {
    // console.log('User service initialised...');
    this.user = <User>this.loadUserFromStorage();
    this.token = <string>this.loadTokenFromStorage();
  }

  createNewUser(user: User) {
    return this.http.post(this.baseApiUrl + 'user/signup', user);
  }
  updateProfile(user: User) {
    return this.http.post(this.baseApiUrl + 'user/updateprofile', user);
  }
  login(user: any) {
    return this.http.post(this.baseApiUrl + 'user/signin', user);
  }

  getUserList(limit, page) {
    return this.http.get(this.baseApiUrl + 'user/fetchAll?page=' + page + '&limit=' + limit);
  }

  public setUser(_user: User) {
    this.user = _user;
  }

  public setToken(_token: String) {
    this.token = _token;
  }

  public saveUserToStorage() {
    this.localStorageService.set('user', this.user);
    this.localStorageService.set('token', this.token);
  }

  public loadUserFromStorage() {
    return this.localStorageService.get('user');
  }

  public loadTokenFromStorage() {
    return this.localStorageService.get('token');
  }

  isAuthenticated() {
    const promise = new Promise(
      (resolve, reject) => {
        //TODO : Check login stats from server
        resolve(this.token && (this.user.role != 1 && this.user.role != 2) ? true : false)
      }
    )
    return promise;
  }

  isAdmin() {
    const headers = new Headers({
      'Authorization': this.token
    });
    const options = new RequestOptions({
      headers: headers
    });
    return this.http.get(this.baseApiUrl + 'user/permissions', options);
  }

  getUsers(token: String) {
    const headers = new Headers({ 'Authorization': token });
    var loggedInUserId = this.localStorageService.get('user')['_id'];
    const options = new RequestOptions({ headers: headers, params: { loggedInUserId: loggedInUserId } });
    return this.http.get(this.baseApiUrl + 'user/fetchAll', options);
  }

  getUnApprovedUsers(token: String) {
    const headers = new Headers({ 'Authorization': token });
    var loggedInUserId = this.localStorageService.get('user')['_id'];
    const options = new RequestOptions({ headers: headers, params: { loggedInUserId: loggedInUserId } });
    return this.http.get(this.baseApiUrl + 'user/fetchUnApprovedUsers', options);
  }

  deleteUser(token: String, userId) {
    const headers = new Headers({ 'Authorization': token });
    const options = new RequestOptions({ headers: headers, params: { id: userId } });
    return this.http.get(this.baseApiUrl + 'user/deleteSelectedUser', options);
  }

  fetchUsers(token: String) {
    const headers = new Headers({ 'Authorization': token });
    const options = new RequestOptions({ headers: headers });
    return this.http.get(this.baseApiUrl + 'user/fetchUser', options);
  }
  getUserForEdit(token: String, userId) {
    const headers = new Headers({ 'Authorization': token });
    const options = new RequestOptions({ headers: headers, params: { id: userId } });
    return this.http.get(this.baseApiUrl + 'user/getEditUser', options);
  }
  activateUser(token: String, userId) {
    const headers = new Headers({ 'Authorization': token });
    const options = new RequestOptions({ headers: headers, params: { id: userId } });
    return this.http.get(this.baseApiUrl + 'user/activateUser', options);
  }
  deactivateUser(token: String, userId) {
    const headers = new Headers({ 'Authorization': token });
    const options = new RequestOptions({ headers: headers, params: { id: userId } });
    return this.http.get(this.baseApiUrl + 'user/deactivateUser', options);
  }
  changePassword(user: User) {
    return this.http.post(this.baseApiUrl + 'user/changePassword', user);
  }

  getAllUsersByClubId(clubId, token: String) {
    const headers = new Headers({ 'Authorization': token });
    const options = new RequestOptions({ headers: headers, params: { clubId: clubId } });
    return this.http.get(this.baseApiUrl + 'user/fetchallbyclub', options);
  }
}
