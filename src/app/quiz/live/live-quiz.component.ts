import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../shared/services/data.service';
import { Question, LeaderboardEntry } from '../../shared/models/models';

@Component({
  selector: 'app-live-quiz',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="fade-in">
      <!-- Quiz Not Started or Completed -->
      @if (quizState() === 'lobby') {
        <div class="max-w-2xl mx-auto text-center py-16">
          <div class="glass-card p-10">
            <div class="w-20 h-20 rounded-2xl bg-red-500/15 flex items-center justify-center mx-auto mb-6">
              <svg class="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <span class="badge-live text-sm mb-4 inline-flex">LIVE NOW</span>
            <h2 class="text-2xl font-bold text-slate-800 mt-3 mb-2">Sports Mania Challenge</h2>
            <p class="text-muted mb-2">200 players competing • Prize Pool ₹7,500</p>
            <p class="text-muted text-sm mb-8">Entry fee: ₹75 has been deducted from your wallet</p>
            <div class="grid grid-cols-3 gap-4 mb-8">
              <div class="stat-card text-center">
                <div class="text-xl font-bold text-slate-800">21</div>
                <div class="text-muted text-xs mt-1">Questions</div>
              </div>
              <div class="stat-card text-center">
                <div class="text-xl font-bold text-slate-800">15s</div>
                <div class="text-muted text-xs mt-1">Per Question</div>
              </div>
              <div class="stat-card text-center">
                <div class="text-xl font-bold text-slate-800">100</div>
                <div class="text-muted text-xs mt-1">Points Each</div>
              </div>
            </div>
            <button class="btn-primary px-10 py-3 text-base" (click)="startQuiz()">
              Start Quiz Now →
            </button>
          </div>
        </div>
      }

      <!-- Active Quiz -->
      @if (quizState() === 'active') {
        <div class="grid grid-cols-1 xl:grid-cols-4 gap-5 max-w-7xl mx-auto">
          <!-- Main Quiz Area -->
          <div class="xl:col-span-3 space-y-4">
            <!-- Top Bar -->
            <div class="glass-card p-4 flex items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <span class="badge-live">LIVE</span>
                <span class="text-slate-800 font-semibold text-sm">Sports Mania Challenge</span>
              </div>
              <div class="flex items-center gap-4">
                <div class="text-center">
                  <div class="text-red-600 font-bold text-lg leading-none">{{ currentScore() }}</div>
                  <div class="text-muted text-xs">Score</div>
                </div>
                <div class="text-center">
                  <div class="text-slate-800 font-bold text-lg leading-none">{{ currentQuestionIndex() + 1 }}/{{ questions.length }}</div>
                  <div class="text-muted text-xs">Question</div>
                </div>
              </div>
            </div>

            <!-- Timer Bar -->
            <div class="glass-card p-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-muted text-xs font-medium">TIME REMAINING</span>
                <span [class]="timeLeft() <= 5 ? 'text-red-400 font-bold text-lg' : 'text-white font-bold text-lg'">
                  {{ timeLeft() }}s
                </span>
              </div>
              <div class="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-1000"
                  [class]="timeLeft() <= 5 ? 'timer-danger' : 'timer-bar'"
                  [style.width.%]="(timeLeft() / 15) * 100"
                ></div>
              </div>
            </div>

            <!-- Question Card -->
            <div class="glass-card p-6">
              <div class="flex items-center gap-2 mb-4">
                <span class="text-xs text-blue-600 font-semibold bg-blue-50 px-3 py-1 rounded-full">
                  Question {{ currentQuestionIndex() + 1 }} of {{ questions.length }}
                </span>
                <span class="text-xs text-muted">{{ currentQuestion()?.points }} points</span>
              </div>

              <h3 class="text-slate-800 text-lg font-semibold mb-6 leading-relaxed">
                {{ currentQuestion()?.text }}
              </h3>

              <!-- Answer Options -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                @for (option of currentQuestion()?.options; track $index) {
                  <button
                    class="answer-option text-left"
                    [class.selected]="selectedAnswer() === $index && !showResult()"
                    [class.correct]="showResult() && $index === currentQuestion()?.correctAnswer"
                    [class.wrong]="showResult() && selectedAnswer() === $index && $index !== currentQuestion()?.correctAnswer"
                    [disabled]="selectedAnswer() !== null || timeLeft() === 0"
                    (click)="selectAnswer($index)"
                  >
                    <span class="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600 font-bold text-sm flex-shrink-0">
                      {{ optionLabels[$index] }}
                    </span>
                    <span class="flex-1 text-slate-700">{{ option }}</span>
                    @if (showResult() && $index === currentQuestion()?.correctAnswer) {
                      <span class="text-green-400 text-lg">✓</span>
                    }
                    @if (showResult() && selectedAnswer() === $index && $index !== currentQuestion()?.correctAnswer) {
                      <span class="text-red-400 text-lg">✗</span>
                    }
                  </button>
                }
              </div>

              <!-- Result Message -->
              @if (showResult()) {
                <div class="mt-4 p-3 rounded-lg text-center"
                  [class]="selectedAnswer() === currentQuestion()?.correctAnswer
                    ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                    : 'bg-red-500/10 border border-red-500/30 text-red-400'">
                  @if (selectedAnswer() === currentQuestion()?.correctAnswer) {
                    <span class="font-semibold">✓ Correct! +{{ currentQuestion()?.points }} points</span>
                  } @else if (selectedAnswer() === null) {
                    <span class="font-semibold">⏱ Time's up! The answer was "{{ currentQuestion()!.options[currentQuestion()!.correctAnswer] }}"</span>
                  } @else {
                    <span class="font-semibold">✗ Wrong! The answer was "{{ currentQuestion()!.options[currentQuestion()!.correctAnswer] }}"</span>
                  }
                </div>
              }
            </div>

            <!-- Progress -->
            <div class="glass-card p-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-muted text-xs">Quiz Progress</span>
                <span class="text-muted text-xs">{{ currentQuestionIndex() + 1 }}/{{ questions.length }}</span>
              </div>
              <div class="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500"
                  [style.width.%]="((currentQuestionIndex() + 1) / questions.length) * 100"
                ></div>
              </div>
            </div>
          </div>

          <!-- Live Leaderboard Sidebar -->
          <div class="glass-card p-5 h-fit">
            <h3 class="text-slate-800 font-bold mb-4 flex items-center gap-2">
              <span>🏆</span> Live Rankings
            </h3>
            <div class="space-y-2">
              @for (entry of liveLeaderboard; track entry.rank) {
                <div class="flex items-center gap-2 p-2 rounded-lg"
                  [class]="entry.name === 'You' ? 'bg-blue-500/15 border border-blue-500/25' : ''">
                  <div [class]="getRankClass(entry.rank)" class="text-xs">{{ entry.rank }}</div>
                  <div class="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {{ entry.avatar }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-slate-800 text-xs font-medium truncate">{{ entry.name }}</div>
                  </div>
                  <div class="text-red-600 text-xs font-bold">{{ entry.score }}</div>
                </div>
              }
            </div>
            <div class="mt-4 pt-4 border-t border-blue-900/30">
              <div class="text-center">
                <div class="text-muted text-xs">Players Remaining</div>
                <div class="text-slate-800 font-bold text-xl">{{ 200 - currentQuestionIndex() * 8 }}</div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Quiz Completed -->
      @if (quizState() === 'completed') {
        <div class="max-w-xl mx-auto text-center py-8">
          <div class="glass-card p-10">
            <div class="text-6xl mb-4">🏆</div>
            <h2 class="text-2xl font-bold text-slate-800 mb-2">Quiz Completed!</h2>
            <p class="text-muted mb-6">Great effort! Here's your result</p>

            <div class="grid grid-cols-3 gap-4 mb-6">
              <div class="stat-card text-center">
                <div class="text-2xl font-bold text-red-600">{{ currentScore() }}</div>
                <div class="text-muted text-xs mt-1">Final Score</div>
              </div>
              <div class="stat-card text-center">
                <div class="text-2xl font-bold text-green-600">{{ correctAnswers() }}</div>
                <div class="text-muted text-xs mt-1">Correct</div>
              </div>
              <div class="stat-card text-center">
                <div class="text-2xl font-bold text-purple-600">#{{ finalRank() }}</div>
                <div class="text-muted text-xs mt-1">Your Rank</div>
              </div>
            </div>

            @if (finalRank() <= 3) {
              <div class="p-4 rounded-xl bg-green-500/10 border border-green-500/30 mb-6">
                <p class="text-green-400 font-bold text-lg">🎉 You Won!</p>
                <p class="text-green-300 text-sm mt-1">Prize: ₹{{ getPrize(finalRank()) }} added to wallet</p>
              </div>
            }

            <div class="flex gap-3 justify-center">
              <a routerLink="/dashboard" class="btn-secondary">Back to Dashboard</a>
              <button class="btn-primary" (click)="resetQuiz()">Play Again</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class LiveQuizComponent implements OnInit, OnDestroy {
  questions: Question[] = [];
  liveLeaderboard: any[] = [];
  optionLabels = ['A', 'B', 'C', 'D'];

  quizState = signal<'lobby' | 'active' | 'completed'>('lobby');
  currentQuestionIndex = signal(0);
  selectedAnswer = signal<number | null>(null);
  showResult = signal(false);
  timeLeft = signal(15);
  currentScore = signal(0);
  correctAnswers = signal(0);
  finalRank = signal(12);

  private timer: any;

  currentQuestion = computed(() => this.questions[this.currentQuestionIndex()] || null);

  constructor(private data: DataService) {}

  ngOnInit() {
    this.questions = this.data.getQuestions();
    this.liveLeaderboard = this.buildLiveLeaderboard();
  }

  ngOnDestroy() {
    this.clearTimer();
  }

  buildLiveLeaderboard() {
    const entries = this.data.getLeaderboard().slice(0, 7).map((e, i) => ({
      ...e,
      score: Math.floor(Math.random() * 500) + 200
    }));
    // Insert "You"
    entries.splice(4, 0, { rank: 5, userId: 'me', name: 'You', avatar: 'ME', score: 0, quizWins: 0, totalEarnings: 0 });
    return entries.slice(0, 8).map((e, i) => ({ ...e, rank: i + 1 }));
  }

  startQuiz() {
    this.quizState.set('active');
    this.startTimer();
  }

  startTimer() {
    this.timeLeft.set(15);
    this.timer = setInterval(() => {
      this.timeLeft.update(t => t - 1);
      if (this.timeLeft() <= 0) {
        this.clearTimer();
        this.onTimeUp();
      }
    }, 1000);
  }

  clearTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  selectAnswer(index: number) {
    if (this.selectedAnswer() !== null || this.showResult()) return;
    this.clearTimer();
    this.selectedAnswer.set(index);
    this.showResult.set(true);

    const correct = this.currentQuestion()?.correctAnswer;
    if (index === correct) {
      const bonus = Math.floor((this.timeLeft() / 15) * 50);
      this.currentScore.update(s => s + 100 + bonus);
      this.correctAnswers.update(c => c + 1);
      this.updateLeaderboardScore();
    }

    setTimeout(() => this.nextQuestion(), 2000);
  }

  onTimeUp() {
    this.showResult.set(true);
    setTimeout(() => this.nextQuestion(), 2000);
  }

  nextQuestion() {
    if (this.currentQuestionIndex() >= this.questions.length - 1) {
      this.endQuiz();
      return;
    }
    this.currentQuestionIndex.update(i => i + 1);
    this.selectedAnswer.set(null);
    this.showResult.set(false);
    this.startTimer();
  }

  updateLeaderboardScore() {
    this.liveLeaderboard = this.liveLeaderboard.map(e =>
      e.name === 'You' ? { ...e, score: this.currentScore() } : e
    ).sort((a, b) => b.score - a.score).map((e, i) => ({ ...e, rank: i + 1 }));
  }

  endQuiz() {
    this.clearTimer();
    const rank = this.liveLeaderboard.find(e => e.name === 'You')?.rank || 15;
    this.finalRank.set(rank);
    this.quizState.set('completed');
  }

  resetQuiz() {
    this.quizState.set('lobby');
    this.currentQuestionIndex.set(0);
    this.selectedAnswer.set(null);
    this.showResult.set(false);
    this.timeLeft.set(15);
    this.currentScore.set(0);
    this.correctAnswers.set(0);
    this.liveLeaderboard = this.buildLiveLeaderboard();
  }

  getRankClass(rank: number): string {
    if (rank === 1) return 'rank-badge-1';
    if (rank === 2) return 'rank-badge-2';
    if (rank === 3) return 'rank-badge-3';
    return 'rank-badge-other';
  }

  getPrize(rank: number): number {
    const prizes: Record<number, number> = { 1: 3750, 2: 2250, 3: 1500 };
    return prizes[rank] || 0;
  }
}
