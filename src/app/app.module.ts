import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';


import { PublicLayoutComponent } from './public/public-layout/public-layout.component';

import { HomeComponent } from './public/home/home.component';
import { HeaderComponent } from './public/header/header.component';
import { NavbarComponent } from './public/header/navbar/navbar.component';
import { LoginComponent } from './public/login/login.component';
import { SignupComponent } from './public/signup/signup.component';
import { CheckEmailComponent } from './public/signup/check-email/check-email.component';
import { VerifyEmailComponent } from './public/signup/verify-email/verify-email.component';
import { ForgotPasswordComponent } from './public/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './public/reset-password/reset-password.component';

import { DashboardLayoutComponent } from './layout/dashboard-layout/dashboard-layout.component';
import { DashboardHeaderComponent } from './layout/header/dashboard-header.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';

import { DashboardComponent } from './dashboard/dashboard.component';
import { GroupComponent } from './groups/group.component';
import { CreateGroupComponent } from './groups/create-group/create-group.component';
import { EditGroupComponent } from './groups/edit-group/edit-group.component';
import { GroupDetailsComponent } from './groups/group-details/group-details.component';
import { GroupMembersComponent } from './groups/group-members/group-members.component';
import { ExpenseListComponent } from './groups/expense-list/expense-list.component';
import { AddExpenseComponent } from './groups/add-expense/add-expense.component';
import { EditExpenseComponent } from './groups/edit-expense/edit-expense.component';
import { ActivityComponent } from './activity/activity.component';
import { FriendsComponent } from './friends/friends.component';
import { AccountComponent } from './account/account.component';

@NgModule({
  declarations: [
    AppComponent,
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
    DashboardLayoutComponent,
    DashboardHeaderComponent,
    SidebarComponent,
    DashboardComponent,
    GroupComponent,
    CreateGroupComponent,
    EditGroupComponent,
    GroupDetailsComponent,
    GroupMembersComponent,
    ExpenseListComponent,
    AddExpenseComponent,
    EditExpenseComponent,
    ActivityComponent,
    FriendsComponent,
    AccountComponent,
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
