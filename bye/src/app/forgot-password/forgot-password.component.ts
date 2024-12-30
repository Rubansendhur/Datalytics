import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  email: string = '';
  otp: string = '';
  newPassword: string = '';
  isOtpSent: boolean = false;
  isOtpVerified: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  // Function to send OTP
  sendOtp() {
    const apiUrl = 'http://localhost:5000/api/forgot-password';
    this.http.post<{ message: string }>(apiUrl, { email: this.email }).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.errorMessage = '';
        this.isOtpSent = true; // Show OTP input after sending OTP
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to send OTP';
        this.successMessage = '';
      }
    });
  }

  // Function to verify OTP
  verifyOtp() {
    const apiUrl = 'http://localhost:5000/api/verify-otp';
    this.http.post<{ message: string }>(apiUrl, { email: this.email, otp: this.otp }).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.errorMessage = '';
        this.isOtpVerified = true; // Show password input after OTP verification
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to verify OTP';
        this.successMessage = '';
      }
    });
  }

  // Function to reset the password
  resetPassword() {
    const apiUrl = 'http://localhost:5000/api/reset-password';
    this.http.post<{ message: string }>(apiUrl, { email: this.email, newPassword: this.newPassword }).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.errorMessage = '';
        this.router.navigate(['/login']); // Navigate to the login page after successful password reset
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to reset password';
        this.successMessage = '';
      }
    });
  }
}
