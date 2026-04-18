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

  // Photo state
  selectedPhoto: File | null = null;
  photoPreviewUrl: string | null = null;
  existingPhotoUrl: string | null = null;
  removeExistingPhoto = false;

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
  }

  loadDropdowns(): void {
    this.locationService.getAll().subscribe({
      next: locs => this.locations = locs,
      error: () => this.snackBar.open('Failed to load locations', 'Close',
        { duration: 3000 })
    });

    this.categoryService.getAll().subscribe({
      next: cats => this.categories = cats,
      error: () => this.snackBar.open('Failed to load categories', 'Close',
        { duration: 3000 })
    });
  }

  loadItem(id: number): void {


  this.itemService.getById(id).subscribe({
    next: (item) => {
      console.log('API response:', item);

     

      if (!item) {
        throw new Error('Invalid response');
      }

      this.form.patchValue({
        name:         item.name,
        description:  item.description || '',
        quantity:     item.quantity,
        buyingPrice:  item.buyingPrice,
        sellingPrice: item.sellingPrice,
        locationId:   item.locationId ?? null,
        categoryId:   item.categoryId ?? null
      });

      if (item.photoUrl) {
        this.existingPhotoUrl = item.photoUrl;
      }

      this.isLoading = false; // ✅ IMPORTANT
    },

    error: (err) => {
      console.error(err);
      this.snackBar.open('Failed to load item', 'Close', { duration: 3000 });
      this.isLoading = false; // ✅ IMPORTANT
    }
  });
}

  // ── Photo handlers ────────────────────────────────────────

  onPhotoSelected(event: Event | DragEvent): void {
    let file: File | null = null;

    // Handle both click-to-browse and drag-and-drop
    if (event instanceof DragEvent) {
      event.preventDefault();
      file = event.dataTransfer?.files?.[0] ?? null;
    } else {
      const input = event.target as HTMLInputElement;
      file = input.files?.[0] ?? null;
    }

    if (!file) return;

    // Validate type
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      this.snackBar.open('Only JPG, PNG or WEBP images allowed',
        'Close', { duration: 3000 });
      return;
    }

    // Validate size — 5MB
    if (file.size > 5 * 1024 * 1024) {
      this.snackBar.open('Image must be under 5MB',
        'Close', { duration: 3000 });
      return;
    }

    this.selectedPhoto = file;
    this.removeExistingPhoto = false;

    // Show local preview immediately — no upload yet
    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreviewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  clearSelectedPhoto(): void {
    this.selectedPhoto = null;
    this.photoPreviewUrl = null;
  }

  removePhoto(): void {
    this.removeExistingPhoto = true;
    this.existingPhotoUrl = null;
    this.selectedPhoto = null;
    this.photoPreviewUrl = null;
  }

  // ── Submit ────────────────────────────────────────────────

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const payload = this.form.value;

    if (this.isEditMode) {
      this.handleUpdate(payload);
    } else {
      this.handleCreate(payload);
    }
  }

  private handleCreate(payload: any): void {
    this.itemService.create(payload, this.selectedPhoto).subscribe({
      next: () => {
        this.snackBar.open('Item created!', 'Close', { duration: 3000 });
        this.router.navigate(['/items']);
      },
      error: (err) => {
        this.snackBar.open(
          err?.error?.error || 'Failed to create item',
          'Close', { duration: 3000 });
        this.isSaving = false;
      }
    });
  }

  private handleUpdate(payload: any): void {
    // Step 1: If user removed existing photo and didn't pick a new one
    //         → delete photo first, then update item without photo
    if (this.removeExistingPhoto && !this.selectedPhoto) {
      this.itemService.deletePhoto(this.editId!).subscribe({
        next: () => this.saveUpdate(payload),
        error: () => this.saveUpdate(payload) // still save even if photo delete fails
      });
    } else {
      // Step 2: Update item — include new photo if selected
      this.saveUpdate(payload);
    }
  }

  private saveUpdate(payload: any): void {
    this.itemService.update(
      this.editId!, payload, this.selectedPhoto
    ).subscribe({
      next: () => {
        this.snackBar.open('Item updated!', 'Close', { duration: 3000 });
        this.router.navigate(['/items']);
      },
      error: (err) => {
        this.snackBar.open(
          err?.error?.error || 'Failed to update item',
          'Close', { duration: 3000 });
        this.isSaving = false;
      }
    });
  }

  // ── Getters ───────────────────────────────────────────────

  get nameError(): string {
    const c = this.form.get('name');
    if (c?.hasError('required')) return 'Name is required';
    if (c?.hasError('minlength')) return 'Minimum 2 characters';
    return '';
  }

  get profitPreview(): number {
    const buy  = this.form.get('buyingPrice')?.value  || 0;
    const sell = this.form.get('sellingPrice')?.value || 0;
    return sell - buy;
  }

  get displayPhotoUrl(): string | null {
    if (this.photoPreviewUrl) return this.photoPreviewUrl;
    if (this.existingPhotoUrl && !this.removeExistingPhoto)
      return this.existingPhotoUrl;
    return null;
  }
}