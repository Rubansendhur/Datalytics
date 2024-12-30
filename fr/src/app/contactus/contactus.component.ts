import { Component, OnInit } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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

@Component({
  selector: 'app-user-role-fetch',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './contactus.component.html',
  styleUrls: ['./contactus.component.css']
})
export class ContactusComponent implements OnInit {
  yearRanges: string[] = [];
  selectedYearRange: string = '';
  recentYearRange: string = '';
  users: User[] = [];
  roles: Role[] = [];
  loading: boolean = true;
  errorMessage?: string;
  categorizedUsers: { [year: string]: { hidden: boolean } } = {}; // Track visibility for each year range

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.loading = false; // Set loading to false after initialization
    }, 5000);
    this.fetchYearRanges();
    this.fetchRoles();
    this.fetchHiddenYears(); // Fetch hidden year visibility state when the component loads
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

  

  closeYearView(year: string): void {
    if (this.categorizedUsers[year]) {
      this.categorizedUsers[year].hidden = true; // Set hidden to true
      this.updateYearHiddenState(year, true); // Save state to MongoDB
    }
  }
  navigateToUserDetail(userId: string): void {
    this.router.navigate([`/user-detail/${userId}`]); // Correctly interpolate userId
  }
  
  
  updateYearHiddenState(year: string, hidden: boolean): void {
    const url = `http://localhost:5000/api/userRoles/hideYear`; // Backend endpoint
    this.http.post<{ message: string }>(url, { year, hidden }).subscribe({
      next: () => console.log('Year visibility updated successfully in MongoDB'),
      error: (error) => console.error('Error updating year visibility:', error)
    });
  }

 
  

 
}
