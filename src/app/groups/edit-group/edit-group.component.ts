import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-edit-group',
  templateUrl: './edit-group.component.html',
  styleUrls: ['./edit-group.component.css']
})
export class EditGroupComponent implements OnInit {

  groupId!: number;

  group = {
    groupName: '',
    description: ''
  };

  members: any[] = [];
  users: any[] = [];

  selectedUsers: number[] = [];
  showAddModal = false;

  private apiUrl = 'https://localhost:7032/api';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {

  this.groupId = Number(this.route.snapshot.paramMap.get('id'));

  console.log("GROUP ID:", this.groupId);

  this.loadGroup();
  this.loadMembers();
}

  headers() {

    const token = localStorage.getItem('token') ?? '';

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

  }

  /* LOAD GROUP */

  loadGroup(): void {

    this.http.get<any>(
      `${this.apiUrl}/groups/${this.groupId}`,
      { headers: this.headers() }
    ).subscribe(res => {

      if (res.success) {

        this.group.groupName = res.data.groupName;
        this.group.description = res.data.description;

      }

    });

  }

  /* UPDATE GROUP */

  updateGroup(): void {

    this.http.put<any>(
      `${this.apiUrl}/groups/${this.groupId}`,
      this.group,
      { headers: this.headers() }
    ).subscribe(res => {

      if (res.success) {

        alert(res.message);
        this.router.navigate(['/dashboard/groups']);

      }

    });

  }

  /* LOAD MEMBERS */

  loadMembers() {

    this.http.get<any>(
      `${this.apiUrl}/groups/${this.groupId}/members`,
      { headers: this.headers() }
    ).subscribe(res => {

      if(res.success){
        this.members = res.data;
      }

    });

  }

  /* REMOVE MEMBER */

  removeMember(memberId: number) {

  console.log("Removing member:", this.groupId, memberId);

  this.http.delete(
    `${this.apiUrl}/groups/${this.groupId}/members/${memberId}`,
    { headers: this.headers() }
  ).subscribe({
    next: (res) => {
      console.log("API RESPONSE:", res);
      alert("Member removed");
      this.loadMembers();
    },
    error: (err) => {
      console.error("DELETE ERROR:", err);
      alert("Remove failed");
    }
  });

}


  /* OPEN ADD MEMBER MODAL */

  openAddMembers() {

    this.showAddModal = true;

    this.http.get<any>(
      `${this.apiUrl}/groups/${this.groupId}/nonMembers`,
      { headers: this.headers() }
    ).subscribe(res => {

      if(res.success){

        this.users = res.data;

      }

    });

  }

  /* SELECT MULTIPLE USERS */

  toggleSelect(id: number) {

    if (this.selectedUsers.includes(id)) {

      this.selectedUsers =
        this.selectedUsers.filter(x => x !== id);

    } else {

      this.selectedUsers.push(id);

    }

  }

  /* ADD MEMBERS */

  addMembers() {

    const body = {
      memberId: this.selectedUsers
    };

    this.http.post<any>(
      `${this.apiUrl}/groups/${this.groupId}/members`,
      body,
      { headers: this.headers() }
    ).subscribe(res => {

      if(res.success){

        alert("Members added successfully");

        this.showAddModal = false;
        this.selectedUsers = [];

        this.loadMembers();

      }

    });

  }

}