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
    <div class="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-1/4 right-1/4 w-96 h-96 bg-red-400 opacity-5 rounded-full blur-3xl"></div>
        <div class="absolute bottom-1/3 left-1/4 w-64 h-64 bg-red-300 opacity-5 rounded-full blur-3xl"></div>
      </div>

      <div class="w-full max-w-md relative z-10">
        <div class="text-center mb-8">
          <div class="inline-flex items-center gap-3 mb-4">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
              <span class="text-white font-bold text-xl">Q</span>
            </div>
            <span class="text-2xl font-bold text-slate-800">QuizArena</span>
          </div>
          <p class="text-muted text-sm">Join thousands of quiz champions</p>
        </div>

        <div class="glass-card p-8">
          <h2 class="text-xl font-bold text-slate-800 mb-1">Create account</h2>
          <p class="text-muted text-sm mb-6">Start competing and winning today</p>

          @if (error()) {
            <div class="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {{ error() }}
            </div>
          }

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-600 mb-2">Full Name</label>
              <input type="text" class="input-field" placeholder="Enter your full name" [(ngModel)]="name" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-600 mb-2">Email Address</label>
              <input type="email" class="input-field" placeholder="Enter your email" [(ngModel)]="email" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-600 mb-2">Mobile Number</label>
              <div class="flex gap-2">
                <div class="input-field w-16 text-center flex-shrink-0 text-slate-500 bg-slate-50">+91</div>
                <input type="tel" class="input-field flex-1" placeholder="Enter mobile number" [(ngModel)]="mobile" maxlength="10" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-600 mb-2">Password</label>
              <input [type]="showPassword() ? 'text' : 'password'" class="input-field" placeholder="Create a strong password" [(ngModel)]="password" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-600 mb-2">Confirm Password</label>
              <input [type]="showPassword() ? 'text' : 'password'" class="input-field" placeholder="Confirm your password" [(ngModel)]="confirmPassword" />
            </div>

            <label class="flex items-start gap-2 text-sm text-slate-500 cursor-pointer">
              <input type="checkbox" class="mt-0.5" [(ngModel)]="agreed" />
              <span>I agree to the <a href="#" class="text-red-500">Terms of Service</a> and <a href="#" class="text-red-500">Privacy Policy</a></span>
            </label>

            <button class="btn-primary w-full justify-center py-3 text-base" (click)="onRegister()" [disabled]="loading()">
              @if (loading()) {
                <span class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
              }
              Create Account
            </button>
          </div>

          <div class="mt-6 text-center">
            <p class="text-muted text-sm">
              Already have an account?
              <a routerLink="/login" class="text-red-500 hover:text-red-600 font-semibold ml-1">Sign in</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  name = ''; email = ''; mobile = ''; password = ''; confirmPassword = '';
  agreed = false;
  loading = signal(false);
  error = signal('');
  showPassword = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  onRegister() {
    if (!this.name || !this.email || !this.mobile || !this.password) {
      this.error.set('Please fill in all fields.'); return;
    }
    if (this.password !== this.confirmPassword) {
      this.error.set('Passwords do not match.'); return;
    }
    if (!this.agreed) {
      this.error.set('Please accept the terms and conditions.'); return;
    }
    this.loading.set(true);
    this.error.set('');
    setTimeout(() => {
      this.auth.register(this.name, this.email, this.mobile, this.password);
      this.loading.set(false);
      this.router.navigate(['/dashboard']);
    }, 800);
  }
}
