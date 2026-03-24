import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-activities',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.css']
})
export class ActivityComponent implements OnInit {

  activities: any[] = [];

  private readonly apiUrl = `${environment.apiBaseUrl}/activities`;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadActivities();
  }

  getHeaders() {
    const token = localStorage.getItem('token') ?? '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  loadActivities() {
    console.log("Calling Activity API...");

    this.http.get<any>(this.apiUrl, {
      headers: this.getHeaders()
    })
    .subscribe({
      next: (res) => {
        console.log("Activity Response:", res);

        this.activities = Array.isArray(res.data)
          ? res.data
          : res.data ? [res.data] : [];
      },
      error: (err) => {
        console.error("Activity Error:", err);
      }
    });
  }

  /* ✅ COLOR CLASS HANDLER */
  getActivityClass(type: string): string {
    return type ? type.toLowerCase() : '';
  }

  /* ✅ SAFE DATE FORMATTER */
  formatDate(date: string): string {
    if (!date || date === '0001-01-01T00:00:00') {
      return 'No date';
    }
    return new Date(date).toLocaleString();
  }
}