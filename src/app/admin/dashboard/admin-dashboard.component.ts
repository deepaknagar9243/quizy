import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../shared/services/data.service';
import { AdminStats } from '../../shared/models/models';
import { AdminSettingsService } from '../../shared/services/admin-settings.service';
import { ReferralService } from '../../shared/services/referral.service';
import { StateService } from '../../shared/services/state.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="fade-in space-y-5">

      <!-- Header -->
      <div>
        <h1 class="page-header">Admin Dashboard</h1>
        <p class="page-subheader">Platform overview and statistics</p>
      </div>

      <!-- Main stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="stat-card">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <span class="text-muted text-xs">Users</span>
          </div>
          <div class="text-2xl font-bold text-slate-800">{{ formatAmount(stats?.totalUsers || 0) }}</div>
          <div class="text-green-600 text-xs mt-1 font-medium">+{{ stats?.todaySignups }} today</div>
        </div>

        <div class="stat-card">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <span class="text-muted text-xs">Quizzes</span>
          </div>
          <div class="text-2xl font-bold text-slate-800">{{ stats?.totalQuizzes }}</div>
          <div class="text-muted text-xs mt-1">All time</div>
        </div>

        <div class="stat-card">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1"/>
              </svg>
            </div>
            <span class="text-muted text-xs">Revenue</span>
          </div>
          <div class="text-2xl font-bold text-slate-800">₹{{ formatAmount(stats?.totalRevenue || 0) }}</div>
          <div class="text-green-600 text-xs mt-1 font-medium">₹{{ formatAmount(stats?.todayRevenue || 0) }} today</div>
        </div>

        <div class="stat-card">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <span class="text-muted text-xs">Active</span>
          </div>
          <div class="text-2xl font-bold text-slate-800">{{ formatAmount(stats?.activePlayers || 0) }}</div>
          <div class="mt-1"><span class="badge-live">LIVE</span></div>
        </div>
      </div>

      <!-- Quick actions -->
      <div class="grid grid-cols-3 gap-3">
        <a routerLink="/admin/payments"
          class="glass-card p-4 flex flex-col items-center text-center gap-2 hover:border-orange-300 hover:shadow-md transition-all active:scale-95">
          <div class="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
            <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <div class="text-xl font-bold text-orange-600">{{ pendingPayouts }}</div>
            <div class="text-xs text-muted leading-tight">Pending Payouts</div>
          </div>
        </a>

        <a routerLink="/admin/payments"
          class="glass-card p-4 flex flex-col items-center text-center gap-2 hover:border-red-300 hover:shadow-md transition-all active:scale-95">
          <div class="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 8a3 3 0 11-2.83-2M6 8a3 3 0 102.83-2M12 14a4 4 0 00-4 4v1h8v-1a4 4 0 00-4-4z"/>
            </svg>
          </div>
          <div>
            <div class="text-xl font-bold text-red-600">{{ referralCount }}</div>
            <div class="text-xs text-muted leading-tight">Referrals</div>
          </div>
        </a>

        <a routerLink="/admin/quizzes"
          class="glass-card p-4 flex flex-col items-center text-center gap-2 hover:border-blue-300 hover:shadow-md transition-all active:scale-95">
          <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
          </div>
          <div>
            <div class="text-xl font-bold text-blue-600">New</div>
            <div class="text-xs text-muted leading-tight">Create Quiz</div>
          </div>
        </a>
      </div>

      <!-- Two column: users + quizzes -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-5">

        <!-- Recent Users -->
        <div class="glass-card overflow-hidden">
          <div class="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 class="text-slate-800 font-bold">Recent Users</h3>
            <span class="text-xs text-muted">{{ recentUsers.length }} shown</span>
          </div>
          <div class="divide-y divide-slate-100">
            @for (user of recentUsers; track user.id) {
              <div class="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                <div class="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {{ user.name.charAt(0) }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-slate-800 text-sm font-semibold truncate">{{ user.name }}</p>
                  <p class="text-muted text-xs truncate">{{ user.email }}</p>
                </div>
                <div class="text-right flex-shrink-0">
                  <div class="text-green-600 text-xs font-bold">₹{{ user.walletBalance.toLocaleString('en-IN') }}</div>
                  <div class="text-muted text-xs">{{ user.totalWins }}W</div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Today's Quizzes -->
        <div class="glass-card overflow-hidden">
          <div class="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 class="text-slate-800 font-bold">Today's Quizzes</h3>
            <a routerLink="/admin/quizzes" class="text-xs text-red-500 font-semibold">Manage →</a>
          </div>
          <div class="divide-y divide-slate-100">
            @for (quiz of todayQuizzes; track quiz.id) {
              <div class="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                <div class="flex-1 min-w-0">
                  <p class="text-slate-800 text-sm font-semibold truncate">{{ quiz.title }}</p>
                  <p class="text-muted text-xs mt-0.5">{{ quiz.totalParticipants }}/{{ quiz.maxParticipants }} players</p>
                </div>
                <div class="text-right flex-shrink-0">
                  <div class="text-green-600 text-xs font-bold">₹{{ formatAmount(quiz.prizePool) }}</div>
                  <div class="mt-1">
                    @if (quiz.status === 'live') {
                      <span class="badge-live">LIVE</span>
                    } @else {
                      <span class="badge-upcoming">SOON</span>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  stats: AdminStats | null = null;
  recentUsers: any[] = [];
  todayQuizzes: any[] = [];
  pendingPayouts = 0;
  referralCount = 0;

  constructor(
    private data: DataService,
    private state: StateService,
    private adminSettings: AdminSettingsService,
    private referral: ReferralService
  ) {}

  ngOnInit() {
    this.stats = this.data.getAdminStats();
    this.recentUsers = this.data.getAllUsers();
    this.todayQuizzes = this.data.getQuizzes();
    this.pendingPayouts = this.state.getPendingPayouts().length;
    this.referralCount = this.referral.getAll().length;
  }

  formatAmount(n: number): string {
    if (n >= 100000) return (n / 100000).toFixed(1) + 'L';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  }
}
