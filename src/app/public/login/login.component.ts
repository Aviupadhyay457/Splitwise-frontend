import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import {Md5} from 'ts-md5';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    passwordType="password";
    emailPopup=true
    hashedPassword=''
    credentialsString=''
    statusMessage: string | null = null;
    statusSuccess = false;
    isLoading = false;
    errorMessage: string | null = null;

    constructor(private http: HttpClient, private router: Router) {}

    ngOnInit() {
      const state = history.state;
      if (state?.message) {
        this.statusMessage = state.message;
        this.statusSuccess = state.success;
      }
    }

    dismissStatus() {
      this.statusMessage = null;
    }
    hidePass(){
    this.passwordType="password"
    }
    showPass(){
    this.passwordType="text"
    }
    OnFormSubmitted(form:NgForm){
      this.errorMessage = null;
      this.isLoading = true;
      this.hashedPassword=Md5.hashStr(form.value.password)
      this.credentialsString=btoa(`"hashedPassword":"${this.hashedPassword}"`)
      const jsonInput={
        "email":form.value.email,
        "password":this.credentialsString
      }
      this.http.post(`${environment.apiBaseUrl}/login`, jsonInput)
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('userId', String(res.data.id));
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err?.error?.errors?.[0]?.message ?? 'Sign in failed. Please try again.';
        }
      });
    }
}
