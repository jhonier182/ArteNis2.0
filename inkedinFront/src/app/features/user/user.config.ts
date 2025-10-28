import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const USER_ROUTES: Routes = [
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'profile',
    pathMatch: 'full'
  }
];
