import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder,
         FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BorrowService } from '../../services/borrow';
import {
  BorrowEntryResponse,
  BorrowPaymentResponse
} from '../../models/borrow.model';

@Component({
  selector: 'app-borrow-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatDatepickerModule,
    MatNativeDateModule, MatTableModule, MatSnackBarModule,
    MatDividerModule, MatProgressBarModule
  ],
  templateUrl: './borrow-detail.html',
  styleUrls: ['./borrow-detail.scss']
})
export class BorrowDetail implements OnInit {

  entry: BorrowEntryResponse | null = null;
  isLoading = false;
  showPaymentForm = false;
  isSaving = false;
  editingPayment: BorrowPaymentResponse | null = null;
  paymentForm!: FormGroup;

  paymentColumns = [
    'date', 'amount', 'method', 'notes', 'actions'
  ];

  constructor(
    private borrowService: BorrowService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.load(id);
    this.buildPaymentForm();
  }

  buildPaymentForm(payment?: BorrowPaymentResponse): void {
    this.paymentForm = this.fb.group({
      amount:        [payment?.amount || '',
                     [Validators.required, Validators.min(0.01)]],
      paymentDate:   [payment?.paymentDate
                     ? new Date(payment.paymentDate) : new Date(),
                     Validators.required],
      paymentMethod: [payment?.paymentMethod || 'CASH'],
      notes:         [payment?.notes || '']
    });
  }

  load(id: number): void {
    this.isLoading = false;
    this.borrowService.getById(id).subscribe({
      next: e => { 
        this.entry = e; 
        this.isLoading = false;
        this.cdr.detectChanges();
       }
    });
  }

  openPaymentForm(payment?: BorrowPaymentResponse): void {
    this.editingPayment = payment || null;
    this.buildPaymentForm(payment);
    this.showPaymentForm = true;
  }

  cancelPaymentForm(): void {
    this.showPaymentForm = false;
    this.editingPayment = null;
  }

  submitPayment(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const v = this.paymentForm.value;
    const payload = {
      amount:        v.amount,
      paymentDate:   this.fmtDate(v.paymentDate),
      paymentMethod: v.paymentMethod,
      notes:         v.notes || null
    };

    const req$ = this.editingPayment
      ? this.borrowService.updatePayment(
          this.editingPayment.id, payload)
      : this.borrowService.addPayment(this.entry!.id, payload);

    req$.subscribe({
      next: updated => {
        this.entry = updated;
        this.showPaymentForm = false;
        this.editingPayment = null;
        this.isSaving = false;
        this.snackBar.open(
          this.editingPayment
            ? 'Payment updated!' : 'Payment recorded!',
          'Close', { duration: 3000 });
      },
      error: err => {
        this.snackBar.open(
          err?.error?.error || 'Failed',
          'Close', { duration: 3000 });
        this.isSaving = false;
      }
    });
  }

  deletePayment(p: BorrowPaymentResponse): void {
    if (!confirm('Delete this payment? Balance will be updated.'))
      return;
    this.borrowService.deletePayment(p.id).subscribe({
      next: updated => {
        this.entry = updated;
        this.snackBar.open('Payment deleted',
          'Close', { duration: 3000 });
      }
    });
  }

  get progressPct(): number {
    if (!this.entry?.totalAmount) return 0;
    return Math.min(
      (this.entry.amountPaid / this.entry.totalAmount) * 100, 100);
  }

  private fmtDate(d: Date): string {
    return d instanceof Date
      ? d.toISOString().split('T')[0] : d;
  }
}