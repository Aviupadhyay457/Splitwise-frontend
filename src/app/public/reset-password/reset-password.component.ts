import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Md5 } from 'ts-md5';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface ResetPasswordResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: null;
  errors: { type: string; message: string; field: null }[] | null;
  meta: { requestId: string; timeStamp: string };
}

@Component({
  selector: 'reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  passwordType = 'password';
  passwordForChecks = '';
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
    });
  }

  hidePass() { this.passwordType = 'password'; }
  showPass() { this.passwordType = 'text'; }

  upperCaseValidation(p: string) { return p !== p.toLowerCase(); }
  lowerCaseValidation(p: string) { return p !== p.toUpperCase(); }
  numberValidation(p: string) { return /\d/.test(p); }
  specialCharValidation(p: string) {
    return ['?', '=', '.', '*', '[', '@', '$', '!', '%', '?', '&'].some(c => p.includes(c));
  }
  lengthValidation(p: string) { return p.length >= 8; }
  checkAllValidation(p: string) {
    return this.upperCaseValidation(p) && this.lowerCaseValidation(p) &&
      this.numberValidation(p) && this.specialCharValidation(p) && this.lengthValidation(p);
  }

  OnFormSubmitted(form: NgForm) {
    this.isLoading = true;
    const hashed = Md5.hashStr(form.value.newPassword);
    const newPassword = btoa(`"hashedPassword":"${hashed}"`);
    const body = { token: this.token, newPassword };

    this.http.put<ResetPasswordResponse>(`${environment.apiBaseUrl}/password-resets`, body)
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          this.router.navigate(['/Login'], {
            state: { message: res.message || 'Password has been reset successfully.', success: true }
          });
        },
        error: (err) => {
          this.isLoading = false;
          const msg = err.error?.message || err.error?.errors?.[0]?.message || 'Password reset failed. Please try again.';
          this.router.navigate(['/Login'], {
            state: { message: msg, success: false }
          });
        }
      });
  }
}
