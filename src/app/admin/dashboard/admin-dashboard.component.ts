import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../shared/services/data.service';
import { AdminStats } from '../../shared/models/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fade-in space-y-6">
      <div>
        <h1 class="page-header">Admin Dashboard</h1>
        <p class="page-subheader">Platform overview and statistics</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="stat-card">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <span class="text-muted text-xs">Total Users</span>
          </div>
          <div class="text-2xl font-bold text-white">{{ stats?.totalUsers?.toLocaleString('en-IN') }}</div>
          <div class="text-green-400 text-xs mt-1">+{{ stats?.todaySignups }} today</div>
        </div>

        <div class="stat-card">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
              </svg>
            </div>
            <span class="text-muted text-xs">Total Quizzes</span>
          </div>
          <div class="text-2xl font-bold text-white">{{ stats?.totalQuizzes }}</div>
          <div class="text-muted text-xs mt-1">All time</div>
        </div>

        <div class="stat-card">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center">
              <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1"/>
              </svg>
            </div>
            <span class="text-muted text-xs">Total Revenue</span>
          </div>
          <div class="text-2xl font-bold text-white">₹{{ formatAmount(stats?.totalRevenue || 0) }}</div>
          <div class="text-green-400 text-xs mt-1">₹{{ stats?.todayRevenue?.toLocaleString('en-IN') }} today</div>
        </div>

        <div class="stat-card">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
              <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <span class="text-muted text-xs">Active Players</span>
          </div>
          <div class="text-2xl font-bold text-white">{{ stats?.activePlayers?.toLocaleString('en-IN') }}</div>
          <div class="badge-live inline-flex mt-1">LIVE</div>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <!-- Recent Users -->
        <div class="glass-card overflow-hidden">
          <div class="p-5 border-b border-blue-900/20">
            <h3 class="text-white font-bold">Recent Users</h3>
          </div>
          <div class="divide-y divide-blue-900/10">
            @for (user of recentUsers; track user.id) {
              <div class="px-5 py-3 flex items-center gap-3 table-row">
                <div class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {{ user.name.charAt(0) }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-white text-sm font-medium truncate">{{ user.name }}</div>
                  <div class="text-muted text-xs truncate">{{ user.email }}</div>
                </div>
                <div class="text-right flex-shrink-0">
                  <div class="text-green-400 text-xs font-semibold">₹{{ user.walletBalance.toLocaleString('en-IN') }}</div>
                  <div class="text-muted text-xs">{{ user.totalWins }} wins</div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Quiz Overview -->
        <div class="glass-card overflow-hidden">
          <div class="p-5 border-b border-blue-900/20">
            <h3 class="text-white font-bold">Today's Quizzes</h3>
          </div>
          <div class="divide-y divide-blue-900/10">
            @for (quiz of todayQuizzes; track quiz.id) {
              <div class="px-5 py-3 flex items-center gap-3 table-row">
                <div class="flex-1 min-w-0">
                  <div class="text-white text-sm font-medium truncate">{{ quiz.title }}</div>
                  <div class="text-muted text-xs">{{ quiz.totalParticipants }} / {{ quiz.maxParticipants }} players</div>
                </div>
                <div class="text-right flex-shrink-0">
                  <div class="text-green-400 text-xs font-semibold">₹{{ quiz.prizePool.toLocaleString('en-IN') }}</div>
                  <div class="mt-0.5">
                    @if (quiz.status === 'live') {
                      <span class="badge-live text-xs">LIVE</span>
                    } @else {
                      <span class="badge-upcoming text-xs">UPCOMING</span>
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

  constructor(private data: DataService) {}

  ngOnInit() {
    this.stats = this.data.getAdminStats();
    this.recentUsers = this.data.getAllUsers();
    this.todayQuizzes = this.data.getQuizzes();
  }

  formatAmount(amount: number): string {
    if (amount >= 100000) return (amount / 100000).toFixed(1) + 'L';
    if (amount >= 1000) return (amount / 1000).toFixed(1) + 'K';
    return amount.toString();
  }
}
