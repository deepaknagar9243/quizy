import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, SidebarComponent, NavbarComponent],
  template: `
    <div class="flex h-screen h-dvh overflow-hidden bg-slate-100">

      <!-- Desktop Sidebar -->
      <aside class="hidden lg:flex w-64 flex-col flex-shrink-0 border-r border-slate-200 bg-white">
        <app-sidebar></app-sidebar>
      </aside>

      <!-- Mobile Sidebar Overlay -->
      @if (sidebarOpen()) {
        <div class="fixed inset-0 z-40 lg:hidden">
          <div class="absolute inset-0 bg-black/50" (click)="sidebarOpen.set(false)"></div>
          <aside class="absolute left-0 top-0 h-full w-72 bg-white border-r border-slate-200 z-50 shadow-xl">
            <app-sidebar (navClick)="sidebarOpen.set(false)"></app-sidebar>
          </aside>
        </div>
      }

      <!-- Main -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <app-navbar (menuToggle)="sidebarOpen.set(!sidebarOpen())"></app-navbar>
        <main class="flex-1 overflow-y-auto p-4 lg:p-6 mobile-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>

    <!-- Mobile Bottom Navigation -->
    <nav class="bottom-nav lg:hidden">
      <a routerLink="/dashboard" routerLinkActive="active" class="bottom-nav-item">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg>
        Home
      </a>
      <a routerLink="/quiz/live" routerLinkActive="active" class="bottom-nav-item">
        <div class="relative">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span class="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </div>
        Play
      </a>
      <a routerLink="/leaderboard" routerLinkActive="active" class="bottom-nav-item">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>
        Ranks
      </a>
      <a routerLink="/wallet" routerLinkActive="active" class="bottom-nav-item">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
        </svg>
        Wallet
      </a>
      <a routerLink="/referrals" routerLinkActive="active" class="bottom-nav-item">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 8a3 3 0 11-2.83-2M6 8a3 3 0 102.83-2M12 14a4 4 0 00-4 4v1h8v-1a4 4 0 00-4-4z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13a4 4 0 014 4v1h-3M7 13a4 4 0 00-4 4v1h3"/>
        </svg>
        Refer
      </a>
      <a routerLink="/profile" routerLinkActive="active" class="bottom-nav-item">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
        Profile
      </a>
    </nav>
  `
})
export class UserLayoutComponent {
  sidebarOpen = signal(false);
}
