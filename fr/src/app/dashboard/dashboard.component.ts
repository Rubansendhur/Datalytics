import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router'; // Import Router

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  constructor(private http: HttpClient, private router: Router) {} // Inject HttpClient and Router
  navigateToevents(): void {
    this.router.navigate(['/Events']); // Navigate to the dashboard route
  }
  navigateToaboutus(): void {
    this.router.navigate(['/Aboutus']); // Navigate to the dashboard route
  }
  navigateTocontactus(): void {
    this.router.navigate(['/Contact']); // Navigate to the dashboard route
  }
}
