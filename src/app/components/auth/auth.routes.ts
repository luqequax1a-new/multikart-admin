import { Routes } from '@angular/router';

export const auth: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login').then(m => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register').then(m => m.Register),
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./forgot-password/forgot-password').then(m => m.ForgotPassword),
  },
  {
    path: 'otp',
    loadComponent: () => import('./otp/otp').then(m => m.Otp),
  },
  {
    path: 'update-password',
    loadComponent: () => import('./update-password/update-password').then(m => m.UpdatePassword),
  },
];
