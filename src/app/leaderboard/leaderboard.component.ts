import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../shared/services/data.service';
import { StateService } from '../shared/services/state.service';
import { LeaderboardEntry } from '../shared/models/models';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fade-in space-y-6">
      <div>
        <h1 class="page-header">Leaderboard</h1>
        <p class="page-subheader">Top performing players this month</p>
      </div>

      <!-- Top 3 Podium -->
      <div class="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
        <div class="glass-card p-5 text-center order-1 mt-6">
          <div class="w-14 h-14 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">
            {{ topThree[1]?.avatar }}
          </div>
          <div class="rank-badge-2 mx-auto mb-2 w-8 h-8 text-sm">2</div>
          <div class="text-slate-800 font-semibold text-sm">{{ topThree[1]?.name }}</div>
          <div class="text-muted text-xs mt-1">{{ topThree[1]?.score?.toLocaleString('en-IN') }} correct</div>
          <div class="text-green-600 text-xs font-semibold mt-1">₹{{ topThree[1]?.totalEarnings?.toLocaleString('en-IN') }}</div>
        </div>

        <div class="glass-card p-5 text-center order-2 border-yellow-400/40 relative">
          <div class="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">👑</div>
          <div class="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-3 mt-2">
            {{ topThree[0]?.avatar }}
          </div>
          <div class="rank-badge-1 mx-auto mb-2 w-8 h-8 text-sm">1</div>
          <div class="text-slate-800 font-bold text-sm">{{ topThree[0]?.name }}</div>
          <div class="text-muted text-xs mt-1">{{ topThree[0]?.score?.toLocaleString('en-IN') }} correct</div>
          <div class="text-green-600 text-sm font-bold mt-1">₹{{ topThree[0]?.totalEarnings?.toLocaleString('en-IN') }}</div>
        </div>

        <div class="glass-card p-5 text-center order-3 mt-6">
          <div class="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">
            {{ topThree[2]?.avatar }}
          </div>
          <div class="rank-badge-3 mx-auto mb-2 w-8 h-8 text-sm">3</div>
          <div class="text-slate-800 font-semibold text-sm">{{ topThree[2]?.name }}</div>
          <div class="text-muted text-xs mt-1">{{ topThree[2]?.score?.toLocaleString('en-IN') }} correct</div>
          <div class="text-green-600 text-xs font-semibold mt-1">₹{{ topThree[2]?.totalEarnings?.toLocaleString('en-IN') }}</div>
        </div>
      </div>

      <!-- Full Leaderboard Table -->
      <div class="glass-card overflow-hidden">
        <div class="p-5 border-b border-slate-200">
          <h3 class="text-slate-800 font-bold">Full Rankings</h3>
        </div>

        <div class="grid grid-cols-12 gap-4 px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider border-b border-slate-100">
          <div class="col-span-1">Rank</div>
          <div class="col-span-4 sm:col-span-5">Player</div>
          <div class="col-span-3 text-right">Correct</div>
          <div class="hidden sm:block col-span-2 text-right">Wins</div>
          <div class="col-span-4 sm:col-span-2 text-right">Earnings</div>
        </div>

        @for (entry of leaderboard; track entry.rank) {
          <div class="grid grid-cols-12 gap-4 px-5 py-4 items-center border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
            <div class="col-span-1">
              <div [class]="getRankClass(entry.rank)">{{ entry.rank }}</div>
            </div>
            <div class="col-span-4 sm:col-span-5 flex items-center gap-3 min-w-0">
              <div class="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {{ entry.avatar }}
              </div>
              <div class="min-w-0">
                <div class="text-slate-800 font-medium text-sm truncate">{{ entry.name }}</div>
                <div class="text-muted text-xs">{{ entry.quizWins }} quiz wins</div>
              </div>
            </div>
            <div class="col-span-3 text-right">
              <span class="text-red-600 font-bold text-sm">{{ entry.score.toLocaleString('en-IN') }}</span>
              <div class="text-muted text-xs">answers</div>
            </div>
            <div class="hidden sm:block col-span-2 text-right">
              <span class="text-slate-700 font-semibold">{{ entry.quizWins }}</span>
            </div>
            <div class="col-span-4 sm:col-span-2 text-right">
              <span class="text-green-600 font-semibold text-sm">₹{{ entry.totalEarnings.toLocaleString('en-IN') }}</span>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class LeaderboardComponent implements OnInit {
  leaderboard: LeaderboardEntry[] = [];
  topThree: Array<LeaderboardEntry | undefined> = [];

  constructor(private data: DataService, private state: StateService) {}

  ngOnInit() {
    this.leaderboard = this.state.leaderboard();
    this.topThree = this.leaderboard.slice(0, 3);
  }

  getRankClass(rank: number): string {
    if (rank === 1) return 'rank-badge-1';
    if (rank === 2) return 'rank-badge-2';
    if (rank === 3) return 'rank-badge-3';
    return 'rank-badge-other';
  }
}
