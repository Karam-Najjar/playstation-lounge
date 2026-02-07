import { Routes } from '@angular/router';
import { pinGuard } from './guards/pin.guard';

export const routes: Routes = [
  {
    path: 'pin',
    loadComponent: () => import('./pages/pin/pin.component').then((m) => m.PinComponent),
  },
  {
    path: '',
    loadChildren: () => import('./pages/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
    canActivate: [pinGuard],
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];