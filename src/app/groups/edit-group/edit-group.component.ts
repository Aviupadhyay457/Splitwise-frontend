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

  private readonly apiUrl = 'https://localhost:7032/api/groups';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.groupId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadGroup();
  }

  loadGroup(): void {

    const token = localStorage.getItem('token') ?? '';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    // ✅ GET for prefill
    this.http.get<any>(`${this.apiUrl}/${this.groupId}`, { headers })
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.group.groupName = res.data.groupName;
            this.group.description = res.data.description;
          } else {
            alert(res.message);
          }
        },
        error: (err) => {
          console.error(err);
          alert('Failed to load group');
        }
      });
  }

  updateGroup(): void {

    const token = localStorage.getItem('token') ?? '';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    // ✅ PUT update
    this.http.put<any>(
      `${this.apiUrl}/${this.groupId}`,
      this.group,
      { headers }
    ).subscribe({
      next: (res) => {
        if (res.success) {
          alert(res.message); // "Group updated successfully"
          this.router.navigate(['/dashboard/groups']);
        } else {
          alert(res.message);
        }
      },
      error: (err) => {
        console.error(err);
        alert('Update failed');
      }
    });
  }
}