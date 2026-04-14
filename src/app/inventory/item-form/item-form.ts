import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { ItemService } from '../../services/item';
import { LocationService } from '../../services/location';
import { CategoryService } from '../../services/category';
import { Location, Category } from '../../models/item.model';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatSnackBarModule,
    MatProgressSpinnerModule, MatDividerModule
  ],
  templateUrl: './item-form.html',
  styleUrls: ['./item-form.scss']
})
export class ItemForm implements OnInit {

  form!: FormGroup;
  locations: Location[] = [];
  categories: Category[] = [];
  isEditMode = false;
  editId: number | null = null;
  isLoading = false;
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private itemService: ItemService,
    private locationService: LocationService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadDropdowns();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.editId = +id;
      this.loadItem(+id);
    }
  }

  buildForm(): void {
    this.form = this.fb.group({
      name:         ['', [Validators.required, Validators.minLength(2)]],
      description:  [''],
      quantity:     [0,  [Validators.required, Validators.min(0)]],
      buyingPrice:  [0,  [Validators.required, Validators.min(0)]],
      sellingPrice: [0,  [Validators.required, Validators.min(0)]],
      locationId:   [null],
      categoryId:   [null]
    });

    // Auto-validate: selling price must be >= buying price
    this.form.get('buyingPrice')?.valueChanges.subscribe(() => {
      this.form.get('sellingPrice')?.updateValueAndValidity();
    });
  }

  loadDropdowns(): void {
    this.locationService.getAll().subscribe(locs => this.locations = locs);
    this.categoryService.getAll().subscribe(cats => this.categories = cats);
  }

  loadItem(id: number): void {
    this.isLoading = true;
    this.itemService.getById(id).subscribe({
      next: (item) => {
        this.form.patchValue({
          name:         item.name,
          description:  item.description,
          quantity:     item.quantity,
          buyingPrice:  item.buyingPrice,
          sellingPrice: item.sellingPrice,
          locationId:   item.location?.id ?? null,
          categoryId:   item.category?.id ?? null
        });
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load item', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const payload = this.form.value;

    const request$ = this.isEditMode
      ? this.itemService.update(this.editId!, payload)
      : this.itemService.create(payload);

    request$.subscribe({
      next: () => {
        this.snackBar.open(
          this.isEditMode ? 'Item updated!' : 'Item created!',
          'Close', { duration: 3000, panelClass: 'snack-success' }
        );
        this.router.navigate(['/items']);
      },
      error: () => {
        this.snackBar.open('Failed to save item', 'Close', { duration: 3000 });
        this.isSaving = false;
      }
    });
  }

  // Helper getters for template validation messages
  get nameError() {
    const c = this.form.get('name');
    if (c?.hasError('required')) return 'Name is required';
    if (c?.hasError('minlength')) return 'Minimum 2 characters';
    return '';
  }

  get profitPreview(): number {
    const buy  = this.form.get('buyingPrice')?.value || 0;
    const sell = this.form.get('sellingPrice')?.value || 0;
    return sell - buy;
  }
}