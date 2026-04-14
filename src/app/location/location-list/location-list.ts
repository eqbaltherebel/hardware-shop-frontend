import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { LocationService, Location } from '../../services/location';
import { LocationFormDialogComponent } from './location-form-dialog';
import { DeleteConfirmDialogComponent } from './location-delete-dialog';

@Component({
  selector: 'app-location-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatDialogModule,
    MatSnackBarModule, MatTooltipModule, MatChipsModule
  ],
  templateUrl: './location-list.html',
  styleUrls: ['./location-list.scss']
})
export class LocationListComponent implements OnInit {

  locations: Location[] = [];
  displayedColumns = ['aisle', 'rack', 'shelf', 'notes', 'itemCount', 'actions'];
  isLoading = true;

  constructor(
    private locationService: LocationService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadLocations();
  }

  loadLocations(): void {
    this.isLoading = true;
    this.locationService.getAll().subscribe({
      next: (data) => { this.locations = data; this.isLoading = false; },
      error: () => { this.snackBar.open('Failed to load locations', 'Close', { duration: 3000 }); this.isLoading = false; }
    });
  }

  openForm(location?: Location): void {
    const dialogRef = this.dialog.open(LocationFormDialogComponent, {
      width: '460px',
      data: location || null
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadLocations();
    });
  }

  onDelete(location: Location): void {
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      width: '380px',
      data: { name: `Aisle ${location.aisle} · Rack ${location.rack} · ${location.shelf}`, itemCount: location.itemCount }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.locationService.delete(location.id!).subscribe({
          next: () => {
            this.snackBar.open('Location deleted', 'Close', { duration: 3000 });
            this.loadLocations();
          },
          error: (err) => {
            this.snackBar.open(err?.error?.error || 'Cannot delete location', 'Close', { duration: 4000 });
          }
        });
      }
    });
  }
}