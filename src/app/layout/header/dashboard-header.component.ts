import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-header',
  templateUrl: './dashboard-header.component.html',
  styleUrls: ['./dashboard-header.component.css']
})
export class DashboardHeaderComponent implements OnInit {
  userName: string = '';
  dropdownOpen: boolean = false;
  confirmingLogout: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.userName = localStorage.getItem('userName') ?? localStorage.getItem('userEmail') ?? '';
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
