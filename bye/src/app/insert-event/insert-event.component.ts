import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HttpClientModule, ReactiveFormsModule],
  templateUrl: './insert-event.component.html',
  styleUrls: ['./insert-event.component.css']
})
export class InsertEventComponent {
  uploadForm: FormGroup;
  imageUrls: string[] = [];  // Array to store image URLs

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.uploadForm = this.fb.group({
      event_name: ['', Validators.required],
      description: ['', Validators.required],
      event_time: ['', Validators.required],
      event_speaker: ['', Validators.required],
      event_location: ['', Validators.required], // New field for event location
      image: [null]
    });
  }

  onFileSelect(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.uploadForm.get('image')?.setValue(file);
    }
  }
  ngOnInit() {
    // Fetch image URLs when the component initializes
    this.fetchImageUrls();
  }

  onSubmit() {
    const formData = new FormData();
    formData.append('event_name', this.uploadForm.get('event_name')?.value);
    formData.append('description', this.uploadForm.get('description')?.value);
    formData.append('event_time', this.uploadForm.get('event_time')?.value);
    
    formData.append('event_speaker', this.uploadForm.get('event_speaker')?.value);
    formData.append('event_location', this.uploadForm.get('event_location')?.value); // Add event location to form data

    if (this.uploadForm.get('image')?.value) {
      formData.append('image', this.uploadForm.get('image')?.value);
    }
    
    this.http.post('http://localhost:5000/upload', formData).subscribe({
      next: (response) => console.log('Upload successful', response),
      error: (error) => console.error('Error:', error),
    });
  }
  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
  fetchImageUrls(): void {
    // Make an HTTP GET request to the backend to fetch image URLs
    this.http.get<string[]>('http://localhost:5000/images').subscribe(
      (response) => {
        this.imageUrls = response; // Store the fetched URLs
      },
      (error) => {
        console.error('Error fetching image URLs:', error);
      }
    );
}
}
