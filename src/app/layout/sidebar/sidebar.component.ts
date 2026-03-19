import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  userName: string = '';
  userEmail: string = '';
  confirmingLogout: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.userName = localStorage.getItem('userName') ?? '';
    this.userEmail = localStorage.getItem('userEmail') ?? '';
  }

  getUserInitials(): string {
    const parts = this.userName.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return this.userName.slice(0, 2).toUpperCase();
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
