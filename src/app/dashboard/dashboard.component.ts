import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { DataService } from '../shared/services/data.service';
import { Quiz, LeaderboardEntry, Winner } from '../shared/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6 fade-in">
      <!-- Welcome Section -->
      <div class="glass-card p-6 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent pointer-events-none"></div>
        <div class="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p class="text-blue-400 text-sm font-medium mb-1">Welcome back 👋</p>
            <h2 class="text-2xl font-bold text-white">{{ user()?.name }}</h2>
            <p class="text-muted text-sm mt-1">Ready to compete today?</p>
          </div>
          <div class="flex gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-green-400">₹{{ user()?.walletBalance?.toLocaleString('en-IN') }}</div>
              <div class="text-muted text-xs mt-1">Wallet Balance</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-400">{{ user()?.totalWins }}</div>
              <div class="text-muted text-xs mt-1">Total Wins</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-purple-400">#{{ user()?.rank }}</div>
              <div class="text-muted text-xs mt-1">Your Rank</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="stat-card">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
              </svg>
            </div>
            <span class="text-muted text-xs">Quizzes Played</span>
          </div>
          <div class="text-2xl font-bold text-white">{{ user()?.totalQuizzes }}</div>
        </div>

        <div class="stat-card">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-9 h-9 rounded-lg bg-green-500/15 flex items-center justify-center">
              <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <span class="text-muted text-xs">Wins</span>
          </div>
          <div class="text-2xl font-bold text-white">{{ user()?.totalWins }}</div>
        </div>

        <div class="stat-card">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-9 h-9 rounded-lg bg-yellow-500/15 flex items-center justify-center">
              <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1"/>
              </svg>
            </div>
            <span class="text-muted text-xs">Total Earned</span>
          </div>
          <div class="text-2xl font-bold text-white">₹8.5K</div>
        </div>

        <div class="stat-card">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-9 h-9 rounded-lg bg-purple-500/15 flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
            </div>
            <span class="text-muted text-xs">Win Rate</span>
          </div>
          <div class="text-2xl font-bold text-white">33%</div>
        </div>
      </div>

      <!-- Live Quiz Banner -->
      @if (liveQuiz) {
        <div class="glass-card p-5 border border-red-500/20 relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-r from-red-600/5 to-transparent pointer-events-none"></div>
          <div class="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                </svg>
              </div>
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="badge-live">LIVE NOW</span>
                </div>
                <h3 class="text-white font-bold">{{ liveQuiz.title }}</h3>
                <p class="text-muted text-sm">{{ liveQuiz.totalParticipants }} players active • Prize Pool ₹{{ liveQuiz.prizePool.toLocaleString('en-IN') }}</p>
              </div>
            </div>
            <a routerLink="/quiz/live" class="btn-primary flex-shrink-0">
              Join Live Quiz →
            </a>
          </div>
        </div>
      }

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- Upcoming Quizzes -->
        <div class="xl:col-span-2 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-white font-bold text-lg">Upcoming Quizzes</h3>
            <span class="text-muted text-sm">{{ upcomingQuizzes.length }} available</span>
          </div>

          <div class="space-y-3">
            @for (quiz of upcomingQuizzes; track quiz.id) {
              <div class="glass-card-light p-4 hover:border-blue-500/25 transition-all">
                <div class="flex items-center justify-between gap-4">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="badge-upcoming">{{ quiz.category }}</span>
                    </div>
                    <h4 class="text-white font-semibold text-sm truncate">{{ quiz.title }}</h4>
                    <div class="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted">
                      <span>🕐 {{ formatTime(quiz.startTime) }}</span>
                      <span>👥 {{ quiz.totalParticipants }}/{{ quiz.maxParticipants }}</span>
                      <span>❓ {{ quiz.totalQuestions }} Qs</span>
                    </div>
                  </div>
                  <div class="text-right flex-shrink-0">
                    <div class="text-green-400 font-bold text-sm">₹{{ quiz.prizePool.toLocaleString('en-IN') }}</div>
                    <div class="text-muted text-xs mb-2">Prize Pool</div>
                    <button class="btn-primary text-xs px-3 py-1.5">
                      Join ₹{{ quiz.entryFee }}
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-5">
          <!-- Leaderboard Preview -->
          <div class="glass-card p-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-white font-bold">Top Players</h3>
              <a routerLink="/leaderboard" class="text-blue-400 text-xs hover:text-blue-300">View all →</a>
            </div>
            <div class="space-y-3">
              @for (entry of topPlayers; track entry.rank) {
                <div class="flex items-center gap-3">
                  <div [class]="getRankClass(entry.rank)">{{ entry.rank }}</div>
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {{ entry.avatar }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-white text-sm font-medium truncate">{{ entry.name }}</div>
                    <div class="text-muted text-xs">{{ entry.score.toLocaleString('en-IN') }} pts</div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Recent Winners -->
          <div class="glass-card p-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-white font-bold">Recent Winners</h3>
            </div>
            <div class="space-y-3">
              @for (winner of recentWinners; track winner.userId) {
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {{ winner.avatar }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-white text-sm font-medium truncate">{{ winner.name }}</div>
                    <div class="text-muted text-xs truncate">{{ winner.quizTitle }}</div>
                  </div>
                  <div class="text-green-400 text-sm font-bold flex-shrink-0">+₹{{ winner.prize.toLocaleString('en-IN') }}</div>
                </div>
              }
            </div>
          </div>

          <!-- Quick Nav -->
          <div class="grid grid-cols-3 gap-3">
            <a routerLink="/wallet" class="glass-card-light p-3 text-center hover:border-blue-500/25 transition-all cursor-pointer">
              <div class="text-xl mb-1">💳</div>
              <div class="text-white text-xs font-medium">Wallet</div>
            </a>
            <a routerLink="/profile" class="glass-card-light p-3 text-center hover:border-blue-500/25 transition-all cursor-pointer">
              <div class="text-xl mb-1">👤</div>
              <div class="text-white text-xs font-medium">Profile</div>
            </a>
            <a routerLink="/leaderboard" class="glass-card-light p-3 text-center hover:border-blue-500/25 transition-all cursor-pointer">
              <div class="text-xl mb-1">🏆</div>
              <div class="text-white text-xs font-medium">Rankings</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  liveQuiz: Quiz | null = null;
  upcomingQuizzes: Quiz[] = [];
  topPlayers: LeaderboardEntry[] = [];
  recentWinners: Winner[] = [];

  user = this.auth.currentUser;

  constructor(private auth: AuthService, private data: DataService) {}

  ngOnInit() {
    this.liveQuiz = this.data.getLiveQuiz();
    this.upcomingQuizzes = this.data.getUpcomingQuizzes();
    this.topPlayers = this.data.getLeaderboard().slice(0, 5);
    this.recentWinners = this.data.getRecentWinners().slice(0, 4);
  }

  formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  getRankClass(rank: number): string {
    if (rank === 1) return 'rank-badge-1';
    if (rank === 2) return 'rank-badge-2';
    if (rank === 3) return 'rank-badge-3';
    return 'rank-badge-other';
  }
}
