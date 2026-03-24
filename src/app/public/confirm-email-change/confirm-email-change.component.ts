import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

type ConfirmState = 'loading' | 'success' | 'expired' | 'invalid';

@Component({
  selector: 'app-confirm-email-change',
  templateUrl: './confirm-email-change.component.html',
  styleUrls: ['./confirm-email-change.component.css']
})
export class ConfirmEmailChangeComponent implements OnInit {
  state: ConfirmState = 'loading';
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.errorMessage = 'Email change token is missing or invalid.';
      this.state = 'invalid';
      return;
    }

    this.http.put<any>(`${environment.apiBaseUrl}/email-changes`, { token }).subscribe({
      next: () => {
        this.state = 'success';
      },
      error: (err) => {
        const errorType = err?.error?.errors?.[0]?.type;
        this.errorMessage =
          err?.error?.errors?.[0]?.message ??
          err?.error?.message ??
          'Something went wrong.';

        if (errorType === 'TokenExpired') {
          this.state = 'expired';
        } else {
          this.state = 'invalid';
        }
      }
    });
  }

}
