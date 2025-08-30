import { Routes } from '@angular/router';

export const mediaRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./media').then(m => m.Media),
  },
];
