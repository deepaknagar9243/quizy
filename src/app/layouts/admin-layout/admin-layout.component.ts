import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex h-screen overflow-hidden bg-slate-100">
      <aside class="hidden lg:flex w-64 flex-col flex-shrink-0 border-r border-slate-200 bg-white">
        <div class="flex flex-col h-full">
          <div class="p-5 border-b border-slate-200">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                <span class="text-white font-bold text-base">A</span>
              </div>
              <div>
                <div class="text-slate-800 font-bold text-base">Admin Panel</div>
                <div class="text-red-600 text-xs">QuizArena</div>
              </div>
            </div>
          </div>

          <nav class="flex-1 p-4 space-y-1">
            <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-3">Management</div>

            <a routerLink="/admin/dashboard" routerLinkActive="active" class="sidebar-link">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
              </svg>
              Dashboard
            </a>

            <a routerLink="/admin/quizzes" routerLinkActive="active" class="sidebar-link">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              Manage Quizzes
            </a>

            <a routerLink="/admin/questions" routerLinkActive="active" class="sidebar-link">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Manage Questions
            </a>

            <a routerLink="/admin/payments" routerLinkActive="active" class="sidebar-link">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a4 4 0 00-8 0v2M5 11h14l-1 9H6l-1-9z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 15h6"/>
              </svg>
              Payments & Rewards
            </a>

            <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 pt-4 mb-3">Navigation</div>

            <a routerLink="/dashboard" class="sidebar-link">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Back to App
            </a>
          </nav>

          <div class="p-4 border-t border-slate-200">
            <button class="sidebar-link w-full text-red-500 hover:text-red-600 hover:bg-red-50" (click)="logout()">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header class="h-16 flex items-center px-6 border-b border-slate-200 bg-white">
          <div class="flex items-center gap-3">
            <span class="text-slate-500 text-sm">Admin</span>
            <span class="text-slate-300">/</span>
            <span class="text-slate-800 font-semibold text-sm">Management Console</span>
          </div>
          <div class="ml-auto flex items-center gap-3">
            <span class="px-2 py-1 rounded bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">ADMIN</span>
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-bold text-xs">A</div>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class AdminLayoutComponent {
  constructor(private auth: AuthService) {}
  logout() { this.auth.logout(); }
}
