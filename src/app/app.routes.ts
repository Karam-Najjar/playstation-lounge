import { Routes } from '@angular/router';
import { pinGuard } from './guards/pin.guard';
import { LayoutComponent } from './layout/layout/layout.component';

export const routes: Routes = [
  {
    path: 'pin',
    loadComponent: () => import('./applications/pin/pin.component').then((m) => m.PinComponent),
  },
  {
    path: '',
    component: LayoutComponent,
    loadChildren: () => import('./applications/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
    canActivate: [pinGuard],
  },
  {
    path: 'history',
    component: LayoutComponent,
    loadChildren: () => import('./applications/history/history.routes').then(m => m.HISTORY_ROUTES),
    canActivate: [pinGuard],
  },
  {
    path: 'settings',
    component: LayoutComponent,
    loadChildren: () => import('./applications/settings/settings.routes').then(m => m.SETTINGS_ROUTES),
    canActivate: [pinGuard],
  },
  {
    path: 'new-session',
    component: LayoutComponent,
    loadChildren: () => import('./applications/new-session/new-session.routes').then(m => m.NEW_SESSION_ROUTES),
    canActivate: [pinGuard],
  },
  {
    path: 'session/:id',
    component: LayoutComponent,
    loadChildren: () => import('./applications/session-details/session-details.routes').then(m => m.SESSION_DETAILS_ROUTES),
    canActivate: [pinGuard],
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];