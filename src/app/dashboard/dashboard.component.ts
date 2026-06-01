import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { ApiService } from '../shared/services/api.service';
import { StateService } from '../shared/services/state.service';
import { BackendQuiz, BackendLeaderboardEntry, Winner, LeaderboardEntry } from '../shared/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-4 fade-in">

      <!-- Hero / Welcome -->
      <div class="glass-card p-5 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -translate-y-8 translate-x-8 pointer-events-none"></div>
        <div class="relative flex items-center justify-between gap-4">
          <div>
            <p class="text-red-600 text-sm font-semibold">👋 Welcome back</p>
            <h2 class="text-xl font-bold text-slate-800 mt-0.5">{{ (user()?.name || '').split(' ')[0] }}</h2>
            <p class="text-muted text-xs mt-1">Ready to win today?</p>
          </div>
          <div class="text-right flex-shrink-0">
            <div class="text-2xl font-bold text-green-600">₹{{ user()?.walletBalance?.toLocaleString('en-IN') }}</div>
            <div class="text-xs text-muted mt-0.5">Wallet Balance</div>
            <a routerLink="/wallet" class="text-xs text-red-500 font-medium mt-1 inline-block">Add Money →</a>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-3 gap-3">
        <div class="stat-card text-center p-3">
          <div class="text-xl font-bold text-slate-800">{{ user()?.totalQuizzes }}</div>
          <div class="text-muted text-xs mt-0.5">Played</div>
        </div>
        <div class="stat-card text-center p-3">
          <div class="text-xl font-bold text-green-600">{{ user()?.totalWins }}</div>
          <div class="text-muted text-xs mt-0.5">Wins</div>
        </div>
        <div class="stat-card text-center p-3">
          <div class="text-xl font-bold text-purple-600">#{{ user()?.rank }}</div>
          <div class="text-muted text-xs mt-0.5">Rank</div>
        </div>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="glass-card p-8 text-center">
          <div class="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p class="text-muted text-sm">Loading quizzes...</p>
        </div>
      }

      <!-- Error -->
      @if (error()) {
        <div class="glass-card p-4 border border-red-200 bg-red-50">
          <p class="text-red-600 text-sm">⚠️ {{ error() }}</p>
        </div>
      }

      <!-- Live Quiz Banner -->
      @if (!loading()) {
        @for (quiz of liveQuizzes; track quiz.id) {
          <a routerLink="/quiz/live" [queryParams]="{id: quiz.id}" class="block glass-card p-4 border-2 border-red-200 relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-r from-red-50 to-transparent pointer-events-none"></div>
            <div class="relative flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <div class="w-5 h-5 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="badge-live">LIVE NOW</span>
                </div>
                <h3 class="text-slate-800 font-bold text-sm truncate">{{ quiz.title }}</h3>
                <p class="text-muted text-xs">{{ quiz.totalParticipants }} playing · Prize ₹{{ quiz.prizePool.toLocaleString('en-IN') }}</p>
              </div>
              <div class="flex-shrink-0">
                <div class="btn-primary text-sm px-4 py-2.5">Join →</div>
              </div>
            </div>
          </a>
        }
      }

      <!-- Upcoming Quizzes -->
      @if (!loading() && upcomingQuizzes.length > 0) {
        <div>
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-slate-800 font-bold">Upcoming Quizzes</h3>
            <span class="text-xs text-muted">{{ upcomingQuizzes.length }} available</span>
          </div>
          <div class="space-y-3">
            @for (quiz of upcomingQuizzes; track quiz.id) {
              <div class="glass-card p-4">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1.5">
                      <span class="badge-upcoming">{{ quiz.category }}</span>
                    </div>
                    <h4 class="text-slate-800 font-semibold text-sm">{{ quiz.title }}</h4>
                    <div class="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted">
                      <span>🕐 {{ formatTime(quiz.startTime) }}</span>
                      <span>👥 {{ quiz.totalParticipants }}/{{ quiz.maxParticipants }}</span>
                      <span>❓ {{ quiz.totalQuestions }}Q</span>
                    </div>
                  </div>
                  <div class="text-right flex-shrink-0">
                    <div class="text-green-600 font-bold text-sm">₹{{ quiz.prizePool.toLocaleString('en-IN') }}</div>
                    <div class="text-muted text-xs mb-2">Prize Pool</div>
                    <a routerLink="/quiz/live" [queryParams]="{id: quiz.id}" class="btn-primary text-xs px-3 py-2">
                      ₹{{ quiz.entryFee }}
                    </a>
                  </div>
                </div>
                <div class="mt-3">
                  <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full"
                      [style.width.%]="(quiz.totalParticipants / quiz.maxParticipants) * 100"></div>
                  </div>
                  <div class="flex justify-between text-xs text-muted mt-1">
                    <span>{{ quiz.totalParticipants }} joined</span>
                    <span>{{ quiz.maxParticipants - quiz.totalParticipants }} spots left</span>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Two column: Leaderboard + Winners -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="glass-card p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-slate-800 font-bold text-sm">🏆 Top Players</h3>
            <a routerLink="/leaderboard" class="text-xs text-red-500 font-medium">See all →</a>
          </div>
          @if (topPlayers.length === 0 && !loading()) {
            <p class="text-muted text-xs text-center py-4">No leaderboard data yet</p>
          }
          <div class="space-y-3">
            @for (entry of topPlayers; track entry.rank) {
              <div class="flex items-center gap-3">
                <div [class]="getRankClass(entry.rank)">{{ entry.rank }}</div>
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {{ entry.avatar }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-slate-800 text-xs font-semibold truncate">{{ entry.name }}</div>
                  <div class="text-muted text-xs">{{ entry.score.toLocaleString('en-IN') }} pts</div>
                </div>
                <div class="text-green-600 text-xs font-bold flex-shrink-0">₹{{ formatAmount(entry.totalEarnings) }}</div>
              </div>
            }
          </div>
        </div>

        <div class="glass-card p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-slate-800 font-bold text-sm">🎉 Recent Winners</h3>
          </div>
          <div class="space-y-3">
            @for (winner of recentWinners; track winner.userId) {
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {{ winner.avatar }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-slate-800 text-xs font-semibold truncate">{{ winner.name }}</div>
                  <div class="text-muted text-xs truncate">{{ winner.quizTitle }}</div>
                </div>
                <div class="text-green-600 text-xs font-bold flex-shrink-0">+₹{{ winner.prize.toLocaleString('en-IN') }}</div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- How it works -->
      <div class="glass-card p-5">
        <h3 class="text-slate-800 font-bold mb-4 text-sm">How QuizArena Works</h3>
        <div class="grid grid-cols-3 gap-3 text-center">
          <div>
            <div class="text-2xl mb-2">💰</div>
            <div class="text-xs font-semibold text-slate-700">Add Money</div>
            <div class="text-xs text-muted mt-1">UPI, Card, Net Banking</div>
          </div>
          <div>
            <div class="text-2xl mb-2">🎯</div>
            <div class="text-xs font-semibold text-slate-700">Join & Play</div>
            <div class="text-xs text-muted mt-1">Correct answers, fastest time</div>
          </div>
          <div>
            <div class="text-2xl mb-2">🏆</div>
            <div class="text-xs font-semibold text-slate-700">Win Prizes</div>
            <div class="text-xs text-muted mt-1">Instant wallet credit</div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  user = this.auth.currentUser;
  loading = signal(true);
  error = signal('');

  liveQuizzes: BackendQuiz[] = [];
  upcomingQuizzes: BackendQuiz[] = [];
  topPlayers: LeaderboardEntry[] = [];
  recentWinners: Winner[] = [];

  constructor(private auth: AuthService, private api: ApiService, private state: StateService) {}

  async ngOnInit() {
    try {
      // Load quizzes
      const [liveRes, upcomingRes, leaderRes] = await Promise.all([
        this.api.getQuizzes({ status: 'LIVE', size: 3 }),
        this.api.getQuizzes({ status: 'UPCOMING', size: 5 }),
        this.api.getGlobalLeaderboard({ size: 5 })
      ]);

      this.liveQuizzes = liveRes.content;
      this.upcomingQuizzes = upcomingRes.content;
      this.topPlayers = leaderRes.content.map(e => ({
        rank: e.rank,
        userId: String(e.userId),
        name: e.name,
        avatar: e.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
        score: e.score,
        quizWins: 0,
        totalEarnings: e.prizeWon
      }));
    } catch (e: any) {
      this.error.set(e.message || 'Failed to load data');
      // Fallback to local state
      this.topPlayers = this.state.leaderboard().slice(0, 5);
      this.recentWinners = this.state.recentWinners().slice(0, 4);
    } finally {
      this.loading.set(false);
    }

    this.recentWinners = this.state.recentWinners().slice(0, 4);
  }

  formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  formatAmount(n: number): string {
    if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
    return n.toLocaleString('en-IN');
  }

  getRankClass(rank: number): string {
    if (rank === 1) return 'rank-badge-1';
    if (rank === 2) return 'rank-badge-2';
    if (rank === 3) return 'rank-badge-3';
    return 'rank-badge-other';
  }
}
