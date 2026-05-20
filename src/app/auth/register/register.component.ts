import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen min-h-dvh bg-gradient-to-br from-slate-50 to-red-50 flex flex-col">
      <div class="safe-top"></div>

      <div class="flex items-center justify-between px-4 pt-4">
        <a routerLink="/login" class="btn-ghost text-sm">← Back</a>
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
            <span class="text-white font-bold text-sm">Q</span>
          </div>
          <span class="font-bold text-slate-800">QuizArena</span>
        </div>
        <div class="w-16"></div>
      </div>

      <div class="flex-1 px-4 py-6 pb-8">
        <div class="max-w-sm mx-auto">
          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-slate-800">Create Account</h2>
            <p class="text-muted text-sm mt-1">Join 12,000+ players winning daily</p>
          </div>

          <!-- Social proof -->
          <div class="flex items-center justify-center gap-4 mb-6">
            <div class="text-center">
              <div class="text-lg font-bold text-slate-800">₹50L+</div>
              <div class="text-xs text-muted">Paid Out</div>
            </div>
            <div class="w-px h-8 bg-slate-200"></div>
            <div class="text-center">
              <div class="text-lg font-bold text-slate-800">12K+</div>
              <div class="text-xs text-muted">Players</div>
            </div>
            <div class="w-px h-8 bg-slate-200"></div>
            <div class="text-center">
              <div class="text-lg font-bold text-slate-800">4.8★</div>
              <div class="text-xs text-muted">Rating</div>
            </div>
          </div>

          <div class="glass-card p-6">
            @if (error()) {
              <div class="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
                <span>⚠️</span> {{ error() }}
              </div>
            }

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                <input type="text" class="input-field" placeholder="Your full name" [(ngModel)]="name" autocomplete="name" />
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Mobile Number</label>
                <div class="flex gap-2">
                  <div class="input-field w-16 text-center flex-shrink-0 bg-slate-50 text-slate-600 font-medium">+91</div>
                  <input type="tel" class="input-field flex-1" placeholder="10-digit mobile" [(ngModel)]="mobile" maxlength="10" inputmode="numeric" autocomplete="tel" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                <input type="email" class="input-field" placeholder="your@email.com" [(ngModel)]="email" autocomplete="email" inputmode="email" />
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <div class="relative">
                  <input [type]="showPwd() ? 'text' : 'password'" class="input-field pr-12" placeholder="Min 6 characters" [(ngModel)]="password" autocomplete="new-password" />
                  <button type="button" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 p-1" (click)="showPwd.set(!showPwd())">
                    {{ showPwd() ? '🙈' : '👁️' }}
                  </button>
                </div>
              </div>

              <label class="flex items-start gap-3 cursor-pointer">
                <div class="relative mt-0.5 flex-shrink-0">
                  <input type="checkbox" [(ngModel)]="agreed" class="sr-only" />
                  <div class="w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
                    [class]="agreed ? 'bg-red-600 border-red-600' : 'border-slate-300'">
                    @if (agreed) { <span class="text-white text-xs font-bold">✓</span> }
                  </div>
                </div>
                <span class="text-sm text-slate-600">
                  I am 18+ and agree to
                  <a href="#" class="text-red-600 font-medium">Terms</a> &
                  <a href="#" class="text-red-600 font-medium">Privacy Policy</a>
                </span>
              </label>

              <button class="btn-primary w-full text-base" (click)="onRegister()" [disabled]="loading()">
                @if (loading()) {
                  <span class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                } @else {
                  Create Account & Start Playing →
                }
              </button>
            </div>
          </div>

          <p class="text-center text-sm text-slate-500 mt-5">
            Already have an account?
            <a routerLink="/login" class="text-red-600 font-semibold ml-1">Sign In</a>
          </p>

          <div class="text-center mt-4">
            <p class="text-xs text-slate-400">🔒 Your data is encrypted & secure</p>
            <p class="text-xs text-slate-400 mt-1">Payments by Razorpay · Withdrawals in 24hrs</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  name = ''; email = ''; mobile = ''; password = '';
  agreed = false;
  loading = signal(false);
  error = signal('');
  showPwd = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  onRegister() {
    if (!this.name.trim()) { this.error.set('Please enter your full name'); return; }
    if (this.mobile.length !== 10 || !/^\d+$/.test(this.mobile)) { this.error.set('Enter a valid 10-digit mobile number'); return; }
    if (!this.email.includes('@')) { this.error.set('Enter a valid email address'); return; }
    if (this.password.length < 6) { this.error.set('Password must be at least 6 characters'); return; }
    if (!this.agreed) { this.error.set('Please accept the terms to continue'); return; }

    this.loading.set(true);
    this.error.set('');
    setTimeout(() => {
      this.auth.register(this.name.trim(), this.email.trim(), this.mobile, this.password);
      this.loading.set(false);
      this.router.navigate(['/dashboard']);
    }, 900);
  }
}
