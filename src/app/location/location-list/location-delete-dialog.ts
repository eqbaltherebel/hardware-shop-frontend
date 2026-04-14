import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-location-delete-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div style="padding:16px;text-align:center">
      <mat-icon color="warn" style="font-size:48px;height:48px;width:48px">
        delete_forever
      </mat-icon>
      <h2 mat-dialog-title>Delete Location?</h2>
      <mat-dialog-content>
        <p><strong>{{ data.name }}</strong></p>
        <p class="warn-text" *ngIf="data.itemCount > 0">
          ⚠️ {{ data.itemCount }} item(s) are stored here.<br>
          Reassign them before deleting.
        </p>
        <p *ngIf="data.itemCount === 0" style="color:#64748b;font-size:13px">
          This location has no items. Safe to delete.
        </p>
      </mat-dialog-content>
      <mat-dialog-actions align="center" style="gap:10px">
        <button mat-stroked-button mat-dialog-close>Cancel</button>
        <button mat-raised-button color="warn"
                [mat-dialog-close]="true"
                [disabled]="data.itemCount > 0">
          Delete
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`.warn-text { color: #b91c1c; font-size: 13px; margin-top: 8px; }`]
})
export class DeleteConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { name: string; itemCount: number }
  ) {}
}