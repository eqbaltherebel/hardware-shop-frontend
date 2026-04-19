import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder,
         FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA,
         MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CustomerService } from '../../services/customer';
import { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-customer-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule,
    MatIconModule, MatSnackBarModule
  ],
  template: `
    <div class="dialog-wrap">
      <h2 mat-dialog-title>
        <mat-icon>{{ isEdit ? 'edit' : 'person_add' }}</mat-icon>
        {{ isEdit ? 'Edit Customer' : 'Add New Customer' }}
      </h2>

      <mat-dialog-content>
        <form [formGroup]="form">

          <mat-form-field appearance="outline" class="full">
            <mat-label>Full Name *</mat-label>
            <mat-icon matPrefix>person</mat-icon>
            <input matInput formControlName="name"
                   placeholder="e.g. Rahul Kumar">
            <mat-error *ngIf="form.get('name')?.hasError('required')">
              Name is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full">
            <mat-label>Phone Number</mat-label>
            <mat-icon matPrefix>phone</mat-icon>
            <input matInput formControlName="phone"
                   placeholder="e.g. 9876543210"
                   maxlength="10">
            <mat-hint>Used to link all purchases together</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full">
            <mat-label>Address</mat-label>
            <mat-icon matPrefix>location_on</mat-icon>
            <textarea matInput formControlName="address"
                      placeholder="Street, Area, City..."
                      rows="2"></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full">
            <mat-label>Email (optional)</mat-label>
            <mat-icon matPrefix>email</mat-icon>
            <input matInput formControlName="email"
                   placeholder="email@example.com">
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
          {{ isEdit ? 'Update' : 'Add Customer' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-wrap { padding: 8px; min-width: 420px; }
    h2 { display: flex; align-items: center;
          gap: 10px; font-size: 20px; }
    mat-dialog-content { padding-top: 16px !important; }
    .full { width: 100%; margin-bottom: 8px; }
    mat-dialog-actions {
      gap: 10px; padding: 16px 0 8px !important;
    }
  `]
})
export class CustomerFormDialog implements OnInit {

  form!: FormGroup;
  isEdit = false;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private dialogRef: MatDialogRef<CustomerFormDialog>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: Customer | null
  ) {}

  ngOnInit(): void {
    this.isEdit = !!this.data;
    this.form = this.fb.group({
      name:    [this.data?.name    || '', Validators.required],
      phone:   [this.data?.phone   || ''],
      address: [this.data?.address || ''],
      email:   [this.data?.email   || '']
    });
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const request$ = this.isEdit
      ? this.customerService.update(this.data!.id!, this.form.value)
      : this.customerService.create(this.form.value);

    request$.subscribe({
      next: () => {
        this.snackBar.open(
          this.isEdit ? 'Customer updated!' : 'Customer added!',
          'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: err => {
        this.snackBar.open(
          err?.error?.error || 'Failed to save customer',
          'Close', { duration: 3000 });
        this.isSaving = false;
      }
    });
  }
}