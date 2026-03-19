import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent implements OnInit {

  groups: any[] = [];

  private readonly apiUrl = `${environment.apiBaseUrl}/groups`;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getGroups();
  }

  getGroups(): void {
    const token = localStorage.getItem('token') ?? '';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
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
  

  deleteGroup(id: number) {

  if (!confirm('Are you sure you want to delete this group?')) {
    return;
  }

  const token = localStorage.getItem('token');
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  this.http.delete<any>(`${this.apiUrl}/${id}`, { headers })
    .subscribe({
      next: (res) => {
        if (res.success) {
          alert(res.message);
          this.getGroups();
        }
      },
      error: () => {
        alert('Delete failed');
      }
    });
}
}
