import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import {Md5} from 'ts-md5';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
    passwordType="password";
    emailPopup=true
    hashedPassword=''
    credentialsString=''
    constructor(private http: HttpClient) {}
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
        next: (res) => {
        console.log(res);
        alert("sign in successful")
        },
        error: (err) => {
          console.error(err);
          alert("sign in failed")
        }
      });
    }
}
