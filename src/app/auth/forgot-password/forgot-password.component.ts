import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen min-h-dvh bg-gradient-to-br from-slate-50 to-red-50 flex flex-col">
      <div class="safe-top"></div>

      <div class="flex items-center justify-between px-4 pt-4">
        <a routerLink="/login" class="btn-ghost text-sm">Back</a>
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
            <span class="text-white font-bold text-sm">Q</span>
          </div>
          <span class="font-bold text-slate-800">QuizArena</span>
        </div>
        <div class="w-16"></div>
      </div>

      <div class="flex-1 px-4 py-8">
        <div class="glass-card p-6 max-w-sm mx-auto">
          <h1 class="text-xl font-bold text-slate-800 mb-1">Reset password</h1>
          <p class="text-muted text-sm mb-5">Enter your registered email or mobile to receive a reset code.</p>

          @if (error()) {
            <div class="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {{ error() }}
            </div>
          }

          @if (success()) {
            <div class="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
              {{ success() }}
            </div>
          }

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">Email or Mobile</label>
              <input class="input-field" type="text" [(ngModel)]="identifier" placeholder="demo@quiz.com or 9876543210" autocomplete="username" />
            </div>

            @if (codeSent()) {
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Reset Code</label>
                <input class="input-field" type="text" [(ngModel)]="code" maxlength="6" inputmode="numeric" placeholder="6-digit code" />
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                <input class="input-field" type="password" [(ngModel)]="newPassword" placeholder="Min 6 characters" autocomplete="new-password" />
              </div>
            }

            @if (!codeSent()) {
              <button class="btn-primary w-full" (click)="sendCode()" [disabled]="loading()">Send reset code</button>
            } @else {
              <button class="btn-primary w-full" (click)="resetPassword()" [disabled]="loading()">Update password</button>
              <button class="btn-secondary w-full" (click)="sendCode()" [disabled]="loading()">Resend code</button>
            }
          </div>

          <p class="text-center text-sm text-slate-500 mt-5">
            Remembered it?
            <a routerLink="/login" class="text-red-600 font-semibold ml-1">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  identifier = '';
  code = '';
  newPassword = '';
  loading = signal(false);
  codeSent = signal(false);
  error = signal('');
  success = signal('');

  constructor(private auth: AuthService, private router: Router) {}

  sendCode() {
    if (!this.identifier.trim()) {
      this.error.set('Enter your registered email or mobile');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    setTimeout(() => {
      const result = this.auth.requestPasswordReset(this.identifier.trim());
      this.loading.set(false);

      if (!result.success) {
        this.error.set(result.error || 'Unable to send reset code');
        return;
      }

      this.codeSent.set(true);
      this.code = result.code || '';
      this.success.set(`Demo reset code: ${result.code}. It is valid for 10 minutes.`);
    }, 500);
  }

  resetPassword() {
    if (!this.code.trim()) {
      this.error.set('Enter the reset code');
      return;
    }
    if (this.newPassword.length < 6) {
      this.error.set('New password must be at least 6 characters');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    setTimeout(() => {
      const result = this.auth.resetPassword(this.identifier.trim(), this.code, this.newPassword);
      this.loading.set(false);

      if (!result.success) {
        this.error.set(result.error || 'Unable to reset password');
        return;
      }

      this.success.set('Password updated. Redirecting to login...');
      setTimeout(() => this.router.navigate(['/login']), 700);
    }, 500);
  }
}
