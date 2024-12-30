import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [CommonModule, FormsModule, HttpClientModule],
})
export class AppComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  otp: string = '';
  otpSent: boolean = false;
  otpError: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  // Send OTP to email
  onSignup(form: any) {
    if (form.valid) {
      const signupData = { email: this.email };

      this.http.post('http://localhost:5000/api/signup1', signupData).subscribe({
        next: (response: any) => {
          console.log('OTP sent successfully:', response);
          this.otpSent = true;
        },
        error: (error) => {
          console.error('Error during signup:', error);
          this.errorMessage = 'Failed to send OTP. Please try again.';
        },
      });
    } else {
      console.error('Form is invalid');
    }
  }

  // Verify OTP and complete signup
  onVerifyOtp() {
    const otpData = {
      email: this.email,
      otp: this.otp,
      username: this.username,
      password: this.password,
    };
  
    this.http.post('http://localhost:5000/api/verifyOtp', otpData).subscribe({
      next: (response: any) => {
        console.log('OTP verified successfully:', response);
        this.successMessage = response.message; // Display success message
        this.router.navigate(['/dashboard']); // Redirect on success
      },
      error: (error) => {
        console.error('Error verifying OTP:', error);
        this.otpError = true;
        this.errorMessage = error.error.message || 'Invalid or expired OTP. Please try again.';
      },
    });
  }
  
  }
