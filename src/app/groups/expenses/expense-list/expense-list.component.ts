import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-expense-list',
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.css']
})
export class ExpenseListComponent {

  @Input() expenses: any[] = [];
  @Input() members: any[] = [];
  @Input() currentUserId: number = 0;
  @Input() loading: boolean = true;
  @Input() groupId: number = 0;
  @Input() groupSettlements: any[] = [];
  @Output() expenseDeleted = new EventEmitter<void>();
  @Output() expenseUpdated = new EventEmitter<void>();
  @Output() viewSettlements = new EventEmitter<{ expenseId: number }>();

  expandedExpenseId: number | null = null;
  confirmingDeleteId: number | null = null;
  deletingExpenseId: number | null = null;
  editingExpense: any | null = null;
  activeFilter: 'all' | 'pending' | 'settled' | 'others' = 'all';

  private readonly apiUrl = `${environment.apiBaseUrl}/groups`;

  constructor(private http: HttpClient) {}

  headers() {
    const token = localStorage.getItem('token') ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getExpenseBalance(expense: any): number {
    const myMember = this.members.find(m => m.memberId === this.currentUserId);
    const myGroupMemberId = myMember?.id ?? -1;
    const myShare = expense.shares.find((s: any) => s.groupMemberId === myGroupMemberId);
    const myShareAmount = myShare?.amount ?? 0;
    if (expense.paidByGroupMemberId === myGroupMemberId) {
      const totalReceived = expense.shares
        .filter((s: any) => s.groupMemberId !== myGroupMemberId)
        .reduce((total: number, share: any) => {
          return total + this.groupSettlements
            .filter((gs: any) => gs.expenseShareId === share.id)
            .reduce((acc: number, gs: any) => acc + gs.amount, 0);
        }, 0);
      return expense.totalAmount - myShareAmount - totalReceived;
    }
    const settledForShare = myShare
      ? this.groupSettlements
          .filter((s: any) => s.expenseShareId === myShare.id)
          .reduce((acc: number, s: any) => acc + s.amount, 0)
      : 0;
    return -(myShareAmount - settledForShare);
  }

  isInvolved(expense: any): boolean {
    const myMember = this.members.find(m => m.memberId === this.currentUserId);
    const myGroupMemberId = myMember?.id ?? -1;
    const myShare = expense.shares.find((s: any) => s.groupMemberId === myGroupMemberId);
    return !!myShare || expense.paidByGroupMemberId === myGroupMemberId;
  }

  setFilter(filter: 'all' | 'pending' | 'settled' | 'others'): void {
    this.activeFilter = filter;
    this.expandedExpenseId = null;
  }

  filteredExpenses(): any[] {
    const sorted = [...this.expenses].sort((a, b) =>
      new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime()
    );
    if (this.activeFilter === 'all') return sorted;
    return sorted.filter(expense => {
      const balance = this.getExpenseBalance(expense);
      const involved = this.isInvolved(expense);
      if (this.activeFilter === 'pending') return involved && balance !== 0;
      if (this.activeFilter === 'settled') return involved && balance === 0;
      if (this.activeFilter === 'others') return !involved;
      return true;
    });
  }

  getShareSettledAmount(shareId: number): number {
    return this.groupSettlements
      .filter((s: any) => s.expenseShareId === shareId)
      .reduce((acc: number, s: any) => acc + s.amount, 0);
  }

  getMemberName(groupMemberId: number): string {
    const member = this.members.find(m => m.id === groupMemberId);
    return member ? `${member.firstName} ${member.lastName}` : 'Unknown';
  }

  toggleExpense(id: number) {
    if (this.expandedExpenseId === id) {
      this.expandedExpenseId = null;
      this.confirmingDeleteId = null;
    } else {
      this.expandedExpenseId = id;
      this.confirmingDeleteId = null;
    }
  }

  openEdit(expense: any, event: MouseEvent) {
    event.stopPropagation();
    this.editingExpense = expense;
  }

  onExpenseUpdated() {
    this.editingExpense = null;
    this.expandedExpenseId = null;
    this.expenseUpdated.emit();
  }

  requestDelete(expenseId: number, event: MouseEvent) {
    event.stopPropagation();
    this.confirmingDeleteId = expenseId;
  }

  cancelDelete(event: MouseEvent) {
    event.stopPropagation();
    this.confirmingDeleteId = null;
  }

  confirmDelete(expenseId: number, event: MouseEvent) {
    event.stopPropagation();
    this.deletingExpenseId = expenseId;

    this.http.delete<any>(`${this.apiUrl}/${this.groupId}/expenses/${expenseId}`, { headers: this.headers() })
      .subscribe({
        next: () => {
          this.deletingExpenseId = null;
          this.confirmingDeleteId = null;
          this.expandedExpenseId = null;
          this.expenseDeleted.emit();
        },
        error: () => {
          this.deletingExpenseId = null;
        }
      });
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  formatCreatedAt(isoStr: string): string {
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

}
