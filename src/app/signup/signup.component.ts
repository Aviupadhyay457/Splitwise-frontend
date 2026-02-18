import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import {Md5} from 'ts-md5';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  passwordType="password";
  passwordForChecks='';
  showFields=false;
  formData:any={}
  hashedPassword=''
  credentialsString=''
  constructor(private http: HttpClient) {}
  OnFormSubmitted(form:NgForm){
    // console.log(form);
    // console.log(form.value.firstName)
    this.hashedPassword=Md5.hashStr(form.value.password)
    this.credentialsString=btoa(`"hashedPassword":"${this.hashedPassword}"`)

    const jsonInput={
      "firstName":form.value.firstName,
      "lastName":form.value.lastName,
      "email":form.value.email,
      "credentials":this.credentialsString
    }
    

    // console.log(jsonInput)
    // console.log(this.credentialsString)

    this.http.post('https://localhost:7032/api/users', jsonInput)
      .subscribe({
        next: (res) => {
          console.log(res);
          alert("user added successfully")
        },
        error: (err) => {
          console.error(err);
          alert("couldnt add the user, try again.")
        }
      });
    
  }

  continueBtnClick(){
    this.showFields=true
  }
  hidePass(){
    this.passwordType="password"
  }
  showPass(){
    this.passwordType="text"
  }
  upperCaseValidation(passwordForChecks:string){
    return passwordForChecks!==passwordForChecks.toLowerCase()
  }
  lowerCaseValidation(passwordForChecks:string){
    return passwordForChecks!==passwordForChecks.toUpperCase()
  }
  numberValidation(passwordForChecks:string){
    return /\d/.test(passwordForChecks)
  }
  specialCharValidation(passwordForChecks:string){
    let arr=['?','=','.','*','[','@','$','!','%','*','?','&']
    return arr.some(char=>passwordForChecks.includes(char));
  }
  lengthValidation(passwordForChecks:string){
    return passwordForChecks.length>=8;
  }
  checkAllValidation(password:string){
    return this.upperCaseValidation(password) && this.lowerCaseValidation(password) && this.numberValidation(password) && this.specialCharValidation(password) && this.numberValidation(password)
  }

 

}
