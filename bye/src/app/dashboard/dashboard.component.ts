import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router'; // Import Router

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  
  imports: [CommonModule, FormsModule, HttpClientModule],
})
export class DashboardComponent {
  title = 'Dashboard';
  description = 'Welcome to the dashboard!';

  constructor(private http: HttpClient, private router: Router) {} // Inject Router

  // Define the navigateToSignup method properly
  navigateToSignup(): void {
    this.router.navigate(['/signup']);
  }
  navigateTouser(): void {
    this.router.navigate(['/UserComponent']);
  }
  navigateToevent(): void {
    this.router.navigate(['/EventComponent']);
  }
  navigateToinsevent(): void {
    this.router.navigate(['/InsertEventComponent']);
  }
  navigateTocontact(): void {
    this.router.navigate(['/UserRoleFetchComponent']);
  }
  navigateTogallery():void{
    this.router.navigate(['/gallery']); 
  }
}
