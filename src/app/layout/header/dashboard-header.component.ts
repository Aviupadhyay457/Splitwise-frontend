import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard-header',
  templateUrl: './dashboard-header.component.html',
  styleUrls: ['./dashboard-header.component.css']
})
export class DashboardHeaderComponent implements OnInit {
  userName: string = '';
  dropdownOpen: boolean = false;
  confirmingLogout: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<any>(`${environment.apiBaseUrl}/users/me`, { headers }).subscribe({
      next: (res) => {
        this.userName = `${res.data.firstName} ${res.data.lastName}`;
      }
    });
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
    this.confirmingLogout = false;
  }

  closeAll(): void {
    this.dropdownOpen = false;
    this.confirmingLogout = false;
  }

  navigateAccount(): void {
    this.closeAll();
    this.router.navigate(['/dashboard/account']);
  }

  requestLogout(): void {
    this.confirmingLogout = true;
  }

  cancelLogout(): void {
    this.confirmingLogout = false;
  }

  confirmLogout(): void {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}
