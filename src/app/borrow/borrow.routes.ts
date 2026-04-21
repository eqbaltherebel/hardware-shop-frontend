import { Routes } from '@angular/router';
import { BorrowDashboard }
  from './borrow-dashboard/borrow-dashboard';
import { BorrowList }
  from './borrow-list/borrow-list';
import { BorrowDetail }
  from './borrow-detail/borrow-detail';
import { LedgerView }
  from './ledger-view/ledger-view';

export const BORROW_ROUTES: Routes = [
  { path: '',              component: BorrowDashboard},
  { path: 'list',          component: BorrowList     },
  { path: 'entry/:id',     component: BorrowDetail   },
  { path: 'ledger/:id',    component: LedgerView     }
];