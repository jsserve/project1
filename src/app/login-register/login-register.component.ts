import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login-register',
  templateUrl: './login-register.component.html',
  styleUrls: ['./login-register.component.css']
})
export class LoginRegisterComponent implements OnInit { 
  type: String;
  private sub: any;
  showLogin: Boolean = true;
  constructor(private route: ActivatedRoute) { }

   ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
       this.type = params['type'];
       if(this.type === 'register'){
         this.showLogin = false;
       }else{
         this.showLogin = true;
       }
    });
  }

   ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
