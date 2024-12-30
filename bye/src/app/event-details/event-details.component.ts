import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';  // <-- Import FormsModule

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, HttpClientModule,FormsModule],
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.css'],
})
export class EventDetailsComponent implements OnInit {
  event: any = null; // Object to store event details
  eventId: string | null = null; // Store event ID from the URL
  errorMessage: string = ''; // Error message if fetching fails

  constructor(private route: ActivatedRoute, private http: HttpClient) {}
  events: any[] = []; // Array to store fetched events
  filteredEvents: any[] = []; // Array to store filtered events
  selectedEvent: any = null; // Store the currently selected event for editing
 
  eventsLoaded: boolean = false; // Track whether events have been loaded
  selectedYear: string = ''; // Selected year from the dropdown
  years: number[] = []; // Array to store available years


  ngOnInit(): void {
    // Get the event ID from the route parameters
    this.eventId = this.route.snapshot.paramMap.get('id');
    console.log('Event ID:', this.eventId);

    if (this.eventId) {
      // Fetch event details using the event ID
      this.fetchEventDetails(this.eventId);
    } else {
      this.errorMessage = 'Invalid event ID. Please try again.';
    }
  }

  fetchEventDetails(eventId: string): void {
    const apiUrl = `http://localhost:5000/api/events/${eventId}`;
    console.log('Fetching event details from:', apiUrl);
  
    this.http.get<any>(apiUrl).subscribe(
      (response) => {
        if (response) {
          this.event = response; // Directly assign the response to `this.event`
          console.log('Fetched event:', this.event);
        } else {
          this.errorMessage = 'Event not found. Please try again.';
          console.error('Event not found in response:', response);
        }
      },
      (error) => {
        console.error('Error fetching event details:', error);
        this.errorMessage = 'Failed to load event details. Please try again later.';
      }
    );
  }
  filterEventsByYear(): void {
    if (this.selectedYear) {
      // Filter events by selected year
      this.filteredEvents = this.events.filter(event => {
        return new Date(event.event_time).getFullYear().toString() === this.selectedYear;
      });
    } else {
      // Show all events if no year is selected (All Years)
      this.filteredEvents = [...this.events];
    }
  }
  deleteEvent(eventId: string): void {
    const apiUrl = `http://localhost:5000/api/events/${eventId}`;

    this.http.delete(apiUrl).subscribe({
      next: (response: any) => {
        console.log('Event deleted successfully:', response);
        this.events = this.events.filter(event => event._id !== eventId);
        this.filterEventsByYear(); // Refresh filtered events
      },
      error: (error) => {
        console.error('Error deleting event:', error);
        this.errorMessage = 'Failed to delete the event. Please try again later.';
      }
    });
  }

  editEvent(eventId: string): void {
    const apiUrl = `http://localhost:5000/api/events/${eventId}`;
    this.http.get(apiUrl)
      .subscribe(
        (response) => {
          console.log('Fetched event details for editing:', response);
          this.selectedEvent = { ...response };
        },
        (error) => {
          console.error('Error fetching event details:', error);
        }
      );
  }
  formatEventCoordinator(coordinatorText: string | null | undefined): string[] {
    if (!coordinatorText) {
      return []; // Return an empty array if the text is null or undefined
    }
  
    return coordinatorText
      .replace(/\b(and|the)\b|&/g, '\n') // Replace "and", "the", and "&" with newline
      .split('\n') // Split by newlines
      .map((segment) => segment.trim()) // Trim extra whitespace
      .filter((line) => line); // Remove empty lines
  }
  

  updateEvent(): void {
    if (!this.selectedEvent) {
      console.error('No event selected for update');
      return;
    }

    const apiUrl = `http://localhost:5000/api/events/${this.selectedEvent._id}`;
    console.log('Updating event with ID:', this.selectedEvent._id, 'Data:', this.selectedEvent);

    this.http.put(apiUrl, this.selectedEvent).subscribe({
      next: (response: any) => {
        console.log('Event updated successfully:', response);
        const index = this.events.findIndex(event => event._id === this.selectedEvent._id);
        if (index !== -1) {
          this.events[index] = { ...response };
        }
        this.selectedEvent = null; // Reset the selected event
        this.filterEventsByYear(); // Refresh filtered events after update
      },
      error: (error) => {
        console.error('Error updating event:', error);
        this.errorMessage = 'Failed to update the event. Please try again later.';
      }
    });
  }

  trackByEventId(index: number, event: any): string {
    return event._id; // Use '_id' as the unique identifier for tracking
  }
  }
