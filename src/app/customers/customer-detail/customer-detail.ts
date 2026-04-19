import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CustomerService } from '../../services/customer';
import { Customer } from '../../models/customer.model';
import { SaleResponse } from '../../models/sale.model';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatButtonModule, MatIconModule,
    MatTableModule, MatDividerModule,
    MatSnackBarModule, MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './customer-detail.html',
  styleUrls: ['./customer-detail.scss']
})
export class CustomerDetail implements OnInit {

  customer: Customer | null = null;
  isLoading = false; 

  saleColumns = [
    'invoice', 'date', 'items',
    'total', 'profit', 'payment', 'status', 'action'
  ];

  constructor(
    private customerService: CustomerService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
     private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.loadCustomer(id);
  }

  loadCustomer(id: number): void {
    this.isLoading = false;
    this.customerService.getSalesHistory(id).subscribe({
      next: c => { this.customer = c; this.isLoading = false; 
        this.cdr.detectChanges();
      },
      error: () => {
        this.snackBar.open('Failed to load customer',
          'Close', { duration: 3000 });
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goToSale(saleId: number): void {
    this.router.navigate(['/sales', saleId]);
  }

  get avgOrderValue(): number {
    if (!this.customer?.totalPurchases
        || this.customer.totalPurchases === 0) return 0;
    return (this.customer.totalSpent || 0)
           / this.customer.totalPurchases;
  }
}