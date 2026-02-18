import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  passwordType="password";
  passwordForChecks='';
  showFields=false;

  errorString=''
  errorjson={
    name:"",
    message:""
  }
  OnFormSubmitted(form:NgForm){
    console.log(form)
    console.log(form.value.firstName);
    console.log(form.value.lastName);
    console.log(form.value.email);
    console.log(form.value.password);
    console.log(form.value.confirmPassword);
    console.log(form.controls['email'].dirty);

    if(form.controls['email'])

    if(form.controls['password'].value!==form.controls['confirmPassword'].value){
      this.errorString="Your confirmed Password is worng"
    }
     console.log(this.errorString)

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
    //?=.*[@$!%*?&
    // let arr=['@','#','%','&','+','=','[']
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
