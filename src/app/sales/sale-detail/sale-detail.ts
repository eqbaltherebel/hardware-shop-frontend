import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SaleService } from '../../services/sale';
import { SaleResponse, SaleItemResponse } from '../../models/sale.model';

@Component({
  selector: 'app-sale-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatButtonModule, MatIconModule,
    MatTableModule, MatDividerModule,
    MatSnackBarModule, MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './sale-detail.html',
  styleUrls: ['./sale-detail.scss']
})
export class SaleDetail implements OnInit {

  sale: SaleResponse | null = null;
  isLoading = false;
  isCancelling = false;

  itemColumns = [
    'photo', 'name', 'price',
    'qty', 'subtotal', 'profit'
  ];

  constructor(
    private saleService: SaleService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.loadSale(id);
  }

  loadSale(id: number): void {
    this.isLoading = false;
    this.saleService.getById(id).subscribe({
      next: (sale) => { 
        console.log('API Response:', sale);
        console.log('Sale Items:', sale?.invoiceNumber);
        this.sale = sale; 
        this.isLoading = false; 
        this.cdr.detectChanges();
      },
      error: () => {
        this.snackBar.open('Failed to load sale', 'Close',
          { duration: 3000 });
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancelSale(): void {
    if (!this.sale) return;
    if (!confirm(
      `Cancel ${this.sale.invoiceNumber}? Stock will be restored.`))
      return;

    this.isCancelling = true;
    this.saleService.cancelSale(this.sale.id).subscribe({
      next: (updated) => {
        this.sale = updated;
        this.isCancelling = false;
        this.snackBar.open('Sale cancelled. Stock restored.',
          'Close', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open(
          err?.error?.error || 'Failed to cancel',
          'Close', { duration: 3000 });
        this.isCancelling = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/sales']);
  }

  getPaymentIcon(method: string): string {
    switch (method) {
      case 'CASH': return 'payments';
      case 'UPI':  return 'qr_code';
      case 'CARD': return 'credit_card';
      default:     return 'payments';
    }
  }

  get profitClass(): string {
    return (this.sale?.profit ?? 0) >= 0 ? 'profit-pos' : 'profit-neg';
  }

  get profitMargin(): number {
    if (!this.sale || this.sale.totalAmount === 0) return 0;
    return (this.sale.profit / this.sale.totalAmount) * 100;
  }
}