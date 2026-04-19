import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SaleService } from '../../services/sale';
import { SaleResponse } from '../../models/sale.model';

@Component({
  selector: 'app-sale-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatSnackBarModule, MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './sale-list.html',
  styleUrls: ['./sale-list.scss']
})
export class SaleList implements OnInit {

  sales: SaleResponse[] = [];
  isLoading = false;
  displayedColumns = [
    'invoice', 'customer', 'items',
    'total', 'profit', 'payment',
    'status', 'date', 'actions'
  ];

  constructor(
    private saleService: SaleService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSales();
  }

  loadSales(): void {
  this.saleService.getAll().subscribe({
    next: (res: any) => {
      console.log('API Response:', res);

      this.sales = Array.isArray(res)
        ? res
        : res?.data ?? [];

      this.isLoading = false;
      this.cdr.detectChanges();
    },
    error: () => {
      this.snackBar.open('Failed to load sales', 'Close', {
        duration: 3000
      });
      this.isLoading = false;
    }
  });
}

  cancelSale(sale: SaleResponse): void {
    if (!confirm(`Cancel sale ${sale.invoiceNumber}? Stock will be restored.`))
      return;

    this.saleService.cancelSale(sale.id).subscribe({
      next: () => {
        this.snackBar.open('Sale cancelled. Stock restored.', 'Close',
          { duration: 3000 });
        this.loadSales();
      },
      error: (err) => this.snackBar.open(
        err?.error?.error || 'Failed to cancel',
        'Close', { duration: 3000 })
    });
  }

  get todayRevenue(): number {
    const today = new Date().toDateString();
    return this.sales
      .filter(s => s.status === 'COMPLETED' &&
                   new Date(s.saleDate).toDateString() === today)
      .reduce((sum, s) => sum + s.totalAmount, 0);
  }

  get todayProfit(): number {
    const today = new Date().toDateString();
    return this.sales
      .filter(s => s.status === 'COMPLETED' &&
                   new Date(s.saleDate).toDateString() === today)
      .reduce((sum, s) => sum + s.profit, 0);
  }
}