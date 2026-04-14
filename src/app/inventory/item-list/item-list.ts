import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ItemService } from '../../services/item';
import { Item } from '../../models/item.model';
import { DeleteConfirmDialogComponent } from './delete-confirm-dialog.component';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatInputModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatDialogModule, MatSnackBarModule,
    MatTooltipModule, MatBadgeModule
  ],
  templateUrl: './item-list.html',
  styleUrls: ['./item-list.scss']
})
export class ItemList implements OnInit {

  displayedColumns = ['name', 'category', 'location', 'quantity', 'buyingPrice', 'sellingPrice', 'actions'];
  dataSource = new MatTableDataSource<Item>();
  searchQuery = '';
  lowStockCount = 0;
  isLoading = true;
  private searchSubject = new Subject<string>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private itemService: ItemService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadItems();

    // Debounce search — waits 400ms after typing stops
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(query => {
      if (query.trim()) {
        this.itemService.search(query).subscribe(items => {
          this.dataSource.data = items;
        });
      } else {
        this.loadItems();
      }
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadItems(): void {
    this.isLoading = true;
    this.itemService.getAll().subscribe({
      next: (items) => {
        this.dataSource.data = items;
        this.lowStockCount = items.filter(i => i.quantity <= 5).length;
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load items', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  onSearch(query: string): void {
    this.searchSubject.next(query);
  }

  onDelete(item: Item): void {
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      width: '380px',
      data: { name: item.name }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.itemService.delete(item.id!).subscribe({
          next: () => {
            this.snackBar.open(`"${item.name}" deleted successfully`, 'Close',
              { duration: 3000, panelClass: 'snack-success' });
            this.loadItems();
          },
          error: () => {
            this.snackBar.open('Failed to delete item', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  isLowStock(quantity: number): boolean {
    return quantity <= 5;
  }

  getProfit(item: Item): number {
    return item.sellingPrice - item.buyingPrice;
  }
}