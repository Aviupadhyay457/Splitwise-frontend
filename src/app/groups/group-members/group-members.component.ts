import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-group-members',
  templateUrl: './group-members.component.html',
  styleUrls: ['./group-members.component.css']
})
export class GroupMembersComponent implements OnInit {

  groupId!: number;

  members:any[] = [];
  friends:any[] = [];

  showAddModal = false;
  selectedMembers:number[] = [];

  baseUrl = environment.apiBaseUrl;

  constructor(
    private route:ActivatedRoute,
    private http:HttpClient
  ){}

  ngOnInit(): void {

    this.groupId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    this.loadMembers();
    this.loadFriends();
  }

  headers(){
    const token = localStorage.getItem('token') ?? '';

    return new HttpHeaders({
      Authorization:`Bearer ${token}`
    });
  }

  /* GET GROUP MEMBERS */

  loadMembers(){

    this.http.get<any>(
      `${this.baseUrl}/groups/${this.groupId}`,
      {headers:this.headers()}
    ).subscribe(res=>{
      this.members = res.data.members || [];
    });

  }

  /* LOAD FRIENDS TO ADD */

  loadFriends(){

    this.http.get<any>(
      `${this.baseUrl}/friendships`,
      {headers:this.headers()}
    ).subscribe(res=>{
      this.friends = res.data;
    });

  }

  /* SELECT MEMBER */

  toggleMember(id:number){

    if(this.selectedMembers.includes(id)){
      this.selectedMembers =
      this.selectedMembers.filter(x=>x!==id);
    }
    else{
      this.selectedMembers.push(id);
    }

  }

  /* ADD MEMBERS */

  addMembers(){

    const body={
      memberId:this.selectedMembers
    };

    this.http.post(
      `${this.baseUrl}/groups/${this.groupId}/members`,
      body,
      {headers:this.headers()}
    ).subscribe(()=>{

      this.showAddModal=false;
      this.selectedMembers=[];
      this.loadMembers();

    });

  }

  /* REMOVE MEMBER */

  removeMember(memberId:number){

    this.http.delete(
      `${this.baseUrl}/groups/${this.groupId}/members/${memberId}`,
      {headers:this.headers()}
    ).subscribe(()=>{

      this.loadMembers();

    });

  }

}