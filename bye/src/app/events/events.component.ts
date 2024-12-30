import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css'],
})
export class EventsComponent implements OnInit {
  events: any[] = []; // Array to store fetched events
  filteredEvents: any[] = []; // Array to store filtered events
  selectedEvent: any = null; // Store the currently selected event for editing
  errorMessage: string = '';
  eventsLoaded: boolean = false; // Track whether events have been loaded
  selectedYear: string = ''; // Selected year from the dropdown
  years: number[] = []; // Array to store available years

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.fetchEvents(); // Fetch events when the component is initialized
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

  // New method to download events by selected year
 
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

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  downloadExcel(): void {
    const formattedEvents = this.events.map(event => ({
      'Event Name': event.event_name,
      Description: event.description,
      'Event Time': new Date(event.event_time).toLocaleString(),
      Location: event.event_location,
      'Image URL': event.image_url || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedEvents);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Events');

    XLSX.writeFile(workbook, 'Events_List.xlsx');
  }
  downloadEventsByYear(year: string): void {
    // Filter events for the selected year
    const eventsForYear = this.events.filter(event => new Date(event.event_time).getFullYear().toString() === year);
  
    const formattedEvents = eventsForYear.map(event => ({
      'Event Name': event.event_name,
      Description: event.description,
      'Event Time': new Date(event.event_time).toLocaleString(),
      Location: event.event_location,
      'Image URL': event.image_url || ''
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(formattedEvents);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Events');
  
    // Download the file with the selected year in the name
    XLSX.writeFile(workbook, `Events_List_${year}.xlsx`);
  }
  viewEventDetails(eventId: string): void {
    console.log('Event ID:', eventId); // Check if the ID is being passed correctly
    // Navigate to a new route or show the details (custom logic)
    this.router.navigate(['/event-details', eventId]); // Example for routing
  }
  
}
