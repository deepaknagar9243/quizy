import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layouts/user-layout/user-layout.component').then(m => m.UserLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'quiz/live',
        loadComponent: () => import('./quiz/live/live-quiz.component').then(m => m.LiveQuizComponent)
      },
      {
        path: 'leaderboard',
        loadComponent: () => import('./leaderboard/leaderboard.component').then(m => m.LeaderboardComponent)
      },
      {
        path: 'wallet',
        loadComponent: () => import('./wallet/wallet.component').then(m => m.WalletComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent)
      }
    ]
  },
  {
    path: 'admin',
    loadComponent: () => import('./layouts/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'quizzes',
        loadComponent: () => import('./admin/quizzes/admin-quizzes.component').then(m => m.AdminQuizzesComponent)
      },
      {
        path: 'questions',
        loadComponent: () => import('./admin/questions/admin-questions.component').then(m => m.AdminQuestionsComponent)
      }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
