import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router'; // Import Router
import * as XLSX from 'xlsx';
export interface User {
  id: string; // Unique ID
  username?: string; // Username can be optional
  email?: string; // Email can be optional
}

@Component({
  selector: 'app-aboutus',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './aboutus.component.html',
  styleUrl: './aboutus.component.css'
})
export class AboutusComponent {
  events: any[] = [];
  users: User[] = []; 
  imageUrls: string[] = [];// Array to hold user data
 errorMessage: string | undefined;
 currentPosition = 0;
 // Array to store fetched events
 filteredEvents: any[] = []; // Array to store filtered events
 selectedEvent: any = null; // Store the currently selected event for editing
 
 eventsLoaded: boolean = false; // Track whether events have been loaded
 selectedYear: string = ''; // Selected year from the dropdown
 years: number[] = []; // Array to store available years
// Variable to hold error messages
autoScrollInterval: any;
loading: boolean = true; // Set this to true/false based on your application's logic



  constructor(private http: HttpClient, private router: Router) {}
  
  ngOnInit(): void {
    setTimeout(() => {
      this.loading = false; // Set loading to false after initialization
    }, 5000);
    this.fetchUsers(); 
    this.fetchEvents();
    
    this.fetchImageUrls();// Fetch users when the component initializes
  }
  get totalEvents(): number {
    return this.events.length;
  }
  fetchEvents(): void {
    this.http.get<{ events: any[] }>('http://localhost:5000/api/events')
      .subscribe(
        (response) => {
          console.log('Fetched events :', response.events); // Log the fetched events
          this.events = response.events
            .map(event => ({
              _id: event._id,
              event_name: event.event_name,
              description: event.description,
              event_time: event.event_time,
              event_speaker:event.event_speaker,
              event_location: event.event_location,
              image_url: event.image_url
            }))
            .sort((a, b) => new Date(b.event_time).getTime() - new Date(a.event_time).getTime());

          this.eventsLoaded = true; // Mark events as loaded

          // Extract years from events and store in years array
          this.years = [...new Set(this.events.map(event => new Date(event.event_time).getFullYear()))];
          
          // Show all events initially
          this.filteredEvents = [...this.events];
        },
        (error) => {
          console.error('Error fetching events:', error);
          this.errorMessage = 'Failed to load events. Please try again later.';
          this.eventsLoaded = true; // Mark events as loaded even if there's an error
        }
      );
  }
  fetchUsers(): void {
    const apiUrl = 'http://localhost:5000/api/users'; // Replace with your actual API URL

    this.http.get<{ message: string; users: User[] }>(apiUrl).subscribe({
      next: (data) => {
        this.users = data.users; // Assign the fetched user data to the users array
        this.errorMessage = undefined; // Clear any previous error message
      },
      error: (error) => {
        this.errorMessage = 'Failed to fetch users'; // Set error message on failure
        console.error('Error fetching users:', error); // Log the error for debugging
      }
    });
  }
  
 // Inject HttpClient and Router
  navigateToDashboard(): void {
    this.router.navigate(['/Dashboard']); // Navigate to the dashboard route
  }
  fetchImageUrls(): void {
    // Make an HTTP GET request to the backend to fetch image URLs
    this.http.get<string[]>('http://localhost:5000/images').subscribe({
      next: (response: string[]) => {
        this.imageUrls = response; // Store the fetched URLs
        console.log('Image URLs fetched successfully:', this.imageUrls);
      },
      error: (err: any) => {
        console.error('Error fetching image URLs:', err);
        this.handleError(err); // Handle the error using a separate method
      },
      complete: () => {
        console.log('Image fetch operation completed');
      }
    });
  }
  
  // Optional: A method to handle errors gracefully
  private handleError(error: any): void {
    // Log the error
    console.error('An error occurred:', error);
  
    // Provide user feedback if necessary
    alert('Failed to load images. Please try again later.');
  }
  
moveGallery(direction: string): void {
  const galleryWidth = 320;  // Width of one image + margin
  const totalImages = this.imageUrls.length;

  if (direction === 'left' && this.currentPosition > 0) {
    this.currentPosition--;
  } else if (direction === 'right' && this.currentPosition < totalImages - 1) {
    this.currentPosition++;
  }

  const offset = -this.currentPosition * galleryWidth;  // Calculate the offset for scroll
  const galleryWrapper = document.querySelector('.gallery-wrapper') as HTMLElement;
  galleryWrapper.style.transform = `translateX(${offset}px)`;
}
downloadExcel(): void {
  const formattedEvents = this.events.map(event => ({
    'Event Name': event.event_name,
    Description: event.description,
    'Event Time': new Date(event.event_time).toLocaleString(),
    Location: event.event_location,
    'Event Co-ordinator': event.event_speaker,
   
    'Image URL': event.image_url || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedEvents);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Events');

  XLSX.writeFile(workbook, 'Events_List.xlsx');
}

}
