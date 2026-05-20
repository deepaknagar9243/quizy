import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen min-h-dvh bg-gradient-to-br from-slate-50 to-red-50 flex flex-col">

      <!-- Top safe area -->
      <div class="safe-top"></div>

      <!-- Header -->
      <div class="flex items-center justify-center pt-10 pb-6 px-6">
        <div class="text-center">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-red-200">
            <span class="text-white font-bold text-2xl">Q</span>
          </div>
          <h1 class="text-2xl font-bold text-slate-800">QuizArena</h1>
          <p class="text-slate-500 text-sm mt-1">India's #1 Quiz Competition Platform</p>
        </div>
      </div>

      <!-- Trust Badges -->
      <div class="flex items-center justify-center gap-3 px-6 mb-6 flex-wrap">
        <span class="trust-badge">🔒 100% Secure</span>
        <span class="trust-badge">⚡ Instant Payout</span>
        <span class="trust-badge">✅ RNG Certified</span>
      </div>

      <!-- Card -->
      <div class="flex-1 px-4 pb-8">
        <div class="glass-card p-6 max-w-sm mx-auto">
          <h2 class="text-xl font-bold text-slate-800 mb-1">Welcome back!</h2>
          <p class="text-muted text-sm mb-5">Sign in to continue playing</p>

          @if (error()) {
            <div class="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
              <span>⚠️</span> {{ error() }}
            </div>
          }

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">Mobile / Email</label>
              <input
                type="text"
                class="input-field"
                placeholder="Enter mobile or email"
                [(ngModel)]="email"
                autocomplete="username"
                inputmode="email"
              />
            </div>

            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="text-sm font-semibold text-slate-700">Password</label>
                <a href="#" class="text-xs text-red-500 font-medium">Forgot?</a>
              </div>
              <div class="relative">
                <input
                  [type]="showPwd() ? 'text' : 'password'"
                  class="input-field pr-12"
                  placeholder="Enter password"
                  [(ngModel)]="password"
                  autocomplete="current-password"
                  (keyup.enter)="onLogin()"
                />
                <button type="button"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 p-1"
                  (click)="showPwd.set(!showPwd())">
                  {{ showPwd() ? '🙈' : '👁️' }}
                </button>
              </div>
            </div>

            <button class="btn-primary w-full text-base" (click)="onLogin()" [disabled]="loading()">
              @if (loading()) {
                <span class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              } @else {
                Sign In →
              }
            </button>
          </div>

          <!-- Divider -->
          <div class="flex items-center gap-3 my-5">
            <div class="flex-1 h-px bg-slate-200"></div>
            <span class="text-xs text-slate-400 font-medium">OR</span>
            <div class="flex-1 h-px bg-slate-200"></div>
          </div>

          <!-- Demo hint -->
          <div class="p-3 rounded-xl bg-blue-50 border border-blue-100 text-center mb-4">
            <p class="text-xs text-blue-700 font-semibold mb-1">🎮 Demo Mode</p>
            <p class="text-xs text-blue-600">Any email + any password to login</p>
            <p class="text-xs text-blue-600">Admin: admin&#64;quiz.com</p>
          </div>

          <p class="text-center text-sm text-slate-500">
            New here?
            <a routerLink="/register" class="text-red-600 font-semibold ml-1">Create Account</a>
          </p>
        </div>

        <!-- Bottom trust -->
        <div class="text-center mt-6 space-y-1">
          <p class="text-xs text-slate-400">By continuing, you agree to our Terms & Privacy Policy</p>
          <p class="text-xs text-slate-400">🏦 Payments secured by Razorpay · 18+ only</p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');
  showPwd = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  onLogin() {
    if (!this.email.trim()) { this.error.set('Please enter your mobile or email'); return; }
    if (!this.password) { this.error.set('Please enter your password'); return; }
    this.loading.set(true);
    this.error.set('');
    setTimeout(() => {
      this.auth.login(this.email.trim(), this.password);
      this.loading.set(false);
      this.router.navigate([this.email === 'admin@quiz.com' ? '/admin/dashboard' : '/dashboard']);
    }, 800);
  }
}
