import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  userName: string = '';
  userEmail: string = '';
  popoverOpen = false;
  logoutConfirming = false;

  private profileUpdatedHandler = () => this.loadProfile();

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadProfile();
    window.addEventListener('profile-updated', this.profileUpdatedHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('profile-updated', this.profileUpdatedHandler);
  }

  loadProfile(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<any>(`${environment.apiBaseUrl}/users/me`, { headers }).subscribe({
      next: (res) => {
        this.userName = `${res.data.firstName} ${res.data.lastName}`;
        this.userEmail = res.data.email;
      }
    });
  }

  getUserInitials(): string {
    const parts = this.userName.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return this.userName.slice(0, 2).toUpperCase();
  }

  isAccountRoute(): boolean {
    return this.router.url.startsWith('/dashboard/account');
  }

  togglePopover(): void {
    this.popoverOpen = !this.popoverOpen;
  }

  closePopover(): void {
    this.popoverOpen = false;
  }

  goToAccount(): void {
    this.popoverOpen = false;
    this.router.navigate(['/dashboard/account']);
  }

  requestLogout(): void {
    this.popoverOpen = false;
    this.logoutConfirming = true;
  }

  cancelLogout(): void {
    this.logoutConfirming = false;
  }

  confirmLogout(): void {
    localStorage.clear();
    this.logoutConfirming = false;
    this.router.navigate(['/Login']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.sidebar-user')) {
      this.popoverOpen = false;
    }
  }
}
