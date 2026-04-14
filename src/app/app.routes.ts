import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { ShellComponent } from './shell/shell';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES) },
      { path: 'items',     loadChildren: () => import('./inventory/inventory.routes').then(m => m.INVENTORY_ROUTES) },
      { path: 'locations', loadChildren: () => import('./location/location.routes').then(m => m.LOCATION_ROUTES) },
    ]
  },
  { path: '**', redirectTo: 'login' }
];