import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.css'],
})
export class EventDetailsComponent implements OnInit {
  event: any = null;
  eventId: string | null = null;
  errorMessage: string = '';
  loading: boolean = true; // Set this to true/false based on your application's logic


  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.loading = false; // Set loading to false after initialization
    }, 5000);
    this.eventId = this.route.snapshot.paramMap.get('id');
    if (this.eventId) {
      this.fetchEventDetails(this.eventId);
    } else {
      this.errorMessage = 'Invalid event ID. Please try again.';
    }
  }

  fetchEventDetails(eventId: string): void {
    const apiUrl = `http://localhost:5000/api/events/${eventId}`;
    this.http.get<any>(apiUrl).subscribe(
      (response) => {
        if (response) {
          this.event = response;
        } else {
          this.errorMessage = 'Event not found. Please try again.';
        }
      },
      (error) => {
        this.errorMessage = 'Failed to load event details. Please try again later.';
      }
    );
  }

  formatEventCoordinator(coordinatorText: string): string[] {
    // Regex pattern to match "and", "the", "it" as whole words
    const pattern = /\b(and|&)\b/g;

    // Split the text and filter out unwanted words
    return coordinatorText
      .split(pattern) // Split the string by "and", "the", "it"
      .map((segment) => segment.trim()) // Trim whitespace
      .filter((line) => line && !pattern.test(line)); // Remove empty and unwanted words
  }
}
