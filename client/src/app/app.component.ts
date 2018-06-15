import { Component } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(public auth: AuthenticationService, public router: Router) {}

  logOut() {
    var userData = this.auth.getUserDetails();
    return this.auth.logout(userData.username).subscribe(
      res => {
        this.router.navigateByUrl('/');
      }, err => {
        console.log(err);
      });
  }
}
