import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface MemberSplit {
  id: number;
  firstName: string;
  lastName: string;
  included: boolean;
  amount: number;
  percent: number;
}

@Component({
  selector: 'app-edit-expense',
  templateUrl: './edit-expense.component.html',
  styleUrls: ['./edit-expense.component.css']
})
export class EditExpenseComponent implements OnInit {

  @Input() expense: any;
  @Input() groupId: number = 0;
  @Input() members: any[] = [];
  @Output() expenseUpdated = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  description: string = '';
  totalAmount: number | null = null;
  expenseDate: string = '';
  paidByGroupMemberId: number | null = null;
  splitType: 'equal' | 'amount' | 'percent' = 'amount';
  memberSplits: MemberSplit[] = [];
  submitting: boolean = false;
  errorMessage: string = '';

  private readonly apiUrl = `${environment.apiBaseUrl}/groups`;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.description = this.expense.description;
    this.totalAmount = this.expense.totalAmount;
    this.expenseDate = this.expense.expenseDate;
    this.paidByGroupMemberId = this.expense.paidByGroupMemberId;

    this.memberSplits = this.members.map(m => {
      const share = this.expense.shares.find((s: any) => s.groupMemberId === m.id);
      return {
        id: m.id,
        firstName: m.firstName,
        lastName: m.lastName,
        included: !!share,
        amount: share?.amount ?? 0,
        percent: 0
      };
    });
  }

  headers() {
    const token = localStorage.getItem('token') ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  onPayerChange(id: number) {
    this.paidByGroupMemberId = id;
  }

  getIncludedMembers(): MemberSplit[] {
    return this.memberSplits.filter(m => m.included);
  }

  getEqualAmountDisplay(): number {
    const included = this.getIncludedMembers();
    if (!this.totalAmount || included.length === 0) return 0;
    return parseFloat((this.totalAmount / included.length).toFixed(2));
  }

  getAmountFromPercent(percent: number): number {
    if (!this.totalAmount) return 0;
    return parseFloat((percent / 100 * this.totalAmount).toFixed(2));
  }

  getSplitAmountSum(): number {
    return parseFloat(
      this.getIncludedMembers().reduce((s, m) => s + (m.amount || 0), 0).toFixed(2)
    );
  }

  getPercentSum(): number {
    return parseFloat(
      this.getIncludedMembers().reduce((s, m) => s + (m.percent || 0), 0).toFixed(2)
    );
  }

  isAmountSumValid(): boolean {
    if (!this.totalAmount) return true;
    return Math.abs(this.getSplitAmountSum() - this.totalAmount) <= 0.01;
  }

  isPercentSumValid(): boolean {
    return Math.abs(this.getPercentSum() - 100) <= 0.01;
  }

  validate(): string | null {
    if (!this.description.trim()) return 'Description is required.';
    if (!this.totalAmount || this.totalAmount <= 0) return 'Total amount must be greater than 0.';
    if (!this.expenseDate) return 'Expense date is required.';
    if (!this.paidByGroupMemberId) return 'Please select who paid.';

    const included = this.getIncludedMembers();
    if (included.length === 0) return 'At least one member must be included in the split.';

    if (this.splitType === 'amount') {
      const sum = this.getSplitAmountSum();
      if (Math.abs(sum - this.totalAmount) > 0.01) {
        return `Share amounts must sum to ₹${this.totalAmount.toFixed(2)}. Current total: ₹${sum.toFixed(2)}`;
      }
    }

    if (this.splitType === 'percent') {
      const sum = this.getPercentSum();
      if (Math.abs(sum - 100) > 0.01) {
        return `Percentages must sum to 100%. Current total: ${sum.toFixed(2)}%`;
      }
    }

    return null;
  }

  buildShares(): { groupMemberId: number; amount: number }[] {
    const included = this.getIncludedMembers();

    if (this.splitType === 'equal') {
      const count = included.length;
      const perPerson = parseFloat((this.totalAmount! / count).toFixed(2));
      const distributed = parseFloat((perPerson * count).toFixed(2));
      const diff = parseFloat((this.totalAmount! - distributed).toFixed(2));
      return included.map((m, i) => ({
        groupMemberId: m.id,
        amount: i === 0 ? parseFloat((perPerson + diff).toFixed(2)) : perPerson
      }));
    }

    if (this.splitType === 'amount') {
      return included.map(m => ({
        groupMemberId: m.id,
        amount: parseFloat((m.amount || 0).toFixed(2))
      }));
    }

    return included.map(m => ({
      groupMemberId: m.id,
      amount: this.getAmountFromPercent(m.percent || 0)
    }));
  }

  onSubmit() {
    this.errorMessage = '';
    const error = this.validate();
    if (error) {
      this.errorMessage = error;
      return;
    }

    this.submitting = true;
    const payload = {
      description: this.description.trim(),
      totalAmount: this.totalAmount,
      paidByGroupMemberId: this.paidByGroupMemberId,
      expenseDate: this.expenseDate,
      shares: this.buildShares()
    };

    this.http.put<any>(
      `${this.apiUrl}/${this.groupId}/expenses/${this.expense.id}`,
      payload,
      { headers: this.headers() }
    ).subscribe({
      next: () => {
        this.submitting = false;
        this.expenseUpdated.emit();
        this.close.emit();
      },
      error: err => {
        this.submitting = false;
        if (err.error?.errors?.[0]?.message) {
          this.errorMessage = err.error.errors[0].message;
        } else {
          this.errorMessage = 'Failed to update expense. Please try again.';
        }
      }
    });
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }

}
