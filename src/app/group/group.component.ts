import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent implements OnInit {

  groups: any[] = [];

  private readonly apiUrl = 'https://localhost:7032/api/groups';
  private readonly token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjEiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9lbWFpbGFkZHJlc3MiOiJrcmlzaG5hQGdtYWlsLmNvbSIsImV4cCI6MTc3MjIwMDU1MiwiaXNzIjoiU3BsaXR3aXNlQVBJIiwiYXVkIjoiU3BsaXR3aXNlQVBJVXNlcnMifQ.rXLfQ9iC160LL3OctDdO2rtS6668eOnmi69rZNBDak4';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getGroups();
  }

  getGroups(): void {

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });

    this.http.get<any>(this.apiUrl, { headers })
      .subscribe({
        next: (response) => {

          if (response.success) {
            this.groups = response.data;
          } else {
            console.error('API Error:', response.message);
            alert(response.message);
          }

        },
        error: (error) => {
          console.error('HTTP Error:', error);
          alert('Unable to load groups.');
        }
      });
  }
}