import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-group-details',
  templateUrl: './group-details.component.html',
  styleUrls: ['./group-details.component.css']
})
export class GroupDetailsComponent implements OnInit {

  group: any;
  members: any[] = [];
  expenses: any[] = [];
  groupSettlements: any[] = [];
  currentUserId: number = 0;
  totalBalance: number = 0;
  loadingExpenses: boolean = true;
  showAddExpenseModal: boolean = false;
  showMembers: boolean = false;
  groupId: number = 0;

  private readonly apiUrl = `${environment.apiBaseUrl}/groups`;

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
          this.loadGroupSettlements(id);
        },
        error: () => {
          this.loadingExpenses = false;
        }
      });
  }

  loadGroupSettlements(_id: number) {
    const allShares: any[] = this.expenses.flatMap((e: any) => e.shares);
    if (allShares.length === 0) {
      this.groupSettlements = [];
      this.computeTotalBalance();
      this.loadingExpenses = false;
      return;
    }
    const shareRequests = allShares.map((share: any) =>
      this.http.get<any>(`${environment.apiBaseUrl}/expense-shares/${share.id}/settlements`, { headers: this.headers() })
    );
    forkJoin(shareRequests).subscribe({
      next: (results: any[]) => {
        this.groupSettlements = results.flatMap((res: any) => res.data ?? []);
        this.computeTotalBalance();
        this.loadingExpenses = false;
      },
      error: () => {
        this.groupSettlements = [];
        this.computeTotalBalance();
        this.loadingExpenses = false;
      }
    });
  }

  computeTotalBalance() {
    const myMember = this.members.find(m => m.memberId === this.currentUserId);
    const myGroupMemberId = myMember?.id ?? -1;
    this.totalBalance = this.expenses.reduce((sum, expense) => {
      const myShare = expense.shares
        .find((s: any) => s.groupMemberId === myGroupMemberId);
      const myShareAmount = myShare?.amount ?? 0;
      if (expense.paidByGroupMemberId === myGroupMemberId) {
        const totalReceived = expense.shares
          .filter((s: any) => s.groupMemberId !== myGroupMemberId)
          .reduce((total: number, share: any) => {
            return total + this.groupSettlements
              .filter((gs: any) => gs.expenseShareId === share.id)
              .reduce((acc: number, gs: any) => acc + gs.amount, 0);
          }, 0);
        return sum + (expense.totalAmount - myShareAmount) - totalReceived;
      }
      const settledForShare = myShare
        ? this.groupSettlements
            .filter((s: any) => s.expenseShareId === myShare.id)
            .reduce((acc: number, s: any) => acc + s.amount, 0)
        : 0;
      return sum - (myShareAmount - settledForShare);
    }, 0);
  }

  onExpenseAdded() {
    this.loadExpenses(this.groupId);
  }

  onViewSettlements(event: { expenseId: number }) {
    this.router.navigate(['/dashboard/groups/details', this.groupId, 'settlements', event.expenseId]);
  }

  back() {
    this.router.navigate(['/dashboard/groups']);
  }

}
