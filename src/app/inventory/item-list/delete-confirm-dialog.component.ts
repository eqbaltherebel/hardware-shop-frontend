import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-delete-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialog-wrap">
      <mat-icon color="warn" class="warn-icon">delete_forever</mat-icon>
      <h2 mat-dialog-title>Delete Item?</h2>
      <mat-dialog-content>
        <p>Are you sure you want to delete <strong>"{{ data.name }}"</strong>?</p>
        <p class="sub">This action cannot be undone.</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-stroked-button mat-dialog-close>Cancel</button>
        <button mat-raised-button color="warn" [mat-dialog-close]="true">
          <mat-icon>delete</mat-icon> Delete
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-wrap { padding: 8px 8px 0; text-align: center; }
    .warn-icon { font-size: 48px; height: 48px; width: 48px; margin-bottom: 8px; }
    h2 { margin: 0 0 8px; }
    .sub { color: #999; font-size: 13px; margin-top: 4px; }
    mat-dialog-actions { padding: 16px 0 8px; gap: 8px; }
  `]
})
export class DeleteConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { name: string }
  ) {}
}