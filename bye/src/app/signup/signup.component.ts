import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  imports: [FormsModule, CommonModule, HttpClientModule] // Include HttpClientModule
})
export class SignupComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  submittedData: { username: string; email: string; password: string } | null = null; // To store submitted data
  
  constructor(private http: HttpClient, private router: Router) {} // Inject HttpClient and Router

  navigateToLogin() {
    this.router.navigate(['/login']); // Use the router to navigate to login
  }
  onSignup(signupForm: any) {
    console.log('hi');
    if (signupForm.valid) {
      // Store submitted data
      this.submittedData = {
        username: this.username,
        email: this.email,
        password: this.password,
      };

      // Print submitted data in console
      console.log('Submitted Data:', this.submittedData);

      // Send data to the backend
      this.http.post('http://localhost:5000/api/signup', this.submittedData)
        .subscribe({
          next: (response) => {
            console.log('Response from server:', response); // Log response from server
            // Optionally reset the form here if needed
            signupForm.reset();
          },
          error: (error) => {
            console.error('Error occurred while signing up:', error); // Log error
          }
        });
    } else {
      console.error('Form is invalid');
    }
  }
}
