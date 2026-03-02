import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Public layout shell
import { PublicLayoutComponent } from './public/public-layout/public-layout.component';

// Public components
import { HomeComponent } from './public/home/home.component';
import { HeaderComponent } from './public/header/header.component';
import { NavbarComponent } from './public/header/navbar/navbar.component';
import { LoginComponent } from './public/login/login.component';
import { SignupComponent } from './public/signup/signup.component';
import { CheckEmailComponent } from './public/signup/check-email/check-email.component';
import { VerifyEmailComponent } from './public/signup/verify-email/verify-email.component';
import { ForgotPasswordComponent } from './public/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './public/reset-password/reset-password.component';

// Dashboard layout shell and parts
import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout.component';
import { DashboardHeaderComponent } from './layout/header/dashboard-header.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';

// Dashboard pages
import { DashboardComponent } from './dashboard/dashboard.component';
import { GroupComponent } from './groups/group.component';
import { CreateGroupComponent } from './groups/create-group/create-group.component';
import { ActivityComponent } from './activity/activity.component';
import { FriendsComponent } from './friends/friends.component';
import { AccountComponent } from './account/account.component';
import { GroupDetailsComponent } from './groups/group-details/group-details.component';
import { EditGroupComponent } from './groups/edit-group/edit-group.component';

@NgModule({
  declarations: [
    AppComponent,
    // Public
    PublicLayoutComponent,
    HomeComponent,
    HeaderComponent,
    NavbarComponent,
    LoginComponent,
    SignupComponent,
    CheckEmailComponent,
    VerifyEmailComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    // Dashboard layout
    DashboardLayoutComponent,
    DashboardHeaderComponent,
    SidebarComponent,
    // Dashboard pages
    DashboardComponent,
    GroupComponent,
    CreateGroupComponent,
    ActivityComponent,
    FriendsComponent,
    AccountComponent,
    GroupDetailsComponent,
    EditGroupComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
