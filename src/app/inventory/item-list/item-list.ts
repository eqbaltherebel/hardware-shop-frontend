import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
import { Observable, of, Subject, catchError, debounceTime, distinctUntilChanged, finalize, timeout } from 'rxjs';
import { ItemService } from '../../services/item';
import { Item } from '../../models/item.model';
import { DeleteConfirmDialogComponent } from './delete-confirm-dialog.component';

@Component({
  selector: 'app-item-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
export class ItemList implements OnInit, OnDestroy {

  dataSource = new MatTableDataSource<Item>();
  pagedItems$: Observable<Item[]> = of([]);

  searchQuery = '';
  lowStockCount = 0;
  isLoading = true;
  private searchSubject = new Subject<string>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private itemService: ItemService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadItems();

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(query => {
      if (query.trim()) {
        this.itemService.search(query).subscribe({
          next: (items) => {
            this.dataSource.data = Array.isArray(items) ? [...items] : [];
            this.cdr.detectChanges();
          },
          error: () => { this.dataSource.data = []; this.cdr.detectChanges(); }
        });
      } else {
        this.loadItems();
      }
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.pagedItems$ = this.dataSource.connect() as Observable<Item[]>;
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.dataSource.disconnect();
  }

  loadItems(): void {
    this.itemService.getAll().pipe(
      timeout(10000),
      catchError(() => {
        this.snackBar.open('Failed to load items. Please check your server.', 'Close', { duration: 4000 });
        return of([] as Item[]);
      }),
      finalize(() => { this.isLoading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: (items) => {
        const normalized = Array.isArray(items) ? items : [];
        this.dataSource.data = [...normalized];
        this.lowStockCount = normalized.filter(i => i.quantity <= 5).length;
        this.cdr.detectChanges();
      }
    });
  }

  onSearch(query: string): void { this.searchSubject.next(query); }

  onDelete(item: Item): void {
    this.dialog.open(DeleteConfirmDialogComponent, { width: '380px', data: { name: item.name } })
      .afterClosed().subscribe(confirmed => {
        if (confirmed) {
          this.itemService.delete(item.id!).subscribe({
            next: () => {
              this.snackBar.open(`"${item.name}" deleted`, 'Close', { duration: 3000, panelClass: 'snack-success' });
              this.loadItems();
            },
            error: () => this.snackBar.open('Failed to delete item', 'Close', { duration: 3000 })
          });
        }
      });
  }

  isLowStock(qty: number): boolean { return qty <= 5; }
  getProfit(item: Item): number { return item.sellingPrice - item.buyingPrice; }
}
