import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent implements OnInit {

  friends: any[] = [];
  nonFriends: any[] = [];
  pendingInvites: any[] = [];

  showAddModal = false;
  selectedUsers: number[] = [];

  showInviteModal = false;
  inviteEmail = '';

  showFriends = true;
  showPending = true;

  toastMessage = '';
  toastType = '';
  showToast = false;

  private readonly apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}
 
  ngOnInit(): void {
    this.loadFriends();
    this.loadPendingInvites();
  }
 
  getHeaders(){
    const token = localStorage.getItem('token') ?? '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  /* ================= TOAST ================= */

  showNotification(status:string){
    switch(status){
      case "Invited":
        this.toastMessage = "Invite sent successfully";
        this.toastType = "success";
        break;

      case "Already_Exist":
        this.toastMessage = "Already invited (within 24 hrs)";
        this.toastType = "warning";
        break;

      case "Resend":
        this.toastMessage = "Invitation resent successfully";
        this.toastType = "info";
        break;

      case "Friend_Added":
        this.toastMessage = "Friend added successfully";
        this.toastType = "success";
        break;

      case "Already_Added":
        this.toastMessage = "Already friends";
        this.toastType = "warning";
        break;

      default:
        this.toastMessage = "Action completed";
        this.toastType = "info";
    }

    this.showToast = true;

    setTimeout(()=>{
      this.showToast = false;
    },3000);
  }

  /* ================= TOGGLE ================= */

  toggleFriends(){
    this.showFriends = !this.showFriends;
  }

  togglePending(){
    this.showPending = !this.showPending;
  }

  /* ================= FRIENDS ================= */

  getInitials(member: any): string {
    return ((member.firstName?.[0] ?? '') + (member.lastName?.[0] ?? '')).toUpperCase();
  }

  loadFriends(): void {
    this.http.get<any>(`${this.apiUrl}/friendships`, { headers: this.getHeaders() })
      .subscribe(res => { this.friends = res.data; });
  }

  loadPendingInvites(): void {
    this.http.get<any>(`${this.apiUrl}/friendships-pendingInvites`, { headers: this.getHeaders() })
      .subscribe(res => {
        this.pendingInvites = Array.isArray(res.data) ? res.data : res.data ? [res.data] : [];
      });
  }

  resendInvite(email: string): void {
    this.http.post<any>(`${this.apiUrl}/friendships-invitations`, { email }, { headers: this.getHeaders() })
      .subscribe(res => {
        this.showNotification(res.data.status);
        this.loadPendingInvites();
      });
  }

  openAddFriend(): void {
    this.showAddModal = true;
    this.http.get<any>(`${this.apiUrl}/friendships-nonFriends`, { headers: this.getHeaders() })
      .subscribe(res => { this.nonFriends = res.data; });
  }

  toggleUser(id: number): void {
    this.selectedUsers.includes(id)
      ? this.selectedUsers = this.selectedUsers.filter(x => x !== id)
      : this.selectedUsers.push(id);
  }

  addFriends(): void {
    this.http.post<any>(`${this.apiUrl}/friendships`, { friendUserId: this.selectedUsers }, { headers: this.getHeaders() })
      .subscribe(res => {
        this.showAddModal = false;
        this.selectedUsers = [];
        this.loadFriends();
        this.showNotification(res.data?.status);
      });
  }

  openInviteModal(): void {
    this.showInviteModal = true;
    this.inviteEmail = '';
  }

  closeInviteModal(): void {
    this.showInviteModal = false;
  }

  sendInvitation(): void {
    this.http.post<any>(`${this.apiUrl}/friendships-invitations`, { email: this.inviteEmail }, { headers: this.getHeaders() })
      .subscribe(res => {
        this.showInviteModal = false;
        this.inviteEmail = '';
        this.showNotification(res.data.status);
        this.loadPendingInvites();
      });
  }
}