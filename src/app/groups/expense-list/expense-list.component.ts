import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
  @Output() expenseDeleted = new EventEmitter<void>();
  @Output() expenseUpdated = new EventEmitter<void>();

  expandedExpenseId: number | null = null;
  confirmingDeleteId: number | null = null;
  deletingExpenseId: number | null = null;
  editingExpense: any | null = null;

  private readonly apiUrl = 'https://localhost:7032/api/groups';

  constructor(private http: HttpClient) {}

  headers() {
    const token = localStorage.getItem('token') ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getExpenseBalance(expense: any): number {
    const myMember = this.members.find(m => m.memberId === this.currentUserId);
    const myGroupMemberId = myMember?.id ?? -1;
    const myShare = expense.shares
      .find((s: any) => s.groupMemberId === myGroupMemberId)?.amount ?? 0;
    return expense.paidByGroupMemberId === myGroupMemberId
      ? expense.totalAmount - myShare
      : -myShare;
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
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  formatCreatedAt(isoStr: string): string {
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

}
