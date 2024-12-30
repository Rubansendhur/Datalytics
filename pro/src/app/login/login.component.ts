import { Component } from '@angular/core';

@Component({
  selector: 'app-login', // This selector should match the tag you're using
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  // Method to handle form submission
  login() {
    console.log('Username:', this.username);
    console.log('Password:', this.password);
  }
}
