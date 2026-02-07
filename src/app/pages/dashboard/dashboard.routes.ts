import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => 
      import('./pages/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'new-session',
    loadComponent: () =>
      import('../new-session/new-session.component').then((m) => m.NewSessionComponent),
  },
  {
    path: 'session/:id',
    loadComponent: () =>
      import('../session-detail/session-detail.component').then(
        (m) => m.SessionDetailComponent,
      ),
  },
  {
    path: 'history',
    loadComponent: () =>
      import('../history/history.component').then((m) => m.HistoryComponent),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('../settings/settings.component').then((m) => m.SettingsComponent),
  },
//   {
//     path: 'stats',
//     loadComponent: () =>
//       import('./stats/stats.component').then((m) => m.StatsComponent),
//   }
];