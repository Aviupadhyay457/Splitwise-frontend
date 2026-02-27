import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.component.html',
  styleUrls: ['./create-group.component.css']
})
export class CreateGroupComponent {

  newGroup = {
    groupName: '',
    description: ''
  };

  private readonly apiUrl = 'https://localhost:7032/api/groups';

  // Temporary token
  private readonly token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjEiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9lbWFpbGFkZHJlc3MiOiJrcmlzaG5hQGdtYWlsLmNvbSIsImV4cCI6MTc3MjIwMDU1MiwiaXNzIjoiU3BsaXR3aXNlQVBJIiwiYXVkIjoiU3BsaXR3aXNlQVBJVXNlcnMifQ.rXLfQ9iC160LL3OctDdO2rtS6668eOnmi69rZNBDak4';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  createGroup(): void {

    if (!this.newGroup.groupName.trim()) {
      alert('Group name is required');
      return;
    }

    // ❌ Removed Content-Type header
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });

    this.http.post<any>(this.apiUrl, this.newGroup, { headers })
      .subscribe({
        next: (response) => {

          if (response && response.success === true) {

            alert('Group created successfully');

            // Navigate only after success
            this.router.navigate(['/group']);

          } else {
            alert(response?.message || 'Failed to create group');
          }

        },
        error: (error) => {

          console.error('Full Error:', error);

          if (error.status === 401) {
            alert('Unauthorized – Token rejected by server');
          } else {
            alert(error?.error?.message || 'Server error occurred');
          }

        }
      });
  }

  cancel(): void {
    this.router.navigate(['/group']);
  }
}