import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http'; // Import HttpClient

// Event interface
export interface Event {
  _id: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  description: string;
  imageBase64: string;  // Since the image is returned as a base64 string
}

// Define the structure of the expected API response
interface EventApiResponse {
  events: Event[];
}

// Define the UserRole interface instead of TeamMember
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  image_url: string;
  createdAt: string;
}
interface Role {
  roleName: string;
  rank: number;
}
interface HiddenYear {
  year: string;
  hidden: boolean;
}

interface UserRoleApiResponse {
  userRoles: User[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {
  events: any[] = [];  // Events data
  team: User[] = [];  // UserRoles data for displaying as team members
  //errorMessage: string | null = null;
  // Array to store fetched events
  filteredEvents: any[] = []; // Array to store filtered events
  selectedEvent: any = null; // Store the currently selected event for editing
  yearRanges: string[] = [];
  selectedYearRange: string = '';
  recentYearRange: string = '';
  users: User[] = [];
  roles: Role[] = [];
  errorMessage?: string;
  categorizedUsers: { [year: string]: { hidden: boolean } } = {}; // Track visibility for each year range
  currentSlide: number = 0;  // Track the current slide
  sliderInterval: any;  // Store the setInterval reference
  sliderTransform: string = 'translateX(0)';  // To apply the translateX style for the slider

  eventsLoaded: boolean = false; // Track whether events have been loaded
  selectedYear: string = ''; // Selected year from the dropdown
  years: number[] = [];
  loading: boolean = true; // Set this to true/false based on your application's logic


  contactForm = {
    name: '',
    email: '',
    message: ''
  };

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    setTimeout(() => {
      this.loading = false; // Set loading to false after initialization
    }, 5000);
    
    this.fetchEvents();  // Fetch events when the component is initialized
    this.fetchTeam(); 
    this.fetchEvents();  
    this.startAutomaticSlide();  // Fetch userRoles when the component is initialized
  }
cardWidth: number = 15;
ngOnDestroy(): void {
  if (this.sliderInterval) {
    clearInterval(this.sliderInterval);  // Clear the interval when the component is destroyed
  }
} // Each card's width + margin (adjust accordingly)
startAutomaticSlide(): void {
  this.sliderInterval = setInterval(() => {
    this.nextSlide();  // Move to the next slide every 3 seconds
  }, 5000);  // Adjust the interval as needed
}

// Stop the automatic movement when the user clicks the previous/next button
stopAutomaticSlide(): void {
  if (this.sliderInterval) {
    clearInterval(this.sliderInterval);  // Clear the interval
    this.sliderInterval = null;
  }
}

// Move to the previous slide with looping
prevSlide(): void {
  this.stopAutomaticSlide();  // Stop automatic movement when user clicks manually
  this.currentSlide = (this.currentSlide === 0) ? this.team.length - 1 : this.currentSlide - 1;
  this.updateSliderTransform();
}

// Move to the next slide with looping (wraps around to first slide after last)
nextSlide(): void {
  this.stopAutomaticSlide();  // Stop automatic movement when user clicks manually
  if (this.currentSlide === this.team.length - 1) {
    this.currentSlide = 0;  // If we are at the last slide, start from the first
  } else {
    this.currentSlide++;
  }
  this.updateSliderTransform();
}

// Update the slider transform to move the slides
updateSliderTransform(): void {
  const slideWidth = 100 / this.team.length;  // Width of each slide in percentage
  this.sliderTransform = `translateX(-${this.currentSlide * slideWidth}%)`;
}


fetchRoles(): void {
  const apiUrl = 'http://localhost:5000/api/getRoles';
  this.http.get<{ message: string; roles: Role[] }>(apiUrl).subscribe({
    next: (data) => {
      this.roles = data.roles.sort((a, b) => a.rank - b.rank); // Sort roles by rank
      console.log('Roles fetched and sorted by rank:', this.roles);
    },
    error: (error) => {
      console.error('Failed to fetch roles:', error);
    }
  });
}
sortUsersByRoleRank(users: User[]): User[] {
  if (!this.roles || this.roles.length === 0) {
    return users; // If roles are not fetched, return users unsorted
  }

  return users.sort((a, b) => {
    const rankA = this.roles.find(role => role.roleName === a.role)?.rank || Infinity;
    const rankB = this.roles.find(role => role.roleName === b.role)?.rank || Infinity;
    return rankA - rankB; // Sort by rank (lower rank first)
  });
}
fetchYearRanges(): void {
  const apiUrl = 'http://localhost:5000/api/yearRanges';
  this.http.get<{ message: string; yearRanges: string[] }>(apiUrl).subscribe({
    next: (data) => {
      this.yearRanges = data.yearRanges;
      this.sortYearRanges(); // Sort to identify the most recent year
      this.selectRecentYearRange(); // Set the recent year range by default
      this.errorMessage = undefined;
    },
    error: (error) => {
      this.errorMessage = 'Failed to fetch year ranges';
      console.error('Error fetching year ranges:', error);
    }
  });
}

fetchHiddenYears(): void {
  const apiUrl = 'http://localhost:5000/api/userRoles/hiddenYears';
  this.http.get<HiddenYear[]>(apiUrl).subscribe({
    next: (hiddenYears) => {
      hiddenYears.forEach(hiddenYear => {
        this.categorizedUsers[hiddenYear.year] = { hidden: hiddenYear.hidden };
      });
    },
    error: (error) => {
      console.error('Error fetching hidden years:', error);
    }
  });
}

sortYearRanges(): void {
  this.yearRanges.sort((a, b) => {
    const [startA, endA] = a.split('-').map(Number);
    const [startB, endB] = b.split('-').map(Number);

    if (endA !== endB) {
      return endB - endA; // Sort by ending year
    }
    return startB - startA; // Sort by starting year if ending years are the same
  });
}

selectRecentYearRange(): void {
  if (this.yearRanges.length > 0) {
    this.recentYearRange = this.yearRanges[0]; // The first year in the sorted array is the most recent
    this.selectedYearRange = this.recentYearRange;
    this.onYearRangeChange(); // Fetch users for the recent year
  }
}

onYearRangeChange(): void {
  if (!this.selectedYearRange) {
    this.users = [];
    this.errorMessage = 'Please select a year range';
    return;
  }

  const apiUrl = `http://localhost:5000/api/userRoles1?createdAt=${this.selectedYearRange}`;
  this.http.get<{ message: string; users: User[] }>(apiUrl).subscribe({
    next: (data) => {
      this.users = this.sortUsersByRoleRank(data.users);
      this.errorMessage = undefined;
      if (!this.categorizedUsers[this.selectedYearRange]) {
        this.categorizedUsers[this.selectedYearRange] = { hidden: false };
      }
    },
    error: (error) => {
      this.users = [];
      this.errorMessage = `Failed to fetch users for the year range: ${this.selectedYearRange}`;
      console.error('Error fetching users:', error);
    }
  });
}




navigateToUserDetail(userId: string): void {
  this.router.navigate([`/user-detail/${userId}`]); // Correctly interpolate userId
}
viewEventDetails(eventId: string): void {
  console.log('Navigating to event details for eventId:', eventId); // Log to check if the method is triggered
  this.router.navigate([`/event-details`, eventId]);
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
  trackByEventId(index: number, event: any): string {
    return event._id; // Use '_id' as the unique identifier for tracking
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

  fetchTeam(): void {
    const yearRangesApiUrl = 'http://localhost:5000/api/yearRanges'; // API to fetch year ranges
    const teamApiUrl = 'http://localhost:5000/api/userRoles'; // API to fetch user roles
  
    // Step 1: Fetch year ranges
    this.http.get<{ message: string; yearRanges: string[] }>(yearRangesApiUrl).subscribe({
      next: (data) => {
        this.yearRanges = data.yearRanges;
        this.sortYearRanges(); // Sort the year ranges to determine the most recent year
        this.selectRecentYearRange(); // Automatically set the recent year range
  
        // Step 2: Set cardWidth dynamically based on the length of the recentYearRange
        this.cardWidth = this.recentYearRange ? this.recentYearRange.length * 10 : 15; // Example: each character adds 10px
  
        // Step 3: Fetch team based on the createdAt field
        if (this.recentYearRange) {
          const [startYear, endYear] = this.recentYearRange.split('-').map(Number); // Extract start and end year from the range
          const teamApiWithYear = `${teamApiUrl}?createdAtFrom=${startYear}&createdAtTo=${endYear}`;
          this.http.get<UserRoleApiResponse>(teamApiWithYear).subscribe({
            next: (response) => {
              if (response && Array.isArray(response.userRoles)) {
                // Filter and sort the team based on the `createdAt` year range
                this.team = response.userRoles.filter(user => {
                  const [userStartYear, userEndYear] = user.createdAt.split('-').map(Number); // Parse user's `createdAt` range
                  return (
                    userStartYear >= startYear && userEndYear <= endYear
                  );
                });
                this.team = this.sortUsersByRoleRank(this.team); // Sort team members by role rank
                console.log(`Fetched team members for createdAt range: ${startYear} to ${endYear}`, this.team);
              } else {
                console.error('Unexpected response format:', response);
              }
            },
            error: (error) => {
              this.errorMessage = 'Failed to load team members. Please try again later.';
              console.error(`Error fetching team members for createdAt range: ${startYear} to ${endYear}:`, error);
            }
          });
        } else {
          console.error('Recent year range is not set. Cannot fetch team members.');
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to fetch year ranges.';
        console.error('Error fetching year ranges:', error);
      }
    });
  }
  
  navigateTocontactus(): void {
    this.router.navigate(['/Contactus']); // Navigate to the contact us route
  }
  navigateToaboutus(): void {
    this.router.navigate(['/Aboutus']); // Navigate to the about us route
  }
  
  onJoinUs(): void {
    this.router.navigate(['/events']);
  }

  navigateToEvents(): void {
    this.router.navigate(['/events']);
  }

  navigateToAboutUs(): void {
    this.router.navigate(['/about-us']);
  }

  navigateToContactUs(): void {
    this.router.navigate(['/contact-us']);
  }

  onSubmitContactForm(): void {
    console.log('Contact Form Submitted', this.contactForm);
    this.contactForm = {
      name: '',
      email: '',
      message: ''
    };
  }

  goToEventsPage(): void {
    this.router.navigate(['/Events']);
  }

  goToMembersPage(): void {
    this.router.navigate(['/Contact']);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/']);
  }
}