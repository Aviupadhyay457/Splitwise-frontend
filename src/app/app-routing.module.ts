import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { GroupComponent } from './group/group.component'; 
import { CreateGroupComponent } from './create-group/create-group.component';
import { VerifyEmailComponent } from './signup/verify-email/verify-email.component';
import { CheckEmailComponent } from './signup/check-email/check-email.component';

const routes: Routes = [
  {path:'',component:HomeComponent},
  {path:'Home',component:HomeComponent},
  {path:'Login',component:LoginComponent},
  {path:'Signup',component:SignupComponent},
  {path:'ForgotPassword',component:ForgotPasswordComponent},
  {path:'reset-password',component:ResetPasswordComponent},
  {path:'group', component:GroupComponent},
  {path:'group/create', component:CreateGroupComponent},
  {path:'verify-email',component:VerifyEmailComponent},
  {path:'check-email',component:CheckEmailComponent},
  {path:'**',component:HomeComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
