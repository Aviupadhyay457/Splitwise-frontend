import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

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

  private readonly apiUrl = `${environment.apiBaseUrl}/groups`;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  createGroup(): void {

    if (!this.newGroup.groupName.trim()) {
      alert('Group name is required');
      return;
    }

    const token = localStorage.getItem('token') ?? '';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.post<any>(this.apiUrl, this.newGroup, { headers })
      .subscribe({
        next: (response) => {

          if (response && response.success === true) {

            alert('Group created successfully');
            this.router.navigate(['/dashboard/groups']);

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
    this.router.navigate(['/dashboard/groups']);
  }
}
