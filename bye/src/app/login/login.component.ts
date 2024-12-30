// frontend/src/app/login/login.component.ts
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router'; // Import Router
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  usernameOrEmail: string = '';
  password: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  navigateToSignup() {
    this.router.navigate(['/signup']);
  }
  constructor(private http: HttpClient, private router: Router) {} // Inject Router

  login() {
    const credentials = { usernameOrEmail: this.usernameOrEmail, password: this.password };

    // Make POST request to the login API
    this.http.post<{ message: string }>('http://localhost:5000/api/login', credentials)
      .subscribe({
        next: (response) => {
          this.successMessage = response.message; // Get message from JSON response
          this.errorMessage = '';

          // Redirect to dashboard or handle navigation after login
          this.router.navigate(['/dashboard']); // Navigate to the dashboard after login
        },
        error: (error) => {
          this.errorMessage = error.error; // Set error message from response
          this.successMessage = '';
        }
      });
  }
  navigateToForgotPassword() {
    this.router.navigate(['/forgot-password']); // Navigate to Forgot Password page
  }
}
