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
  Router
} from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  public user: User = new User();
  private router: Router;
  errormsg: string;
  @ViewChild('loginErrorModal') loginErrorModal;
  constructor(private userService: UserService, r: Router) {
    this.router = r;
  }

  ngOnInit() { }

  onSubmit(f) {
    if (!f.valid) {
      return false;
    }
    console.log(this.user);
    this.userService.login(f.value)
      .subscribe(
      (response) => this.onLoginSuccess(response),
      (error) => this.onError(error)
      );
  }

  onLoginSuccess(response) {
    const responseBody = JSON.parse(response._body);

    // alert('Login Ok! Got token');
    this.userService.setUser(responseBody.user);
    this.userService.setToken(responseBody.token);
    this.userService.saveUserToStorage();
    if (responseBody.user.admin) {
      this.router.navigateByUrl('/backoffice/users');
    } else {
      this.router.navigateByUrl('/club/' + responseBody.user.club);
    }

  }

  onError(error) {
    const errorBody = JSON.parse(error._body);
    console.error(errorBody);
    this.errormsg = errorBody.message;
    this.loginErrorModal.open();
    // alert(errorBody.msg);
  }
}
