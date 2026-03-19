import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface PasswordResetMeta {
  requestId: string;
  timeStamp: string;
}

interface PasswordResetResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: null;
  errors: null;
  meta: PasswordResetMeta;
}

@Component({
  selector: 'forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  response: PasswordResetResponse | null = null;
  isLoading = false;

  constructor(private http: HttpClient) {}

  OnFormSubmitted(form: NgForm) {
    this.isLoading = true;
    const body = { email: form.value.email };
    this.http.post<PasswordResetResponse>(`${environment.apiBaseUrl}/password-resets`, body)
      .subscribe({
        next: (res) => {
          this.response = res;
          this.isLoading = false;
          console.log(res)
        },
        error: (err) => {
          this.isLoading = false;
          console.log(err)
          if (err.error) {
            this.response = err.error;
            
          }
        }
      });
  }
}
