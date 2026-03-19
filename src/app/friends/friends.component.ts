import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent implements OnInit {

  friends:any[] = [];
  nonFriends:any[] = [];
  pendingInvites:any[] = [];

  showAddModal = false;
  selectedUsers:number[] = [];

  showInviteModal = false;
  inviteEmail:string = "";

  // ✅ toggles
  showFriends = true;
  showPending = true;

  // ✅ toast
  toastMessage = "";
  toastType = ""; // success | warning | info
  showToast = false;

  baseUrl = "https://localhost:7032/api/friendships";
  inviteApi = "https://localhost:7032/api/friendships-invitations";
  pendingApi = "https://localhost:7032/api/friendships-pendingInvites";

  constructor(private http:HttpClient) {}

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

  loadFriends(){
    this.http.get<any>(this.baseUrl,{headers:this.getHeaders()})
    .subscribe(res=>{
      this.friends = res.data;
    });
  }

  /* ================= PENDING ================= */

  loadPendingInvites(){
    this.http.get<any>(this.pendingApi,{headers:this.getHeaders()})
    .subscribe(res=>{
      this.pendingInvites = Array.isArray(res.data)
        ? res.data
        : res.data ? [res.data] : [];
    });
  }

  /* ================= RESEND ================= */

  resendInvite(email:string){
    this.http.post<any>(this.inviteApi, {email}, {headers:this.getHeaders()})
    .subscribe(res=>{
      this.showNotification(res.data.status);
      this.loadPendingInvites();
    });
  }

  /* ================= ADD FRIEND ================= */

  openAddFriend(){
    this.showAddModal = true;

    this.http.get<any>(`${this.baseUrl}-nonFriends`,
    {headers:this.getHeaders()})
    .subscribe(res=>{
      this.nonFriends = res.data;
    });
  }

  toggleUser(id:number){
    this.selectedUsers.includes(id)
      ? this.selectedUsers = this.selectedUsers.filter(x=>x!==id)
      : this.selectedUsers.push(id);
  }

  addFriends(){
    const body = { friendUserId: this.selectedUsers };

    this.http.post<any>(this.baseUrl, body,
    {headers:this.getHeaders()})
    .subscribe(res=>{
      this.showAddModal = false;
      this.selectedUsers = [];
      this.loadFriends();

      this.showNotification(res.data?.status);
    });
  }

  /* ================= INVITE ================= */

  openInviteModal(){
    this.showInviteModal = true;
    this.inviteEmail = "";
  }

  closeInviteModal(){
    this.showInviteModal = false;
  }

  sendInvitation(){
    this.http.post<any>(this.inviteApi,
      { email: this.inviteEmail },
      { headers:this.getHeaders() }
    )
    .subscribe(res=>{
      this.showInviteModal = false;
      this.inviteEmail = "";

      this.showNotification(res.data.status);
      this.loadPendingInvites();
    });
  }
}