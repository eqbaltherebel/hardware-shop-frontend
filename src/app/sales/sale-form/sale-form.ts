import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { debounceTime } from 'rxjs';
import { ItemService } from '../../services/item';
import { SaleService } from '../../services/sale';
import { Item } from '../../models/item.model';
import { CustomerService } from '../../services/customer';
import { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-sale-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatAutocompleteModule,
    MatTableModule,
    MatCardModule,
  ],
  templateUrl: './sale-form.html',
  styleUrls: ['./sale-form.scss'],
})
export class SaleForm implements OnInit {
  form!: FormGroup;
  allItems: Item[] = [];
  filteredItems: Item[] = [];
  isSaving = false;
  searchQuery = '';
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  selectedCustomer: Customer | null = null;
  customerSearchQuery = '';

  constructor(
    private fb: FormBuilder,
    private itemService: ItemService,
    private saleService: SaleService,
    private router: Router,
    private snackBar: MatSnackBar,
    private customerService: CustomerService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.customerService.getAll().subscribe((c) => (this.customers = c));
    this.loadItems();
  }

  buildForm(): void {
    this.form = this.fb.group({
      customerName: [''],
      customerPhone: [''],
      paymentMethod: ['CASH', Validators.required],
      notes: [''],
      items: this.fb.array([]),
    });
  }

  loadItems(): void {
    this.itemService.getAll().subscribe((items) => {
      this.allItems = items.filter((i) => i.quantity > 0);
      this.filteredItems = this.allItems;
    });
  }

  get itemsArray(): FormArray {
    return this.form.get('items') as FormArray;
  }

  // Search items to add
  onSearch(query: string): void {
    this.filteredItems = this.allItems.filter((i) =>
      i.name.toLowerCase().includes(query.toLowerCase()),
    );
  }

  // Add item to sale cart
  addItem(item: Item): void {
    // Check if already in cart
    const existing = this.itemsArray.controls.findIndex((c) => c.get('itemId')?.value === item.id);

    if (existing >= 0) {
      // Increment quantity
      const qty = this.itemsArray.at(existing).get('quantity');
      const newQty = (qty?.value || 0) + 1;
      if (newQty > item.quantity) {
        this.snackBar.open(`Only ${item.quantity} in stock`, 'Close', { duration: 2000 });
        return;
      }
      qty?.setValue(newQty);
    } else {
      // Add new row
      this.itemsArray.push(
        this.fb.group({
          itemId: [item.id],
          itemName: [item.name],
          itemPhotoUrl: [item.photoUrl],
          sellingPrice: [item.sellingPrice],
          buyingPrice: [item.buyingPrice],
          stock: [item.quantity],
          quantity: [1, [Validators.required, Validators.min(1), Validators.max(item.quantity)]],
        }),
      );
    }

    this.searchQuery = '';
    this.filteredItems = this.allItems;
  }

  removeItem(index: number): void {
    this.itemsArray.removeAt(index);
  }

  updateQty(index: number, delta: number): void {
    const control = this.itemsArray.at(index);
    const current = control.get('quantity')?.value || 0;
    const max = control.get('stock')?.value || 0;
    const newQty = current + delta;

    if (newQty < 1) {
      this.removeItem(index);
      return;
    }
    if (newQty > max) {
      this.snackBar.open(`Only ${max} in stock`, 'Close', { duration: 2000 });
      return;
    }
    control.get('quantity')?.setValue(newQty);
  }

  // Totals
  get totalAmount(): number {
    return this.itemsArray.controls.reduce(
      (sum, c) => sum + (c.get('sellingPrice')?.value * c.get('quantity')?.value || 0),
      0,
    );
  }

  get totalProfit(): number {
    return this.itemsArray.controls.reduce((sum, c) => {
      const qty = c.get('quantity')?.value || 0;
      const sell = c.get('sellingPrice')?.value || 0;
      const buy = c.get('buyingPrice')?.value || 0;
      return sum + (sell - buy) * qty;
    }, 0);
  }

  onCustomerSearch(q: string): void {
    if (!q.trim()) {
      this.filteredCustomers = [];
      this.selectedCustomer = null;
      return;
    }
    this.filteredCustomers = this.customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q.toLowerCase()) ||
        (c.phone || '').includes(q) ||
        (c.address || '').toLowerCase().includes(q.toLowerCase()),
    );
  }

  selectCustomer(c: Customer): void {
    this.selectedCustomer = c;
    this.customerSearchQuery = c.name;
    this.filteredCustomers = [];
    // Pre-fill customer fields in form
    this.form.patchValue({
      customerName: c.name,
      customerPhone: c.phone || '',
    });
  }

  clearCustomer(): void {
    this.selectedCustomer = null;
    this.customerSearchQuery = '';
    this.form.patchValue({
      customerName: '',
      customerPhone: '',
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.itemsArray.length === 0) {
      if (this.itemsArray.length === 0) {
        this.snackBar.open('Add at least one item to sell', 'Close', { duration: 3000 });
      }
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    const payload = {
      customerId: this.selectedCustomer?.id ?? null,
      customerName: this.form.value.customerName || null,
      customerPhone: this.form.value.customerPhone || null,
      paymentMethod: this.form.value.paymentMethod,
      notes: this.form.value.notes || null,
      items: this.itemsArray.controls.map((c) => ({
        itemId: c.get('itemId')?.value,
        quantity: c.get('quantity')?.value,
      })),
    };
    
    this.saleService.createSale(payload).subscribe({
      next: (sale) => {
        this.snackBar.open(`Sale ${sale.invoiceNumber} completed! ₹${sale.totalAmount}`, 'Close', {
          duration: 4000,
        });
        this.router.navigate(['/sales']);
      },
      error: (err) => {
        this.snackBar.open(err?.error?.error || 'Failed to complete sale', 'Close', {
          duration: 4000,
        });
        this.isSaving = false;
      },
    });
  }
}
