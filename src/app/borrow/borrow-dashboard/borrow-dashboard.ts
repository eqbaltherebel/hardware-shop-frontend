import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { BorrowService } from '../../services/borrow';
import {
  BorrowSummaryResponse,
  BorrowEntryResponse,
  CustomerCreditSummary
} from '../../models/borrow.model';

@Component({
  selector: 'app-borrow-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatButtonModule, MatIconModule,
    MatTableModule, MatSnackBarModule,
    MatTooltipModule, MatFormFieldModule, MatInputModule
  ],
  templateUrl: './borrow-dashboard.html',
  styleUrls: ['./borrow-dashboard.scss']
})
export class BorrowDashboard implements OnInit {

  summary: BorrowSummaryResponse | null = null;
  overdueEntries: BorrowEntryResponse[] = [];
  searchResults: BorrowEntryResponse[] = [];
  isLoading = false;
  searchQuery = '';
  activeTab: 'summary' | 'overdue' | 'search' = 'summary';
  Math = Math;

  private searchSubject = new Subject<string>();

  custColumns = [
    'customer', 'borrowed', 'paid',
    'outstanding', 'limit', 'status', 'actions'
  ];

  overdueColumns = [
    'customer', 'amount', 'dueDate', 'overdueDays', 'actions'
  ];

  constructor(
    private borrowService: BorrowService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(q => {
      if (q.trim()) {
        this.activeTab = 'search';
        this.borrowService.search(q).subscribe(
          r => this.searchResults = r);
      } else {
        this.activeTab = 'summary';
        this.searchResults = [];
      }
    });
  }

  load(): void {
    this.isLoading = false;
    this.borrowService.getSummary().subscribe({
      next: s => { 
        this.summary = s;
        this.isLoading = false; 
        this.cdr.detectChanges();
      }
    });
    this.borrowService.getOverdue().subscribe(
      r => this.overdueEntries = r);
  }

  onSearch(q: string): void {
    this.searchSubject.next(q);
  }

  overdueDays(due: string): number {
    const diff = new Date().getTime()
                 - new Date(due).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'CLEAR':   return 'status-clear';
      case 'OVERDUE': return 'status-overdue';
      default:        return 'status-pending';
    }
  }
}