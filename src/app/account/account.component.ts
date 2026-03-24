import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Md5 } from 'ts-md5';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {

  firstName: string = '';
  lastName: string = '';
  email: string = '';
  createdAt: string = '';
  loading: boolean = true;

  editFirstName: string = '';
  editLastName: string = '';
  nameSubmitting: boolean = false;
  nameSuccess: string = '';
  nameError: string = '';

  currentPassword: string = '';
  newPassword: string = '';
  passwordSubmitting: boolean = false;
  passwordSuccess: string = '';
  passwordError: string = '';
  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;

  newEmail: string = '';
  emailPassword: string = '';
  emailSubmitting: boolean = false;
  emailSuccess: string = '';
  emailError: string = '';
  showEmailPassword: boolean = false;

  logoutConfirming: boolean = false;

  deleteStep: number = 0; 
  deletePassword: string = '';
  showDeletePassword: boolean = false;
  deleteSubmitting: boolean = false;
  deleteError: string = '';

  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  private headers(): HttpHeaders {
    const token = localStorage.getItem('token') ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  private hashPassword(password: string): string {
    return btoa(`"hashedPassword":"${Md5.hashStr(password)}"`);
  }

  private isValidPassword(password: string): boolean {
    const specialChars = ['?', '=', '.', '*', '[', '@', '$', '!', '%', '&'];
    return (
      password.length >= 8 &&
      password !== password.toLowerCase() &&
      password !== password.toUpperCase() &&
      /\d/.test(password) &&
      specialChars.some(c => password.includes(c))
    );
  }

  private extractError(err: any, fallback: string): string {
    return err?.error?.errors?.[0]?.message ?? err?.error?.message ?? fallback;
  }

  loadProfile(): void {
    this.loading = true;
    this.http.get<any>(`${this.apiUrl}/users/me`, { headers: this.headers() }).subscribe({
      next: (res) => {
        if (res.success) {
          this.firstName = res.data.firstName;
          this.lastName = res.data.lastName;
          this.email = res.data.email;
          this.createdAt = res.data.createdAt;
          this.editFirstName = res.data.firstName;
          this.editLastName = res.data.lastName;
          localStorage.setItem('cachedFirstName', res.data.firstName);
          localStorage.setItem('cachedLastName', res.data.lastName);
          localStorage.setItem('cachedEmail', res.data.email);
        }
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  getInitials(): string {
    return ((this.firstName?.[0] ?? '') + (this.lastName?.[0] ?? '')).toUpperCase();
  }

  getMemberSince(): string {
    if (!this.createdAt) return '';
    return new Date(this.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  saveName(): void {
    this.nameSuccess = '';
    this.nameError = '';

    const cachedFirst = localStorage.getItem('cachedFirstName') ?? '';
    const cachedLast = localStorage.getItem('cachedLastName') ?? '';
    const firstChanged = this.editFirstName.trim() !== cachedFirst;
    const lastChanged = this.editLastName.trim() !== cachedLast;

    if (!firstChanged && !lastChanged) {
      this.nameSuccess = 'Your name is already up to date.';
      return;
    }

    const body: any = {};
    if (firstChanged) body['firstName'] = this.editFirstName.trim();
    if (lastChanged) body['lastName'] = this.editLastName.trim();

    this.nameSubmitting = true;
    this.http.patch<any>(`${this.apiUrl}/users/me`, body, { headers: this.headers() }).subscribe({
      next: (res) => {
        this.nameSubmitting = false;
        if (res.success) {
          this.firstName = res.data.firstName;
          this.lastName = res.data.lastName;
          this.editFirstName = res.data.firstName;
          this.editLastName = res.data.lastName;
          localStorage.setItem('cachedFirstName', res.data.firstName);
          localStorage.setItem('cachedLastName', res.data.lastName);
          this.nameSuccess = 'Name updated successfully.';
          window.dispatchEvent(new Event('profile-updated'));
        } else {
          this.nameError = res.errors?.[0]?.message ?? res.message ?? 'Update failed.';
        }
      },
      error: (err) => {
        this.nameSubmitting = false;
        this.nameError = this.extractError(err, 'Update failed.');
      }
    });
  }

  changePassword(): void {
    this.passwordSuccess = '';
    this.passwordError = '';
    if (!this.currentPassword || !this.newPassword) {
      this.passwordError = 'Both fields are required.';
      return;
    }
    if (!this.isValidPassword(this.currentPassword)) {
      this.passwordError = 'Current password does not meet the password requirements.';
      return;
    }
    if (!this.isValidPassword(this.newPassword)) {
      this.passwordError = 'New password must be at least 8 characters and include uppercase, lowercase, a number, and a special character (?=.*[@$!%*?&[.]).';
      return;
    }
    this.passwordSubmitting = true;
    const body = {
      currentPassword: this.hashPassword(this.currentPassword),
      newPassword: this.hashPassword(this.newPassword)
    };
    this.http.put<any>(`${this.apiUrl}/users/me/password`, body, { headers: this.headers() }).subscribe({
      next: (res) => {
        this.passwordSubmitting = false;
        if (res.success) {
          this.currentPassword = '';
          this.newPassword = '';
          this.passwordSuccess = 'Password changed successfully.';
        } else {
          this.passwordError = res.errors?.[0]?.message ?? res.message ?? 'Password change failed.';
        }
      },
      error: (err) => {
        this.passwordSubmitting = false;
        this.passwordError = this.extractError(err, 'Password change failed.');
      }
    });
  }

  requestEmailChange(): void {
    this.emailSuccess = '';
    this.emailError = '';

    if (!this.newEmail || !this.emailPassword) {
      this.emailError = 'Both fields are required.';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.newEmail)) {
      this.emailError = 'Please enter a valid email address.';
      return;
    }

    const cachedEmail = localStorage.getItem('cachedEmail') ?? this.email;
    if (this.newEmail.trim().toLowerCase() === cachedEmail.trim().toLowerCase()) {
      this.emailError = 'New email must be different from your current email.';
      return;
    }

    this.emailSubmitting = true;
    const body = {
      newEmail: this.newEmail.trim(),
      currentPassword: this.hashPassword(this.emailPassword)
    };
    this.http.post<any>(`${this.apiUrl}/email-changes`, body, { headers: this.headers() }).subscribe({
      next: (res) => {
        this.emailSubmitting = false;
        if (res.success) {
          this.newEmail = '';
          this.emailPassword = '';
          this.emailSuccess = 'Verification link sent to your new email address.';
        } else {
          this.emailError = res.errors?.[0]?.message ?? res.message ?? 'Email change failed.';
        }
      },
      error: (err) => {
        this.emailSubmitting = false;
        this.emailError = this.extractError(err, 'Email change failed.');
      }
    });
  }

  openDeleteWarning(): void {
    this.deleteStep = 1;
    this.deletePassword = '';
    this.deleteError = '';
  }

  proceedToPasswordEntry(): void {
    this.deleteStep = 2;
    this.deleteError = '';
  }

  proceedToFinalConfirm(): void {
    if (!this.deletePassword) {
      this.deleteError = 'Password is required.';
      return;
    }
    this.deleteStep = 3;
    this.deleteError = '';
  }

  confirmDelete(): void {
    this.deleteSubmitting = true;
    this.deleteError = '';
    const body = { currentPassword: this.hashPassword(this.deletePassword) };
    this.http.delete<any>(`${this.apiUrl}/users/me`, {
      headers: this.headers(),
      body
    }).subscribe({
      next: (res) => {
        this.deleteSubmitting = false;
        if (res.success) {
          localStorage.clear();
          this.router.navigate(['/']);
        } else {
          this.deleteError = res.errors?.[0]?.message ?? res.message ?? 'Account deletion failed.';
          this.deleteStep = 2;
        }
      },
      error: (err) => {
        this.deleteSubmitting = false;
        this.deleteError = this.extractError(err, 'Account deletion failed.');
        this.deleteStep = 2;
      }
    });
  }

  closeDeleteModal(): void {
    this.deleteStep = 0;
    this.deletePassword = '';
    this.deleteError = '';
    this.deleteSubmitting = false;
  }

  requestLogout(): void {
    this.logoutConfirming = true;
  }

  cancelLogout(): void {
    this.logoutConfirming = false;
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}
