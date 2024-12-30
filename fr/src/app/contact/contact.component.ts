import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormGroup, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule]
})
export class ContactComponent {
  contactForm: FormGroup;
  statusMessage: string = '';
  isLoading: boolean = false;  
  // Track the loading state
  // Declare statusMessage

  constructor(private http: HttpClient) {
    this.contactForm = new FormGroup({
      name: new FormControl(''),
      email: new FormControl(''),
      message: new FormControl('')
    });
  }

  async onSubmit() {
    if (this.contactForm.valid) {
      this.http.post<any>('http://localhost:5000/send', this.contactForm.value)
        .subscribe(
          (response) => {
            console.log('Success Response:', response);
            this.statusMessage = 'Email sent successfully!';
            this.contactForm.reset();  // Clear the form fields
          },
          (error) => {
            console.error('Error Response:', error);
            this.statusMessage = `Failed to send email. Error: ${error.message || error}`;
          }
        );
    } else {
      console.error('Form is invalid', this.contactForm);
      this.statusMessage = 'Please fill in all fields correctly.';
    }
  }
}
