import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Layout shells
import { PublicLayoutComponent } from './public/public-layout/public-layout.component';
import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout.component';

// Public pages
import { HomeComponent } from './public/home/home.component';
import { LoginComponent } from './public/login/login.component';
import { SignupComponent } from './public/signup/signup.component';
import { ForgotPasswordComponent } from './public/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './public/reset-password/reset-password.component';
import { VerifyEmailComponent } from './public/signup/verify-email/verify-email.component';
import { CheckEmailComponent } from './public/signup/check-email/check-email.component';

// Dashboard pages
import { DashboardComponent } from './dashboard/dashboard.component';
import { GroupComponent } from './groups/group.component';
import { CreateGroupComponent } from './groups/create-group/create-group.component';
import { ActivityComponent } from './activity/activity.component';
import { FriendsComponent } from './friends/friends.component';
import { AccountComponent } from './account/account.component';

// Guard
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'Home', component: HomeComponent },
    ]
  },
  { path: 'Login', component: LoginComponent },
  { path: 'Signup', component: SignupComponent },
  { path: 'ForgotPassword', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'check-email', component: CheckEmailComponent },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: DashboardComponent },
      { path: 'groups', component: GroupComponent },
      { path: 'groups/create', component: CreateGroupComponent },
      { path: 'activity', component: ActivityComponent },
      { path: 'friends', component: FriendsComponent },
      { path: 'account', component: AccountComponent },
    ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
