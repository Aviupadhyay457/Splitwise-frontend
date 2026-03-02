import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-check-email',
  templateUrl: './check-email.component.html',
  styleUrls: ['./check-email.component.css']
})
export class CheckEmailComponent {
  email: string = history.state?.email ?? '';

  constructor(private router: Router) {}

  goHome() {
    this.router.navigate(['/']);
  }
}
