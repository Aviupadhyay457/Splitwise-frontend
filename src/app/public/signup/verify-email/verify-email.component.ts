import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface EmailVerificationResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: { emailVerified: boolean } | null;
  errors: { type: string; message: string; field: null }[] | null;
  meta: { requestId: string; timeStamp: string };
}

type VerifyState = 'loading' | 'success' | 'expired' | 'invalid';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {
  state: VerifyState = 'loading';
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.errorMessage = 'Verification token is invalid or does not exist';
      this.state = 'invalid';
      return;
    }

    this.http.get<EmailVerificationResponse>(
      `https://localhost:7032/api/email-confirmations?token=${encodeURIComponent(token)}`
    ).subscribe({
      next: () => {
        this.state = 'success';
      },
      error: (err) => {
        const response: EmailVerificationResponse = err.error;
        const errorType = response?.errors?.[0]?.type;
        this.errorMessage =
          response?.errors?.[0]?.message ||
          response?.message ||
          'Something went wrong.';

        if (errorType === 'TOKEN_EXPIRED') {
          this.state = 'expired';
        } else {
          this.state = 'invalid';
        }
      }
    });
  }

  goTo(path: string) {
    this.router.navigate([path]);
  }
}
