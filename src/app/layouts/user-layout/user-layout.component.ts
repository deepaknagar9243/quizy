import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, NavbarComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-slate-100">
      <!-- Desktop Sidebar -->
      <aside class="hidden lg:flex w-64 flex-col flex-shrink-0 border-r border-slate-200 bg-white">
        <app-sidebar></app-sidebar>
      </aside>

      <!-- Mobile Sidebar Overlay -->
      @if (sidebarOpen()) {
        <div class="fixed inset-0 z-40 lg:hidden">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="sidebarOpen.set(false)"></div>
          <aside class="absolute left-0 top-0 h-full w-64 bg-white border-r border-slate-200 z-50">
            <app-sidebar (navClick)="sidebarOpen.set(false)"></app-sidebar>
          </aside>
        </div>
      }

      <!-- Main Content -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <app-navbar (menuToggle)="sidebarOpen.set(!sidebarOpen())"></app-navbar>
        <main class="flex-1 overflow-y-auto p-4 lg:p-6">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class UserLayoutComponent {
  sidebarOpen = signal(false);
}
