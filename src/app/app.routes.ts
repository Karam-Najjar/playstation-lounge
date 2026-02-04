import { Routes } from '@angular/router';
import { pinGuard } from './guards/pin.guard';

export const routes: Routes = [
  {
    path: 'pin',
    loadComponent: () => import('./pages/pin/pin.component').then((m) => m.PinComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [pinGuard],
  },
  {
    path: 'new-session',
    loadComponent: () =>
      import('./pages/new-session/new-session.component').then((m) => m.NewSessionComponent),
    canActivate: [pinGuard],
  },
  {
    path: 'session/:id',
    loadComponent: () =>
      import('./pages/session-detail/session-detail.component').then(
        (m) => m.SessionDetailComponent,
      ),
    canActivate: [pinGuard],
  },
  {
    path: 'history',
    loadComponent: () =>
      import('./pages/history/history.component').then((m) => m.HistoryComponent),
    canActivate: [pinGuard],
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings/settings.component').then((m) => m.SettingsComponent),
    canActivate: [pinGuard],
  },
];
