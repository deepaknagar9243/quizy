import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-slate-200 bg-white">
      <button class="lg:hidden text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100" (click)="menuToggle.emit()">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>

      <div class="hidden lg:block">
        <h1 class="text-slate-800 font-semibold text-base">{{ title }}</h1>
      </div>

      <div class="flex items-center gap-3 ml-auto">
        <!-- Wallet Balance -->
        <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200">
          <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span class="text-green-700 text-sm font-semibold">₹{{ user()?.walletBalance?.toLocaleString('en-IN') }}</span>
        </div>

        <!-- Notifications -->
        <button class="relative p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100" (click)="toggleNotifications()">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
          @if (state.unreadCount() > 0) {
            <span class="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
              {{ state.unreadCount() > 9 ? '9+' : state.unreadCount() }}
            </span>
          }
        </button>

        <!-- Notification Dropdown -->
        @if (showNotifications) {
          <div class="absolute top-16 right-4 w-80 glass-card shadow-xl z-50 overflow-hidden">
            <div class="p-4 border-b border-slate-200 flex items-center justify-between">
              <span class="text-slate-800 font-semibold text-sm">Notifications</span>
              <button class="text-xs text-red-500 hover:text-red-600" (click)="markAllRead()">Mark all read</button>
            </div>
            <div class="max-h-72 overflow-y-auto divide-y divide-slate-100">
              @if (state.notifications().length === 0) {
                <div class="p-6 text-center text-muted text-sm">No notifications</div>
              }
              @for (n of state.notifications().slice(0, 10); track n.id) {
                <div class="p-3 flex items-start gap-3" [class]="n.read ? 'opacity-60' : ''">
                  <span class="text-lg flex-shrink-0">{{ getNotifIcon(n.type) }}</span>
                  <div class="flex-1 min-w-0">
                    <div class="text-slate-800 text-xs font-semibold">{{ n.title }}</div>
                    <div class="text-muted text-xs mt-0.5 truncate">{{ n.message }}</div>
                  </div>
                  @if (!n.read) {
                    <span class="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1"></span>
                  }
                </div>
              }
            </div>
          </div>
        }

        <!-- Avatar -->
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-bold text-xs cursor-pointer">
          {{ user()?.avatar }}
        </div>
      </div>
    </header>
  `
})
export class NavbarComponent {
  @Input() title = 'Dashboard';
  @Output() menuToggle = new EventEmitter<void>();

  showNotifications = false;
  user = this.auth.currentUser;

  constructor(public auth: AuthService, public state: StateService) {}

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) this.state.markAllRead();
  }

  markAllRead() { this.state.markAllRead(); }

  getNotifIcon(type: string): string {
    const m: Record<string, string> = { prize: '🏆', deposit: '💰', withdrawal: '↑', quiz: '🎯', system: '🔔' };
    return m[type] || '🔔';
  }
}
