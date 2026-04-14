import { Routes } from '@angular/router';
import { ItemList } from './item-list/item-list';
import { ItemForm } from './item-form/item-form';
import { PriceHistoryComponent } from './price-history/price-history';

export const INVENTORY_ROUTES: Routes = [
  { path: '', component: ItemList },
  { path: 'new', component: ItemForm },
  { path: 'edit/:id', component: ItemForm },
  { path: 'price-history/:id', component: PriceHistoryComponent }
];
