import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fade-in space-y-6 max-w-3xl">
      <div>
        <h1 class="page-header">Profile</h1>
        <p class="page-subheader">Manage your account information</p>
      </div>

      <!-- Profile Card -->
      <div class="glass-card p-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <!-- Avatar -->
          <div class="relative">
            <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-800 flex items-center justify-center text-white font-bold text-2xl">
              {{ user()?.avatar }}
            </div>
            <button class="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs border-2 border-dark-800">
              ✎
            </button>
          </div>

          <div class="flex-1">
            <h2 class="text-xl font-bold text-white">{{ user()?.name }}</h2>
            <p class="text-muted text-sm">{{ user()?.email }}</p>
            <div class="flex flex-wrap gap-3 mt-3">
              <span class="text-xs px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400">
                🏆 {{ user()?.totalWins }} Wins
              </span>
              <span class="text-xs px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-400">
                🎯 {{ user()?.totalQuizzes }} Quizzes
              </span>
              <span class="text-xs px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/25 text-yellow-400">
                ⚡ Rank #{{ user()?.rank }}
              </span>
            </div>
          </div>

          <button class="btn-secondary" (click)="editMode.set(!editMode())">
            {{ editMode() ? 'Cancel' : '✎ Edit Profile' }}
          </button>
        </div>
      </div>

      <!-- Profile Form -->
      <div class="glass-card p-6">
        <h3 class="text-white font-bold mb-5">Personal Information</h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
            @if (editMode()) {
              <input type="text" class="input-field" [(ngModel)]="editName" />
            } @else {
              <div class="input-field text-slate-300 bg-dark-600/40 cursor-not-allowed">{{ user()?.name }}</div>
            }
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
            @if (editMode()) {
              <input type="email" class="input-field" [(ngModel)]="editEmail" />
            } @else {
              <div class="input-field text-slate-300 bg-dark-600/40 cursor-not-allowed">{{ user()?.email }}</div>
            }
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Mobile Number</label>
            @if (editMode()) {
              <input type="tel" class="input-field" [(ngModel)]="editMobile" />
            } @else {
              <div class="input-field text-slate-300 bg-dark-600/40 cursor-not-allowed">{{ user()?.mobile }}</div>
            }
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Account Type</label>
            <div class="input-field text-blue-400 bg-dark-600/40 cursor-not-allowed">Player Account</div>
          </div>
        </div>

        @if (editMode()) {
          <div class="mt-5 flex gap-3">
            <button class="btn-primary" (click)="saveProfile()">Save Changes</button>
            <button class="btn-secondary" (click)="editMode.set(false)">Cancel</button>
          </div>
        }
      </div>

      <!-- Stats Section -->
      <div class="glass-card p-6">
        <h3 class="text-white font-bold mb-5">Your Statistics</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="text-center p-4 rounded-xl bg-blue-500/5 border border-blue-500/15">
            <div class="text-2xl font-bold text-blue-400">{{ user()?.totalQuizzes }}</div>
            <div class="text-muted text-xs mt-1">Quizzes Played</div>
          </div>
          <div class="text-center p-4 rounded-xl bg-green-500/5 border border-green-500/15">
            <div class="text-2xl font-bold text-green-400">{{ user()?.totalWins }}</div>
            <div class="text-muted text-xs mt-1">Total Wins</div>
          </div>
          <div class="text-center p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/15">
            <div class="text-2xl font-bold text-yellow-400">33%</div>
            <div class="text-muted text-xs mt-1">Win Rate</div>
          </div>
          <div class="text-center p-4 rounded-xl bg-purple-500/5 border border-purple-500/15">
            <div class="text-2xl font-bold text-purple-400">#{{ user()?.rank }}</div>
            <div class="text-muted text-xs mt-1">Global Rank</div>
          </div>
        </div>
      </div>

      <!-- Security -->
      <div class="glass-card p-6">
        <h3 class="text-white font-bold mb-5">Security</h3>
        <div class="space-y-3">
          <button class="flex items-center gap-4 w-full p-4 rounded-xl border border-blue-900/20 hover:border-blue-900/40 transition-all text-left">
            <div class="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center text-base flex-shrink-0">🔒</div>
            <div>
              <div class="text-white font-medium text-sm">Change Password</div>
              <div class="text-muted text-xs">Last changed 30 days ago</div>
            </div>
            <svg class="w-4 h-4 text-slate-500 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>

          <button class="flex items-center gap-4 w-full p-4 rounded-xl border border-blue-900/20 hover:border-blue-900/40 transition-all text-left">
            <div class="w-9 h-9 rounded-lg bg-green-500/15 flex items-center justify-center text-base flex-shrink-0">📱</div>
            <div>
              <div class="text-white font-medium text-sm">Two-Factor Authentication</div>
              <div class="text-muted text-xs">Not enabled</div>
            </div>
            <svg class="w-4 h-4 text-slate-500 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Logout -->
      <button class="btn-danger w-full py-3 justify-center flex items-center gap-2" (click)="logout()">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
        </svg>
        Logout from Account
      </button>
    </div>
  `
})
export class ProfileComponent {
  editMode = signal(false);
  editName = '';
  editEmail = '';
  editMobile = '';

  user = this.auth.currentUser;

  constructor(private auth: AuthService) {}

  saveProfile() {
    this.editMode.set(false);
  }

  logout() {
    this.auth.logout();
  }
}
