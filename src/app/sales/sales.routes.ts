import { Routes } from '@angular/router';
import { SaleList } from './sale-list/sale-list';
import { SaleForm } from './sale-form/sale-form';
import { SaleReport } from './sale-report/sale-report';

export const SALES_ROUTES: Routes = [
  { path: '',         component: SaleList  },
  { path: 'new',      component: SaleForm  },
  { path: 'report',   component: SaleReport }
];