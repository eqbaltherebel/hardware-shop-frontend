import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule,
         FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { BorrowService } from '../../services/borrow';
import { CustomerService } from '../../services/customer';
import { BorrowEntryResponse } from '../../models/borrow.model';
import { Customer } from '../../models/customer.model';
import { BorrowFormDialog } from './borrow-form-dialog';

@Component({
  selector: 'app-borrow-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatDatepickerModule,
    MatNativeDateModule, MatDialogModule, MatSnackBarModule,
    MatTooltipModule, MatChipsModule
  ],
  templateUrl: './borrow-list.html',
  styleUrls: ['./borrow-list.scss']
})
export class BorrowList implements OnInit {

  entries: BorrowEntryResponse[] = [];
  filtered: BorrowEntryResponse[] = [];
  isLoading = false;
  filterStatus = 'ALL';

  constructor(
    private borrowService: BorrowService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();
    // Auto-open form if ?new=true
    this.route.queryParams.subscribe(p => {
      if (p['new']) this.openForm();
    });
  }

  load(): void {
    this.isLoading = false;
    this.borrowService.getAll().subscribe({
      next: e => {
        this.entries = e;
        this.applyFilter();
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilter(): void {
    if (this.filterStatus === 'ALL') {
      this.filtered = this.entries;
    } else {
      this.filtered = this.entries.filter(
        e => e.status === this.filterStatus);
    }
  }

  onFilter(status: string): void {
    this.filterStatus = status;
    this.applyFilter();
  }

  openForm(entry?: BorrowEntryResponse): void {
    const ref = this.dialog.open(BorrowFormDialog, {
      width: '540px',
      data: entry || null
    });
    ref.afterClosed().subscribe(saved => {
      if (saved) this.load();
    });
  }

  openDetail(id: number): void {
    this.router.navigate(['/borrow/entry', id]);
  }

  softDelete(e: BorrowEntryResponse, event: MouseEvent): void {
    event.stopPropagation();
    const reason = prompt('Reason for deleting this entry?');
    if (reason === null) return;
    this.borrowService.softDelete(e.id, reason || 'Deleted').subscribe({
      next: () => {
        this.snackBar.open('Entry deleted', 'Close',
          { duration: 3000 });
        this.load();
      }
    });
  }

  getProgressPct(e: BorrowEntryResponse): number {
    if (!e.totalAmount) return 0;
    return Math.min((e.amountPaid / e.totalAmount) * 100, 100);
  }
}