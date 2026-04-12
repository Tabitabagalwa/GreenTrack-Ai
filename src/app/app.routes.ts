import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard)
  },
  {
    path: 'report',
    loadComponent: () => import('./report/report').then(m => m.Report)
  },
  {
    path: 'map',
    loadComponent: () => import('./map/map').then(m => m.Map)
  },
  {
    path: 'leaderboard',
    loadComponent: () => import('./leaderboard/leaderboard').then(m => m.Leaderboard)
  }
];
