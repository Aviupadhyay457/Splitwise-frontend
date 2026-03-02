import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-group-details',
  templateUrl: './group-details.component.html',
  styleUrls: ['./group-details.component.css']
})
export class GroupDetailsComponent implements OnInit {

  group: any;
  private readonly apiUrl = 'https://localhost:7032/api/groups';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadGroup(id);
  }

  loadGroup(id: number): void {

    const token = localStorage.getItem('token') ?? '';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.get<any>(`${this.apiUrl}/${id}`, { headers })
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.group = res.data;   // ✅ CORRECT
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

  back(): void {
    this.router.navigate(['/dashboard/groups']);
  }
}