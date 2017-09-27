import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import {
  Observable
} from 'rxjs/Observable';
import {
  Injectable
} from '@angular/core';
import {
  UserService
} from './services/user.service';
import 'rxjs/Rx';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) { }
  canActivate(route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.userService.isAdmin().map(e => {
      //  console.log(e);
      if (e) {
        // console.log(e);
        return true;

      }
    }).catch(() => {
      // console.log("Not admin");
      this.router.navigate(['/home']);
      return Observable.of(false);
    });

  }
}
