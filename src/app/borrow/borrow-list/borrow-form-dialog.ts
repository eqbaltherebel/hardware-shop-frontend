import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder,
         FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA,
         MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BorrowService } from '../../services/borrow';
import { CustomerService } from '../../services/customer';
import { BorrowEntryResponse } from '../../models/borrow.model';
import { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-borrow-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule,
    MatDatepickerModule, MatNativeDateModule, MatSnackBarModule
  ],
  template: `
    <div class="dialog-wrap">
      <h2 mat-dialog-title>
        <mat-icon>{{ isEdit ? 'edit' : 'add_circle' }}</mat-icon>
        {{ isEdit ? 'Edit Credit Entry' : 'New Credit Entry' }}
      </h2>

      <mat-dialog-content>
        <form [formGroup]="form">

          <mat-form-field appearance="outline" class="full">
            <mat-label>Customer *</mat-label>
            <mat-icon matPrefix>person</mat-icon>
            <mat-select formControlName="customerId">
              <mat-option *ngFor="let c of customers"
                          [value]="c.id">
                {{ c.name }}
                <span *ngIf="c.phone"> — {{ c.phone }}</span>
              </mat-option>
            </mat-select>
            <mat-error>Customer is required</mat-error>
          </mat-form-field>

          <div class="row-fields">
            <mat-form-field appearance="outline">
              <mat-label>Total Amount (₹) *</mat-label>
              <span matPrefix>₹&nbsp;</span>
              <input matInput type="number"
                     formControlName="totalAmount"
                     min="0.01" step="0.01">
              <mat-error>Enter a valid amount</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Borrow Date *</mat-label>
              <input matInput [matDatepicker]="borrowPicker"
                     formControlName="borrowDate">
              <mat-datepicker-toggle matSuffix
                [for]="borrowPicker">
              </mat-datepicker-toggle>
              <mat-datepicker #borrowPicker></mat-datepicker>
            </mat-form-field>
          </div>

          <div class="row-fields">
            <mat-form-field appearance="outline">
              <mat-label>Due Date (optional)</mat-label>
              <input matInput [matDatepicker]="duePicker"
                     formControlName="dueDate">
              <mat-datepicker-toggle matSuffix
                [for]="duePicker">
              </mat-datepicker-toggle>
              <mat-datepicker #duePicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Credit Limit (₹)</mat-label>
              <span matPrefix>₹&nbsp;</span>
              <input matInput type="number"
                     formControlName="creditLimit" min="0">
              <mat-hint>0 = no limit</mat-hint>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full">
            <mat-label>Description</mat-label>
            <input matInput formControlName="description"
                   placeholder="e.g. Cement bags, Hardware tools">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full">
            <mat-label>Tags</mat-label>
            <input matInput formControlName="tags"
                   placeholder="e.g. trusted, regular, bulk">
            <mat-hint>Comma-separated tags</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full">
            <mat-label>Notes</mat-label>
            <textarea matInput formControlName="notes"
                      rows="2"
                      placeholder="Any remarks...">
            </textarea>
          </mat-form-field>

        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-stroked-button mat-dialog-close>
          Cancel
        </button>
        <button mat-raised-button color="primary"
                (click)="onSave()" [disabled]="isSaving">
          <mat-icon>{{ isEdit ? 'save' : 'add' }}</mat-icon>
          {{ isEdit ? 'Update' : 'Create Entry' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-wrap { padding: 8px; min-width: 480px; }
    h2 { display: flex; align-items: center;
          gap: 10px; font-size: 20px; }
    mat-dialog-content { padding-top: 16px !important; }
    .full { width: 100%; margin-bottom: 10px; }
    .row-fields {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 14px; margin-bottom: 10px;
      mat-form-field { width: 100%; }
    }
    mat-dialog-actions {
      gap: 10px; padding: 16px 0 8px !important;
    }
  `]
})
export class BorrowFormDialog implements OnInit {

  form!: FormGroup;
  customers: Customer[] = [];
  isEdit = false;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private borrowService: BorrowService,
    private customerService: CustomerService,
    private dialogRef: MatDialogRef<BorrowFormDialog>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: BorrowEntryResponse | null
  ) {}

  ngOnInit(): void {
    this.isEdit = !!this.data;
    this.customerService.getAll().subscribe(
      c => this.customers = c);

    this.form = this.fb.group({
      customerId:   [this.data?.customerId || null,
                    Validators.required],
      totalAmount:  [this.data?.totalAmount || '',
                    [Validators.required, Validators.min(0.01)]],
      borrowDate:   [this.data?.borrowDate
                    ? new Date(this.data.borrowDate) : new Date(),
                    Validators.required],
      dueDate:      [this.data?.dueDate
                    ? new Date(this.data.dueDate) : null],
      description:  [this.data?.description || ''],
      notes:        [this.data?.notes || ''],
      tags:         [this.data?.tags || ''],
      creditLimit:  [this.data?.creditLimit || 0]
    });
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const v = this.form.value;

    const payload = {
      customerId:  v.customerId,
      totalAmount: v.totalAmount,
      borrowDate:  this.formatDate(v.borrowDate),
      dueDate:     v.dueDate ? this.formatDate(v.dueDate) : null,
      description: v.description || null,
      notes:       v.notes || null,
      tags:        v.tags || null,
      creditLimit: v.creditLimit || null
    };

    const req$ = this.isEdit
      ? this.borrowService.update(this.data!.id, payload)
      : this.borrowService.create(payload);

    req$.subscribe({
      next: () => {
        this.snackBar.open(
          this.isEdit ? 'Entry updated!' : 'Entry created!',
          'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: err => {
        this.snackBar.open(
          err?.error?.error || 'Failed to save',
          'Close', { duration: 4000 });
        this.isSaving = false;
      }
    });
  }

  private formatDate(date: Date): string {
    return date instanceof Date
      ? date.toISOString().split('T')[0]
      : date;
  }
}