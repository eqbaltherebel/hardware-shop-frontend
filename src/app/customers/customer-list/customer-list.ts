import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { CustomerService } from '../../services/customer';
import { Customer } from '../../models/customer.model';
import { CustomerFormDialog } from './customer-form-dialog';

@Component({
  selector: 'app-customer-list',
  standalone: true, 
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule,
    MatTableModule, MatSnackBarModule,
    MatTooltipModule, MatDialogModule
  ],
  templateUrl: './customer-list.html',
  styleUrls: ['./customer-list.scss']
})
export class CustomerList implements OnInit {

  customers: Customer[] = [];
  isLoading = false;
  searchQuery = '';
  private searchSubject = new Subject<string>();

  displayedColumns = [
    'name', 'phone', 'address',
    'purchases', 'spent', 'lastPurchase', 'actions'
  ];

  constructor(
    private customerService: CustomerService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAll();

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(q => {
      if (q.trim()) {
        this.customerService.search(q).subscribe({
          next: c => this.customers = c
        });
      } else {
        this.loadAll();
      }
    });
  }

  loadAll(): void {
    this.isLoading = false;
    this.customerService.getAll().subscribe({
      next: c => 
        { 
          console.log('API Response:', c);
          this.customers = c; 
          console.log('Customers Loaded:', this.customers);
          console.log('First Customer:', this.customers[0]);
          this.isLoading = false; 
          this.cdr.detectChanges();

        },
      error: () => {
        this.snackBar.open('Failed to load customers',
          'Close', { duration: 3000 });
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearch(q: string): void {
    this.searchSubject.next(q);
  }

  goToDetail(id: number): void {
    this.router.navigate(['/customers', id]);
  }

  openForm(customer?: Customer): void {
    const ref = this.dialog.open(CustomerFormDialog, {
      width: '480px',
      data: customer || null
    });
    ref.afterClosed().subscribe(saved => {
      if (saved) this.loadAll();
    });
  }

  deleteCustomer(c: Customer, event: MouseEvent): void {
    event.stopPropagation();
    if (!confirm(`Delete customer "${c.name}"?`)) return;
    this.customerService.delete(c.id!).subscribe({
      next: () => {
        this.snackBar.open('Customer deleted', 'Close',
          { duration: 3000 });
        this.loadAll();
      },
      error: err => this.snackBar.open(
        err?.error?.error || 'Cannot delete customer',
        'Close', { duration: 3000 })
    });
  }
}