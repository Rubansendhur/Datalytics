import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';

export interface User {
  id: string;
  username: string;
  email?: string;
  createdAt?: Date;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HttpClientModule, ReactiveFormsModule],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
})
export class UserComponent implements OnInit {
  //rolesAndRanks: { roleName: string; rank: number }[] = [];
  users: User[] = [];
  userRoles: string[] = [];
  departments: string[] = [];
  uploadForm: FormGroup;
  imageFile: File | null = null;
  errorMessage: string | undefined;
  isAddingNewRole = false;
  isAddingNewDepartment = false;
  hiddenYears: string[] = [];
  rolesWithRank: { roleName: string, rank: number }[] = [];  // Stores both role and rank


  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.uploadForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      department: ['', Validators.required],
      linkedinlink: ['', Validators.required],
      newRole: [''],
      rank: [''], // Add rank field
      newDepartment: [''],
      image: [null, Validators.required],
      createdAt: ['', Validators.required],
      
    });
  }

  ngOnInit(): void {
    this.fetchUsers();
    this.fetchUserRoles();
    this.fetchHiddenYears();
    this.fetchRolesAndRanks(); 
  }

  
  fetchUsers(): void {
    const apiUrl = 'http://localhost:5000/api/users';
    this.http.get<{ message: string; users: User[] }>(apiUrl).subscribe({
      next: (data) => {
        this.users = data.users.map((user) => ({
          ...user,
          year: user.createdAt ? new Date(user.createdAt).getFullYear() : null,
        }));
        this.errorMessage = undefined;
      },
      error: (error) => {
        this.errorMessage = 'Failed to fetch users';
        console.error('Error fetching users:', error);
      },
    });
  }

  fetchUserRoles(): void {
    const rolesUrl = 'http://localhost:5000/api/userRoles';
    this.http.get<{ message: string; userRoles: any[] }>(rolesUrl).subscribe({
      next: (data) => {
        const uniqueRoles = Array.from(new Set(data.userRoles.map((role) => role.role)));
        this.userRoles = uniqueRoles;

        const uniqueDepartments = Array.from(new Set(data.userRoles.map((user) => user.department)));
        this.departments = uniqueDepartments;

        this.errorMessage = undefined;
      },
      error: (error) => {
        this.errorMessage = 'Failed to fetch user roles';
        console.error('Error fetching user roles:', error);
      },
    });
  }

  fetchHiddenYears(): void {
    const hiddenYearsUrl = 'http://localhost:5000/api/userRoles/hiddenYears';
    this.http.get<{ year: string; hidden: boolean }[]>(hiddenYearsUrl).subscribe({
      next: (data) => {
        this.hiddenYears = data.filter((year) => year.hidden).map((year) => year.year);
      },
      error: (error) => {
        this.errorMessage = 'Failed to fetch hidden years';
        console.error('Error fetching hidden years:', error);
      },
    });
  }

  deleteUser(userId: string): void {
    const deleteUrl = `http://localhost:5000/api/users/${userId}`;
    this.http.delete<{ message: string }>(deleteUrl).subscribe({
      next: () => {
        this.fetchUsers();
      },
      error: (error) => {
        this.errorMessage = 'Failed to delete user';
        console.error('Error deleting user:', error);
      }
    });
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imageFile = input.files[0];
      this.uploadForm.patchValue({ image: this.imageFile });
      this.uploadForm.get('image')?.updateValueAndValidity();
    } else {
      this.imageFile = null;
      this.uploadForm.patchValue({ image: null });
      this.uploadForm.get('image')?.updateValueAndValidity();
    }
  }

  toggleAddNewRole(): void {
    this.isAddingNewRole = !this.isAddingNewRole;

    if (this.isAddingNewRole) {
      this.uploadForm.get('role')?.clearValidators();
      this.uploadForm.get('newRole')?.setValidators(Validators.required);
      this.uploadForm.get('rank')?.setValidators(Validators.required); // Make rank required
    } else {
      this.uploadForm.get('role')?.setValidators(Validators.required);
      this.uploadForm.get('newRole')?.clearValidators();
      this.uploadForm.get('rank')?.clearValidators(); // Clear rank validators
      this.uploadForm.patchValue({ newRole: '', rank: '' }); // Reset values
    }
    this.uploadForm.get('role')?.updateValueAndValidity();
    this.uploadForm.get('newRole')?.updateValueAndValidity();
    this.uploadForm.get('rank')?.updateValueAndValidity();
  }

  toggleAddNewDepartment(): void {
    this.isAddingNewDepartment = !this.isAddingNewDepartment;
    if (this.isAddingNewDepartment) {
      this.uploadForm.get('department')?.clearValidators();
    } else {
      this.uploadForm.get('department')?.setValidators(Validators.required);
    }
    this.uploadForm.get('department')?.updateValueAndValidity();
  }
  fetchRolesAndRanks(): void {
    const apiUrl = 'http://localhost:5000/api/getRoles'; // API endpoint to fetch roles and ranks
    this.http
      .get<{ message: string; roles: { roleName: string; rank: number }[] }>(apiUrl)
      .subscribe({
        next: (data) => {
          // Logging fetched data for debugging
          console.log('Fetched roles and ranks:', data.roles);
  
          // Ensure roles are unique and mapped correctly
          this.userRoles = Array.from(new Set(data.roles.map((role) => role.roleName))); // Extract unique roles
          this.rolesWithRank = data.roles; // Contains both role and rank information
  
          this.errorMessage = undefined; // Clear any previous errors
        },
        error: (error) => {
          // Handle errors gracefully
          this.errorMessage = 'Failed to fetch roles and ranks';
          console.error('Error fetching roles and ranks:', error);
        },
      });
  }
  
  

  onSubmit() {
    const selectedYear = this.uploadForm.get('createdAt')?.value;
  
    if (this.hiddenYears.includes(selectedYear)) {
      alert('This year is closed permanently, you cannot insert a user for this year.');
      return;
    }
  
    if (this.uploadForm.valid && this.imageFile) {
      const formData = new FormData();
      formData.append('name', this.uploadForm.get('name')?.value);
      formData.append('email', this.uploadForm.get('email')?.value);
  
      if (this.isAddingNewRole) {
        const newRole = this.uploadForm.get('newRole')?.value;
        const rank = this.uploadForm.get('rank')?.value;
  
        // Check if the role and rank combination already exists
        const existingRoleWithRank = this.rolesWithRank.find(
          (role) => role.roleName === newRole || role.rank === rank
        );
  
        if (existingRoleWithRank) {
          // If the role with the same rank already exists, show a message and prevent submission
          this.errorMessage = 'The rank already exists for this role.';
          console.log('Rank already exists for this role');
          return; // Stop the form submission
        }
  
        // If no such combination exists, proceed to insert new role and rank
        formData.append('role', newRole);
        formData.append('rank', rank); // Append rank
  
        // Insert new role and rank into /api/addNewRole
        const roleData = { role: newRole, rank: rank };
        this.http.post('http://localhost:5000/api/addNewRole', roleData).subscribe({
          next: () => console.log('New role added successfully'),
          error: (err) => console.error('Failed to add new role:', err),
        });
      } else {
        formData.append('role', this.uploadForm.get('role')?.value);
      }
  
      formData.append('linkedinlink', this.uploadForm.get('linkedinlink')?.value);
      formData.append('department', this.uploadForm.get('department')?.value);
      formData.append('createdAt', selectedYear);
      formData.append('image', this.imageFile, this.imageFile.name);
  
      // Upload data to /upload1 endpoint
      this.http.post('http://localhost:5000/upload1', formData).subscribe({
        next: () => {
          this.uploadForm.reset();
          this.imageFile = null;
          this.fetchUsers(); // Refresh the list of users
        },
        error: (err) => console.error('Upload failed:', err),
      });
    }
  }
  
  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
