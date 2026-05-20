import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="h-14 flex items-center justify-between px-4 border-b border-slate-200 bg-white sticky top-0 z-30">

      <!-- Left: hamburger (mobile) or title (desktop) -->
      <div class="flex items-center gap-3">
        <button class="lg:hidden p-2 -ml-2 text-slate-500 rounded-lg" (click)="menuToggle.emit()">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
        <div class="flex items-center gap-2 lg:hidden">
          <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
            <span class="text-white font-bold text-xs">Q</span>
          </div>
          <span class="font-bold text-slate-800 text-sm">QuizArena</span>
        </div>
        <span class="hidden lg:block text-slate-800 font-semibold">{{ title }}</span>
      </div>

      <!-- Right -->
      <div class="flex items-center gap-2">
        <!-- Wallet (compact on mobile) -->
        <a routerLink="/wallet" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 border border-green-200 hover:bg-green-100 transition-colors">
          <span class="text-green-600 text-sm">₹</span>
          <span class="text-green-700 text-sm font-bold">{{ user()?.walletBalance?.toLocaleString('en-IN') }}</span>
        </a>

        <!-- Notifications -->
        <div class="relative">
          <button class="relative p-2 text-slate-500 rounded-xl hover:bg-slate-100 transition-colors" (click)="toggleNotif()">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            @if (state.unreadCount() > 0) {
              <span class="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold leading-none">
                {{ state.unreadCount() > 9 ? '9+' : state.unreadCount() }}
              </span>
            }
          </button>

          <!-- Dropdown -->
          @if (showNotif) {
            <div class="absolute right-0 top-12 w-80 glass-card shadow-xl z-50 overflow-hidden">
              <div class="p-3 border-b border-slate-100 flex items-center justify-between">
                <span class="text-slate-800 font-semibold text-sm">Notifications</span>
                <button class="text-xs text-red-500 font-medium" (click)="state.markAllRead()">Mark all read</button>
              </div>
              <div class="max-h-64 overflow-y-auto">
                @if (state.notifications().length === 0) {
                  <div class="p-6 text-center text-muted text-sm">No notifications yet</div>
                }
                @for (n of state.notifications().slice(0, 8); track n.id) {
                  <div class="p-3 flex items-start gap-3 border-b border-slate-50 last:border-0" [class.bg-red-50]="!n.read">
                    <span class="text-base flex-shrink-0 mt-0.5">{{ getIcon(n.type) }}</span>
                    <div class="flex-1 min-w-0">
                      <div class="text-slate-800 text-xs font-semibold">{{ n.title }}</div>
                      <div class="text-muted text-xs mt-0.5 line-clamp-2">{{ n.message }}</div>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </header>
  `
})
export class NavbarComponent {
  @Input() title = 'Dashboard';
  @Output() menuToggle = new EventEmitter<void>();

  showNotif = false;
  user = this.auth.currentUser;

  constructor(public auth: AuthService, public state: StateService) {}

  toggleNotif() {
    this.showNotif = !this.showNotif;
    if (this.showNotif) this.state.markAllRead();
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event) {
    if (!(e.target as HTMLElement).closest('app-navbar')) this.showNotif = false;
  }

  getIcon(type: string): string {
    const m: Record<string, string> = { prize: '🏆', deposit: '💰', withdrawal: '🏦', quiz: '🎯', system: '🔔' };
    return m[type] || '🔔';
  }
}
