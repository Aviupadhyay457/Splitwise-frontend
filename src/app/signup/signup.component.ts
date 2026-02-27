import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Md5 } from 'ts-md5';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  passwordType = 'password';
  passwordForChecks = '';
  showFields = false;
  hashedPassword = '';
  credentialsString = '';
  emailAlreadyExists = false;
  isLoading = false;
  existingEmails: string[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  OnFormSubmitted(form: NgForm) {
    this.hashedPassword = Md5.hashStr(form.value.password);
    this.credentialsString = btoa(`"hashedPassword":"${this.hashedPassword}"`);

    const jsonInput = {
      firstName: form.value.firstName,
      lastName: form.value.lastName,
      email: form.value.email,
      credentials: this.credentialsString
    };

    this.isLoading = true;

    this.http.post<any>('https://localhost:7032/api/users', jsonInput).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/check-email'], { state: { email: form.value.email } });
      },
      error: (err) => {
        this.isLoading = false;
        const errorType = err.error?.errors?.[0]?.type;
        if (errorType === 'EMAIL_ALREADY_EXISTS') {
          if (!this.existingEmails.includes(jsonInput.email)) {
            this.existingEmails.push(jsonInput.email);
          }
          this.emailAlreadyExists = true;
        }
      }
    });
  }

  onEmailChange(newEmail: string) {
    this.emailAlreadyExists = this.existingEmails.includes(newEmail);
  }

  goToLogin(form: NgForm) {
    this.router.navigate(['/Login'], { state: { email: form.value?.email } });
  }

  continueBtnClick() {
    this.showFields = true;
  }

  hidePass() {
    this.passwordType = 'password';
  }

  showPass() {
    this.passwordType = 'text';
  }

  upperCaseValidation(passwordForChecks: string) {
    return passwordForChecks !== passwordForChecks.toLowerCase();
  }

  lowerCaseValidation(passwordForChecks: string) {
    return passwordForChecks !== passwordForChecks.toUpperCase();
  }

  numberValidation(passwordForChecks: string) {
    return /\d/.test(passwordForChecks);
  }

  specialCharValidation(passwordForChecks: string) {
    const arr = ['?', '=', '.', '*', '[', '@', '$', '!', '%', '*', '?', '&'];
    return arr.some(char => passwordForChecks.includes(char));
  }

  lengthValidation(passwordForChecks: string) {
    return passwordForChecks.length >= 8;
  }

  checkAllValidation(password: string) {
    return (
      this.upperCaseValidation(password) &&
      this.lowerCaseValidation(password) &&
      this.numberValidation(password) &&
      this.specialCharValidation(password)
    );
  }
}
