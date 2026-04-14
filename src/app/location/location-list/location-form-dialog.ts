import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LocationService, Location } from '../../services/location';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-location-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule,
    MatButtonModule,
    MatIconModule, MatSnackBarModule
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>
        <mat-icon>{{ isEdit ? 'edit' : 'add_location' }}</mat-icon>
        {{ isEdit ? 'Edit Location' : 'Add New Location' }}
      </h2>

      <mat-dialog-content>
        <form [formGroup]="form">
          <div class="row-fields">
            <mat-form-field appearance="outline">
              <mat-label>Aisle *</mat-label>
              <input matInput formControlName="aisle"
                     placeholder="e.g. A" maxlength="5">
              <mat-hint>Single letter like A, B, C</mat-hint>
              <mat-error *ngIf="form.get('aisle')?.hasError('required')">Required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Rack *</mat-label>
              <input matInput formControlName="rack" placeholder="e.g. 1, 2">
              <mat-error *ngIf="form.get('rack')?.hasError('required')">Required</mat-error>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Shelf *</mat-label>
            <mat-select formControlName="shelf">
              <mat-option value="Top">Top</mat-option>
              <mat-option value="Middle">Middle</mat-option>
              <mat-option value="Bottom">Bottom</mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('shelf')?.hasError('required')">Required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Notes (optional)</mat-label>
            <textarea matInput formControlName="notes"
                      placeholder="e.g. Near main entrance, Heavy items"
                      rows="2"></textarea>
          </mat-form-field>

          <div class="preview" *ngIf="form.get('aisle')?.value">
            <mat-icon>place</mat-icon>
            <span>
              Aisle <strong>{{ form.get('aisle')?.value?.toUpperCase() }}</strong>
              · Rack <strong>{{ form.get('rack')?.value || '?' }}</strong>
              · <strong>{{ form.get('shelf')?.value || '?' }}</strong>
            </span>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-stroked-button mat-dialog-close>Cancel</button>
        <button mat-raised-button color="primary"
                (click)="onSave()" [disabled]="isSaving">
          <mat-icon>{{ isEdit ? 'save' : 'add' }}</mat-icon>
          {{ isEdit ? 'Update' : 'Create' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container { padding: 8px; min-width: 400px; }
    h2 { display: flex; align-items: center; gap: 10px; font-size: 20px; }
    mat-dialog-content { padding-top: 16px !important; }
    .row-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .full-width { width: 100%; margin-top: 8px; }
    .preview {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #eff6ff;
      color: #1d4ed8;
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 14px;
      margin-top: 4px;
      mat-icon { font-size: 18px; height: 18px; width: 18px; }
    }
    mat-dialog-actions { gap: 10px; padding: 16px 0 8px !important; }
  `]
})
export class LocationFormDialogComponent implements OnInit {

  form!: FormGroup;
  isEdit = false;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private locationService: LocationService,
    private dialogRef: MatDialogRef<LocationFormDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: Location | null
  ) {}

  ngOnInit(): void {
    this.isEdit = !!this.data;
    this.form = this.fb.group({
      aisle: [this.data?.aisle || '', Validators.required],
      rack:  [this.data?.rack  || '', Validators.required],
      shelf: [this.data?.shelf || '', Validators.required],
      notes: [this.data?.notes || '']
    });
  }

  onSave(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSaving = true;

    const request$ = this.isEdit
      ? this.locationService.update(this.data!.id!, this.form.value)
      : this.locationService.create(this.form.value);

    request$.subscribe({
      next: () => {
        this.snackBar.open(
          this.isEdit ? 'Location updated!' : 'Location created!',
          'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.snackBar.open(err?.error?.error || 'Failed to save', 'Close', { duration: 3000 });
        this.isSaving = false;
      }
    });
  }
}