import { Routes } from '@angular/router';

export const unitsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./units').then(m => m.Units),
  },
  {
    path: 'create',
    loadComponent: () => import('./create-units/create-units').then(m => m.CreateUnits),
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./edit-units/edit-units').then(m => m.EditUnits),
  },
];