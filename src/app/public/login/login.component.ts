import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import {Md5} from 'ts-md5';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';


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
      console.log(form)
      this.hashedPassword=Md5.hashStr(form.value.password)
      this.credentialsString=btoa(`"hashedPassword":"${this.hashedPassword}"`)
      const jsonInput={
        "email":form.value.email,
        "password":this.credentialsString
      }
      console.log(jsonInput)
      this.http.post('https://localhost:7032/api/login', jsonInput)
      .subscribe({
        next: (res: any) => {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('userEmail', form.value.email);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error(err);
          alert("sign in failed")
        }
      });
    }
}
