import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../shared/services/auth.service';
import { StateService } from '../shared/services/state.service';

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
          <div class="relative">
            <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-2xl">
              {{ user()?.avatar }}
            </div>
            <button class="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white text-xs border-2 border-white">
              ✎
            </button>
          </div>

          <div class="flex-1">
            <h2 class="text-xl font-bold text-slate-800">{{ user()?.name }}</h2>
            <p class="text-muted text-sm">{{ user()?.email }}</p>
            <div class="flex flex-wrap gap-3 mt-3">
              <span class="text-xs px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600">
                🏆 {{ user()?.totalWins }} Wins
              </span>
              <span class="text-xs px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-600">
                🎯 {{ user()?.totalQuizzes }} Quizzes
              </span>
              <span class="text-xs px-3 py-1 rounded-full bg-yellow-50 border border-yellow-200 text-yellow-700">
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
        <h3 class="text-slate-800 font-bold mb-5">Personal Information</h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-2">Full Name</label>
            @if (editMode()) {
              <input type="text" class="input-field" [(ngModel)]="editName" />
            } @else {
              <div class="input-field text-slate-600 bg-slate-50 cursor-not-allowed">{{ user()?.name }}</div>
            }
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-600 mb-2">Email Address</label>
            @if (editMode()) {
              <input type="email" class="input-field" [(ngModel)]="editEmail" />
            } @else {
              <div class="input-field text-slate-600 bg-slate-50 cursor-not-allowed">{{ user()?.email }}</div>
            }
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-600 mb-2">Mobile Number</label>
            @if (editMode()) {
              <input type="tel" class="input-field" [(ngModel)]="editMobile" />
            } @else {
              <div class="input-field text-slate-600 bg-slate-50 cursor-not-allowed">{{ user()?.mobile }}</div>
            }
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-600 mb-2">Account Type</label>
            <div class="input-field text-red-600 bg-slate-50 cursor-not-allowed">Player Account</div>
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
        <h3 class="text-slate-800 font-bold mb-5">Your Statistics</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="text-center p-4 rounded-xl bg-red-50 border border-red-100">
            <div class="text-2xl font-bold text-red-600">{{ user()?.totalQuizzes }}</div>
            <div class="text-muted text-xs mt-1">Quizzes Played</div>
          </div>
          <div class="text-center p-4 rounded-xl bg-green-50 border border-green-100">
            <div class="text-2xl font-bold text-green-600">₹{{ user()?.totalEarnings?.toLocaleString('en-IN') }}</div>
            <div class="text-muted text-xs mt-1">Total Earned</div>
          </div>
          <div class="text-center p-4 rounded-xl bg-yellow-50 border border-yellow-100">
            <div class="text-2xl font-bold text-yellow-600">{{ winRate() }}%</div>
            <div class="text-muted text-xs mt-1">Win Rate</div>
          </div>
          <div class="text-center p-4 rounded-xl bg-purple-50 border border-purple-100">
            <div class="text-2xl font-bold text-purple-600">#{{ user()?.rank }}</div>
            <div class="text-muted text-xs mt-1">Global Rank</div>
          </div>
        </div>
      </div>

      <!-- Security -->
      <div class="glass-card p-6">
        <h3 class="text-slate-800 font-bold mb-5">Security</h3>
        <div class="space-y-3">
          <button class="flex items-center gap-4 w-full p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all text-left">
            <div class="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center text-base flex-shrink-0">🔒</div>
            <div>
              <div class="text-slate-800 font-medium text-sm">Change Password</div>
              <div class="text-muted text-xs">Last changed 30 days ago</div>
            </div>
            <svg class="w-4 h-4 text-slate-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>

          <button class="flex items-center gap-4 w-full p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all text-left">
            <div class="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center text-base flex-shrink-0">📱</div>
            <div>
              <div class="text-slate-800 font-medium text-sm">Two-Factor Authentication</div>
              <div class="text-muted text-xs">Not enabled</div>
            </div>
            <svg class="w-4 h-4 text-slate-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

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
  quizHistory = computed(() => this.state.getUserQuizResults(this.user()?.id || '').slice(0, 5));
  winRate = computed(() => {
    const results = this.state.getUserQuizResults(this.user()?.id || '');
    if (!results.length) return 0;
    const wins = results.filter(r => r.rank <= 3).length;
    return Math.round((wins / results.length) * 100);
  });

  constructor(private auth: AuthService, public state: StateService) {}

  saveProfile() { this.editMode.set(false); }
  logout() { this.auth.logout(); }
}
