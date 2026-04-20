import { Routes } from '@angular/router';
import { CustomerList } from './customer-list/customer-list';
import { CustomerDetail } from './customer-detail/customer-detail';

export const CUSTOMER_ROUTES: Routes = [
  { path: '',    component: CustomerList  },
  { path: ':id', component: CustomerDetail }
];