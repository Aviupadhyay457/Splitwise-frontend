import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent implements OnInit {

  friends:any[] = [];
  nonFriends:any[] = [];

  showAddModal = false;
  selectedUsers:number[] = [];

  baseUrl = `${environment.apiBaseUrl}/friendships`;

  constructor(private http:HttpClient) {}

  ngOnInit(): void {
    this.loadFriends();
  }

  getHeaders(){
    const token = localStorage.getItem('token') ?? '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  loadFriends(){
    this.http.get<any>(this.baseUrl,{headers:this.getHeaders()})
    .subscribe(res=>{
      this.friends = res.data;
    });
  }

  openAddFriend(){
    this.showAddModal = true;

    this.http.get<any>(`${this.baseUrl}/nonfriends`,
    {headers:this.getHeaders()})
    .subscribe(res=>{
      this.nonFriends = res.data;
    });
  }

  toggleUser(id:number){
    if(this.selectedUsers.includes(id)){
      this.selectedUsers =
      this.selectedUsers.filter(x=>x!==id);
    }
    else{
      this.selectedUsers.push(id);
    }
  }

  addFriends(){

    const body = {
      friendUserId: this.selectedUsers
    };

    this.http.post(this.baseUrl,body,
    {headers:this.getHeaders()})
    .subscribe(()=>{
      this.showAddModal = false;
      this.selectedUsers = [];
      this.loadFriends();
    });

  }

}