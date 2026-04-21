import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BorrowService } from '../../services/borrow';
import { LedgerResponse } from '../../models/borrow.model';

@Component({
  selector: 'app-ledger-view',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatButtonModule, MatIconModule,
    MatTableModule, MatSnackBarModule
  ],
  templateUrl: './ledger-view.html',
  styleUrls: ['./ledger-view.scss']
})
export class LedgerView implements OnInit {

  ledger: LedgerResponse | null = null;
  isLoading = false;

  columns = ['date', 'type', 'description', 'borrow', 'paid', 'balance'];

  constructor(
    private borrowService: BorrowService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.borrowService.getLedger(id).subscribe({
      next: l => { 
        this.ledger = l; 
        this.isLoading = false;
        this.cdr.detectChanges();

      },
      error: () => {
        this.snackBar.open('Failed to load ledger',
          'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }
}