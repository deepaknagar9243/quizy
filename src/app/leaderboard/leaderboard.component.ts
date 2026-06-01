import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../shared/services/api.service';
import { BackendLeaderboardEntry } from '../shared/models/models';
import { StateService } from '../shared/services/state.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fade-in space-y-6">
      <div>
        <h1 class="page-header">Leaderboard</h1>
        <p class="page-subheader">Top performing players</p>
      </div>

      @if (loading()) {
        <div class="glass-card p-12 text-center">
          <div class="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p class="text-muted text-sm">Loading rankings...</p>
        </div>
      } @else {

        <!-- Top 3 Podium -->
        @if (topThree.length >= 3) {
          <div class="grid grid-cols-3 gap-3 max-w-2xl mx-auto">
            <!-- 2nd -->
            <div class="glass-card p-4 text-center mt-6">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white font-bold text-base mx-auto mb-2">
                {{ getInitials(topThree[1]?.name) }}
              </div>
              <div class="rank-badge-2 mx-auto mb-2 w-7 h-7 text-xs">2</div>
              <div class="text-slate-800 font-semibold text-xs truncate">{{ topThree[1]?.name }}</div>
              <div class="text-green-600 text-xs font-bold mt-1">₹{{ (topThree[1]?.prizeWon ?? 0).toLocaleString('en-IN') }}</div>
            </div>
            <!-- 1st -->
            <div class="glass-card p-4 text-center relative">
              <div class="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">👑</div>
              <div class="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold text-lg mx-auto mb-2 mt-2">
                {{ getInitials(topThree[0]?.name) }}
              </div>
              <div class="rank-badge-1 mx-auto mb-2 w-7 h-7 text-xs">1</div>
              <div class="text-slate-800 font-bold text-xs truncate">{{ topThree[0]?.name }}</div>
              <div class="text-green-600 text-sm font-bold mt-1">₹{{ (topThree[0]?.prizeWon ?? 0).toLocaleString('en-IN') }}</div>
            </div>
            <!-- 3rd -->
            <div class="glass-card p-4 text-center mt-6">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white font-bold text-base mx-auto mb-2">
                {{ getInitials(topThree[2]?.name) }}
              </div>
              <div class="rank-badge-3 mx-auto mb-2 w-7 h-7 text-xs">3</div>
              <div class="text-slate-800 font-semibold text-xs truncate">{{ topThree[2]?.name }}</div>
              <div class="text-green-600 text-xs font-bold mt-1">₹{{ (topThree[2]?.prizeWon ?? 0).toLocaleString('en-IN') }}</div>
            </div>
          </div>
        }

        <!-- Full list -->
        <div class="glass-card overflow-hidden">
          <div class="p-4 border-b border-slate-200">
            <h3 class="text-slate-800 font-bold">Full Rankings</h3>
          </div>

          @if (leaderboard.length === 0) {
            <div class="p-12 text-center">
              <div class="text-4xl mb-3">🏆</div>
              <p class="text-slate-700 font-semibold">No rankings yet</p>
              <p class="text-muted text-sm mt-1">Play quizzes to appear here</p>
            </div>
          }

          <div class="divide-y divide-slate-100">
            @for (entry of leaderboard; track entry.rank) {
              <div class="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                <div [class]="getRankClass(entry.rank)" class="flex-shrink-0">{{ entry.rank }}</div>
                <div class="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {{ getInitials(entry.name) }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-slate-800 font-semibold text-sm truncate">{{ entry.name }}</div>
                  <div class="text-muted text-xs">{{ entry.score }} pts · {{ entry.correctAnswers }} correct</div>
                </div>
                <div class="text-right flex-shrink-0">
                  <div class="text-green-600 font-bold text-sm">₹{{ (entry.prizeWon ?? 0).toLocaleString('en-IN') }}</div>
                </div>
              </div>
            }
          </div>

          @if (!isLastPage()) {
            <div class="p-4 text-center border-t border-slate-100">
              <button class="btn-ghost text-sm" (click)="loadMore()" [disabled]="loadingMore()">
                @if (loadingMore()) { <span class="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin inline-block mr-2"></span> }
                Load more
              </button>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class LeaderboardComponent implements OnInit {
  loading = signal(true);
  loadingMore = signal(false);
  leaderboard: BackendLeaderboardEntry[] = [];
  topThree: BackendLeaderboardEntry[] = [];
  isLastPage = signal(true);
  currentPage = 0;

  constructor(private api: ApiService, private state: StateService) {}

  async ngOnInit() {
    try {
      const res = await this.api.getGlobalLeaderboard({ page: 0, size: 20 });
      this.leaderboard = res.content;
      this.topThree = res.content.slice(0, 3);
      this.isLastPage.set(res.last);
    } catch {
      // fallback to local state
      this.leaderboard = this.state.leaderboard().map(e => ({
        rank: e.rank, userId: parseInt(e.userId) || 0,
        name: e.name, score: e.score, correctAnswers: e.quizWins, prizeWon: e.totalEarnings
      }));
      this.topThree = this.leaderboard.slice(0, 3);
    } finally {
      this.loading.set(false);
    }
  }

  async loadMore() {
    this.loadingMore.set(true);
    this.currentPage++;
    try {
      const res = await this.api.getGlobalLeaderboard({ page: this.currentPage, size: 20 });
      this.leaderboard = [...this.leaderboard, ...res.content];
      this.isLastPage.set(res.last);
    } finally {
      this.loadingMore.set(false);
    }
  }

  getInitials(name?: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getRankClass(rank: number): string {
    if (rank === 1) return 'rank-badge-1';
    if (rank === 2) return 'rank-badge-2';
    if (rank === 3) return 'rank-badge-3';
    return 'rank-badge-other';
  }
}
