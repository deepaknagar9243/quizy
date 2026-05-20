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
    <div class="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-red-400 opacity-5 rounded-full blur-3xl"></div>
        <div class="absolute bottom-1/4 right-1/4 w-64 h-64 bg-red-300 opacity-5 rounded-full blur-3xl"></div>
      </div>

      <div class="w-full max-w-md relative z-10">
        <div class="text-center mb-8">
          <div class="inline-flex items-center gap-3 mb-4">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
              <span class="text-white font-bold text-xl">Q</span>
            </div>
            <span class="text-2xl font-bold text-slate-800">QuizArena</span>
          </div>
          <p class="text-muted text-sm">Compete. Win. Earn.</p>
        </div>

        <div class="glass-card p-8">
          <h2 class="text-xl font-bold text-slate-800 mb-1">Welcome back</h2>
          <p class="text-muted text-sm mb-6">Sign in to your account</p>

          @if (error()) {
            <div class="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {{ error() }}
            </div>
          }

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-600 mb-2">Email / Mobile</label>
              <input type="text" class="input-field" placeholder="Enter email or mobile number" [(ngModel)]="email" />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-600 mb-2">Password</label>
              <div class="relative">
                <input
                  [type]="showPassword() ? 'text' : 'password'"
                  class="input-field pr-12"
                  placeholder="Enter password"
                  [(ngModel)]="password"
                  (keyup.enter)="onLogin()"
                />
                <button type="button"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  (click)="showPassword.set(!showPassword())">
                  {{ showPassword() ? '🙈' : '👁️' }}
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between text-sm">
              <label class="flex items-center gap-2 text-slate-500 cursor-pointer">
                <input type="checkbox" class="rounded"> Remember me
              </label>
              <a href="#" class="text-red-500 hover:text-red-600">Forgot password?</a>
            </div>

            <button class="btn-primary w-full justify-center py-3 text-base" (click)="onLogin()" [disabled]="loading()">
              @if (loading()) {
                <span class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
              }
              Sign In
            </button>
          </div>

          <div class="mt-6 text-center">
            <p class="text-muted text-sm">
              Don't have an account?
              <a routerLink="/register" class="text-red-500 hover:text-red-600 font-semibold ml-1">Create one</a>
            </p>
          </div>

          <div class="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
            <p class="text-xs text-slate-500">Demo: Use any email/password to login</p>
            <p class="text-xs text-slate-500 mt-1">Admin: admin&#64;quiz.com / any password</p>
          </div>
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
  showPassword = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  onLogin() {
    if (!this.email || !this.password) {
      this.error.set('Please enter your email and password.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    setTimeout(() => {
      const success = this.auth.login(this.email, this.password);
      this.loading.set(false);
      if (success) {
        this.router.navigate([this.email === 'admin@quiz.com' ? '/admin/dashboard' : '/dashboard']);
      }
    }, 800);
  }
}
