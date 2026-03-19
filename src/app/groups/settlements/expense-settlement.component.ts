import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-expense-settlement',
  templateUrl: './expense-settlement.component.html',
  styleUrls: ['./expense-settlement.component.css']
})
export class ExpenseSettlementComponent implements OnInit {

  groupId: number = 0;
  expenseId: number = 0;

  expense: any = null;
  members: any[] = [];
  myGroupMemberId: number = -1;

  settlementsMap: { [shareId: number]: any[] | undefined } = {};
  loadingPage: boolean = true;

  settleUpShareId: number | null = null;
  settleUpAmount: number | null = null;
  settleUpDate: string = '';
  submitting: boolean = false;
  settlementError: string = '';

  editingSettlement: any | null = null;
  editAmount: number | null = null;
  editDate: string = '';
  editError: string = '';
  editSubmitting: boolean = false;

  confirmingDeleteId: number | null = null;
  deletingId: number | null = null;
  expandedHistoryShareId: number | null = null;

  private readonly apiBase = environment.apiBaseUrl;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.groupId = Number(this.route.snapshot.paramMap.get('groupId'));
    this.expenseId = Number(this.route.snapshot.paramMap.get('expenseId'));
    this.loadPageData();
  }

  headers(): HttpHeaders {
    const token = localStorage.getItem('token') ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  loadPageData(): void {
    const currentUserId = Number(localStorage.getItem('userId'));

    forkJoin({
      members: this.http.get<any>(`${this.apiBase}/groups/${this.groupId}/members`, { headers: this.headers() }),
      expense: this.http.get<any>(`${this.apiBase}/groups/${this.groupId}/expenses/${this.expenseId}`, { headers: this.headers() })
    }).subscribe({
      next: ({ members, expense }) => {
        this.members = members.data ?? [];
        const myMember = this.members.find((m: any) => m.memberId === currentUserId);
        this.myGroupMemberId = myMember?.id ?? -1;

        this.expense = expense.data ?? null;

        if (!this.expense) {
          this.loadingPage = false;
          return;
        }

        const shareRequests = (this.expense.shares as any[]).map((share: any) =>
          this.http.get<any>(`${this.apiBase}/expense-shares/${share.id}/settlements`, { headers: this.headers() })
        );

        if (shareRequests.length === 0) {
          this.loadingPage = false;
          return;
        }

        forkJoin(shareRequests).subscribe({
          next: (results: any[]) => {
            (this.expense.shares as any[]).forEach((share: any, i: number) => {
              this.settlementsMap[share.id] = results[i].data ?? [];
            });
            this.loadingPage = false;
          },
          error: () => {
            this.loadingPage = false;
          }
        });
      },
      error: () => {
        this.loadingPage = false;
      }
    });
  }

  computeRemaining(shareAmount: number, settlements: any[]): number {
    const totalPaid = settlements.reduce((sum: number, s: any) => sum + s.amount, 0);
    return shareAmount - totalPaid;
  }

  computeProgressPercent(shareAmount: number, settlements: any[]): number {
    if (shareAmount <= 0) return 0;
    const totalPaid = settlements.reduce((sum: number, s: any) => sum + s.amount, 0);
    return Math.min(100, Math.round((totalPaid / shareAmount) * 100));
  }

  isMyShare(share: any): boolean {
    return share.groupMemberId === this.myGroupMemberId;
  }

  iAmCreditor(): boolean {
    return this.expense?.paidByGroupMemberId === this.myGroupMemberId;
  }

  isCreditorOwnShare(share: any): boolean {
    return share.groupMemberId === this.expense?.paidByGroupMemberId;
  }

  getMemberName(groupMemberId: number): string {
    const member = this.members.find((m: any) => m.id === groupMemberId);
    return member ? `${member.firstName} ${member.lastName}` : 'Unknown';
  }

  formatDate(isoStr: string): string {
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  openSettleUp(shareId: number): void {
    this.settleUpShareId = shareId;
    this.settleUpAmount = null;
    const now = new Date();
    this.settleUpDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    this.settlementError = '';
    this.editingSettlement = null;
  }

  closeSettleUp(): void {
    this.settleUpShareId = null;
    this.settleUpAmount = null;
    this.settleUpDate = '';
    this.settlementError = '';
  }

  submitSettleUp(share: any): void {
    const amount = this.settleUpAmount;
    if (!amount || amount <= 0) {
      this.settlementError = 'Amount must be greater than 0.';
      return;
    }
    const settlements = this.settlementsMap[share.id] ?? [];
    const remaining = this.computeRemaining(share.amount, settlements);
    if (amount > remaining) {
      this.settlementError = `Amount cannot exceed ₹${remaining.toFixed(2)}.`;
      return;
    }

    this.submitting = true;
    this.settlementError = '';

    this.http.post<any>(
      `${this.apiBase}/expense-shares/${share.id}/settlements`,
      { amount, settlementDate: this.settleUpDate },
      { headers: this.headers() }
    ).subscribe({
      next: (res) => {
        this.settlementsMap[share.id] = [...(this.settlementsMap[share.id] ?? []), res.data];
        this.submitting = false;
        this.closeSettleUp();
      },
      error: (err) => {
        const msg = err?.error?.errors?.[0]?.message ?? 'Something went wrong. Please try again.';
        this.settlementError = msg;
        this.submitting = false;
      }
    });
  }

  openEdit(settlement: any, shareId: number): void {
    this.editingSettlement = { ...settlement, shareId };
    this.editAmount = settlement.amount;
    this.editDate = settlement.settlementDate ?? '';
    this.editError = '';
    this.settleUpShareId = null;
  }

  closeEdit(): void {
    this.editingSettlement = null;
    this.editAmount = null;
    this.editDate = '';
    this.editError = '';
  }

  submitEdit(share: any): void {
    if (!this.editAmount || this.editAmount <= 0) {
      this.editError = 'Amount must be greater than 0.';
      return;
    }
    const shareId = share.id;
    const otherSettlements = (this.settlementsMap[shareId] ?? []).filter(
      (s: any) => s.id !== this.editingSettlement.id
    );
    const maxAllowed = this.computeRemaining(share.amount, otherSettlements);
    if (this.editAmount > maxAllowed) {
      this.editError = `Amount cannot exceed ₹${maxAllowed.toFixed(2)}.`;
      return;
    }

    this.editSubmitting = true;
    this.editError = '';

    this.http.patch<any>(
      `${this.apiBase}/settlements/${this.editingSettlement.id}`,
      { amount: this.editAmount, settlementDate: this.editDate || null },
      { headers: this.headers() }
    ).subscribe({
      next: (res) => {
        this.settlementsMap[shareId] = (this.settlementsMap[shareId] ?? []).map(
          (s: any) => s.id === this.editingSettlement.id ? res.data : s
        );
        this.editSubmitting = false;
        this.closeEdit();
      },
      error: (err) => {
        const errType = err?.error?.errors?.[0]?.type;
        if (errType === 'Forbidden') {
          this.editError = 'You can only edit settlements you created.';
        } else {
          this.editError = err?.error?.errors?.[0]?.message ?? 'Something went wrong. Please try again.';
        }
        this.editSubmitting = false;
      }
    });
  }

  requestDeleteSettlement(settlementId: number): void {
    this.confirmingDeleteId = settlementId;
  }

  cancelDeleteSettlement(): void {
    this.confirmingDeleteId = null;
  }

  deleteSettlement(settlementId: number, shareId: number): void {
    this.deletingId = settlementId;

    this.http.delete<any>(
      `${this.apiBase}/settlements/${settlementId}`,
      { headers: this.headers() }
    ).subscribe({
      next: () => {
        this.settlementsMap[shareId] = (this.settlementsMap[shareId] ?? []).filter(
          (s: any) => s.id !== settlementId
        );
        this.deletingId = null;
        this.confirmingDeleteId = null;
      },
      error: () => {
        this.deletingId = null;
        this.confirmingDeleteId = null;
      }
    });
  }

  toggleHistory(shareId: number): void {
    this.expandedHistoryShareId = this.expandedHistoryShareId === shareId ? null : shareId;
  }

  sortedSettlements(shareId: number): any[] {
    return [...(this.settlementsMap[shareId] ?? [])].sort((a, b) =>
      new Date(b.settlementDate).getTime() - new Date(a.settlementDate).getTime()
    );
  }

  sortedShares(): any[] {
    if (!this.expense?.shares) return [];
    return [...this.expense.shares].sort((a: any, b: any) => {
      const aIsCreditor = a.groupMemberId === this.expense.paidByGroupMemberId ? 0 : 1;
      const bIsCreditor = b.groupMemberId === this.expense.paidByGroupMemberId ? 0 : 1;
      if (aIsCreditor !== bIsCreditor) return aIsCreditor - bIsCreditor;
      const aIsMe = a.groupMemberId === this.myGroupMemberId ? 0 : 1;
      const bIsMe = b.groupMemberId === this.myGroupMemberId ? 0 : 1;
      return aIsMe - bIsMe;
    });
  }

  back(): void {
    this.router.navigate(['/dashboard/groups/details', this.groupId]);
  }
}
