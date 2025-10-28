import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.config').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'user',
    loadChildren: () => import('./features/user/user.config').then(m => m.USER_ROUTES)
  },
  {
    path: '',
    redirectTo: '/auth',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/auth'
  }
];
