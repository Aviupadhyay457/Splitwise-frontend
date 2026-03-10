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
  members: any[] = [];
  expenses: any[] = [];
  currentUserId: number = 0;
  totalBalance: number = 0;
  loadingExpenses: boolean = true;
  showAddExpenseModal: boolean = false;
  showMembers: boolean = false;
  groupId: number = 0;

  private readonly apiUrl = 'https://localhost:7032/api/groups';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUserId = Number(localStorage.getItem('userId'));
    this.groupId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadGroup(this.groupId);
    this.loadMembers(this.groupId);
  }

  headers() {
    const token = localStorage.getItem('token') ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  loadGroup(id: number) {
    this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.headers() })
      .subscribe(res => {
        this.group = res.data;
      });
  }

  loadMembers(id: number) {
    this.http.get<any>(`${this.apiUrl}/${id}/members`, { headers: this.headers() })
      .subscribe(res => {
        this.members = res.data;
        this.showMembers = this.members.length <= 7;
        this.loadExpenses(id);
      });
  }

  toggleMembers() {
    this.showMembers = !this.showMembers;
  }

  loadExpenses(id: number) {
    this.loadingExpenses = true;
    this.http.get<any>(`${this.apiUrl}/${id}/expenses`, { headers: this.headers() })
      .subscribe({
        next: res => {
          this.expenses = res.data ?? [];
          this.computeTotalBalance();
          this.loadingExpenses = false;
        },
        error: () => {
          this.loadingExpenses = false;
        }
      });
  }

  computeTotalBalance() {
    const myMember = this.members.find(m => m.memberId === this.currentUserId);
    const myGroupMemberId = myMember?.id ?? -1;
    this.totalBalance = this.expenses.reduce((sum, expense) => {
      const myShare = expense.shares
        .find((s: any) => s.groupMemberId === myGroupMemberId)?.amount ?? 0;
      const bal = expense.paidByGroupMemberId === myGroupMemberId
        ? expense.totalAmount - myShare
        : -myShare;
      return sum + bal;
    }, 0);
  }

  onExpenseAdded() {
    this.loadExpenses(this.groupId);
  }

  back() {
    this.router.navigate(['/dashboard/groups']);
  }

}
