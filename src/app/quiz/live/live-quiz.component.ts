import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../shared/services/data.service';
import { AuthService } from '../../shared/services/auth.service';
import { StateService } from '../../shared/services/state.service';
import { Question, LivePlayer, QuizResult } from '../../shared/models/models';

@Component({
  selector: 'app-live-quiz',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="fade-in">

      <!-- ── LOBBY ── -->
      @if (quizState() === 'lobby') {
        <div class="max-w-2xl mx-auto text-center py-16">
          <div class="glass-card p-10">
            <div class="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
              <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <span class="badge-live text-sm mb-4 inline-flex">LIVE NOW</span>
            <h2 class="text-2xl font-bold text-slate-800 mt-3 mb-2">Sports Mania Challenge</h2>
            <p class="text-muted mb-1">{{ totalPlayers }} players competing · Prize Pool ₹7,500</p>
            <p class="text-muted text-sm mb-6">Entry fee: ₹75 deducted from wallet</p>

            <!-- Prize Distribution -->
            <div class="grid grid-cols-3 gap-3 mb-6">
              @for (p of prizeDistribution; track p.rank) {
                <div class="stat-card text-center">
                  <div class="text-lg mb-1">{{ p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : '🥉' }}</div>
                  <div class="text-base font-bold text-slate-800">₹{{ p.amount.toLocaleString('en-IN') }}</div>
                  <div class="text-muted text-xs mt-1">{{ p.label }}</div>
                </div>
              }
            </div>

            <div class="grid grid-cols-3 gap-4 mb-8">
              <div class="stat-card text-center">
                <div class="text-xl font-bold text-slate-800">{{ questions.length }}</div>
                <div class="text-muted text-xs mt-1">Questions</div>
              </div>
              <div class="stat-card text-center">
                <div class="text-xl font-bold text-slate-800">15s</div>
                <div class="text-muted text-xs mt-1">Per Question</div>
              </div>
              <div class="stat-card text-center">
                <div class="text-xl font-bold text-slate-800">Fastest</div>
                <div class="text-muted text-xs mt-1">Tie Breaker</div>
              </div>
            </div>

            @if (insufficientBalance()) {
              <div class="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm mb-4">
                ⚠️ Insufficient balance. Please add money to your wallet first.
              </div>
              <a routerLink="/wallet" class="btn-primary px-10 py-3 text-base">Add Money →</a>
            } @else {
              <button class="btn-primary px-10 py-3 text-base" (click)="startQuiz()">
                Start Quiz Now →
              </button>
            }
          </div>
        </div>
      }

      <!-- ── ACTIVE QUIZ ── -->
      @if (quizState() === 'active') {
        <div class="grid grid-cols-1 xl:grid-cols-4 gap-5 max-w-7xl mx-auto">

          <!-- Main Area -->
          <div class="xl:col-span-3 space-y-4">

            <!-- Top Bar -->
            <div class="glass-card p-4 flex items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <span class="badge-live">LIVE</span>
                <span class="text-slate-800 font-semibold text-sm">Sports Mania Challenge</span>
              </div>
              <div class="flex items-center gap-4">
                <div class="text-center">
                  <div class="text-red-600 font-bold text-lg leading-none">{{ correctAnswers() }}</div>
                  <div class="text-muted text-xs">Correct</div>
                </div>
                <div class="text-center">
                  <div class="text-slate-800 font-bold text-lg leading-none">{{ currentQuestionIndex() + 1 }}/{{ questions.length }}</div>
                  <div class="text-muted text-xs">Question</div>
                </div>
                <div class="text-center">
                  <div class="text-purple-600 font-bold text-lg leading-none">#{{ liveRank() }}</div>
                  <div class="text-muted text-xs">Rank</div>
                </div>
              </div>
            </div>

            <!-- Timer -->
            <div class="glass-card p-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-muted text-xs font-medium">TIME REMAINING</span>
                <span [class]="timeLeft() <= 5 ? 'text-red-500 font-bold text-lg' : 'text-slate-800 font-bold text-lg'">
                  {{ timeLeft() }}s
                </span>
              </div>
              <div class="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-1000"
                  [class]="timeLeft() <= 5 ? 'timer-danger' : 'timer-bar'"
                  [style.width.%]="(timeLeft() / 15) * 100"></div>
              </div>
            </div>

            <!-- Question -->
            <div class="glass-card p-6">
              <div class="flex items-center gap-2 mb-4">
                <span class="text-xs text-red-600 font-semibold bg-red-50 px-3 py-1 rounded-full">
                  Question {{ currentQuestionIndex() + 1 }} of {{ questions.length }}
                </span>
              </div>

              <h3 class="text-slate-800 text-lg font-semibold mb-6 leading-relaxed">
                {{ currentQuestion()!.text }}
              </h3>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                @for (option of currentQuestion()!.options; track $index) {
                  <button class="answer-option text-left"
                    [class.selected]="selectedAnswer() === $index && !showResult()"
                    [class.correct]="showResult() && $index === currentQuestion()!.correctAnswer"
                    [class.wrong]="showResult() && selectedAnswer() === $index && $index !== currentQuestion()!.correctAnswer"
                    [disabled]="selectedAnswer() !== null || timeLeft() === 0"
                    (click)="selectAnswer($index)">
                    <span class="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600 font-bold text-sm flex-shrink-0">
                      {{ optionLabels[$index] }}
                    </span>
                    <span class="flex-1 text-slate-700">{{ option }}</span>
                    @if (showResult() && $index === currentQuestion()!.correctAnswer) {
                      <span class="text-green-600 text-lg">✓</span>
                    }
                    @if (showResult() && selectedAnswer() === $index && $index !== currentQuestion()!.correctAnswer) {
                      <span class="text-red-500 text-lg">✗</span>
                    }
                  </button>
                }
              </div>

              @if (showResult()) {
                <div class="mt-4 p-3 rounded-lg text-center"
                  [class]="selectedAnswer() === currentQuestion()!.correctAnswer
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-600'">
                  @if (selectedAnswer() === currentQuestion()!.correctAnswer) {
                    <span class="font-semibold">Correct answer recorded</span>
                  } @else if (selectedAnswer() === null) {
                    <span class="font-semibold">⏱ Time's up! Answer: "{{ currentQuestion()!.options[currentQuestion()!.correctAnswer] }}"</span>
                  } @else {
                    <span class="font-semibold">✗ Wrong! Answer: "{{ currentQuestion()!.options[currentQuestion()!.correctAnswer] }}"</span>
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
                <div class="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-500"
                  [style.width.%]="((currentQuestionIndex() + 1) / questions.length) * 100"></div>
              </div>
            </div>
          </div>

          <!-- Live Leaderboard Sidebar -->
          <div class="glass-card p-5 h-fit">
            <h3 class="text-slate-800 font-bold mb-4 flex items-center gap-2">
              <span>🏆</span> Live Rankings
            </h3>
            <div class="space-y-2">
              @for (entry of livePlayers; track entry.rank) {
                <div class="flex items-center gap-2 p-2 rounded-lg transition-all"
                  [class]="entry.isCurrentUser ? 'bg-red-50 border border-red-200' : ''">
                  <div [class]="getRankClass(entry.rank)" class="text-xs">{{ entry.rank }}</div>
                  <div class="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {{ entry.avatar }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-slate-800 text-xs font-medium truncate">{{ entry.name }}</div>
                    <div class="text-muted text-xs">{{ entry.answeredCount }}/{{ currentQuestionIndex() + 1 }} ans</div>
                  </div>
                  <div class="text-right flex-shrink-0">
                    <div class="text-red-600 text-xs font-bold">{{ entry.correctCount }}/{{ entry.answeredCount }}</div>
                    <div class="text-muted text-[10px]">{{ formatMs(entry.totalTimeMs) }}</div>
                  </div>
                </div>
              }
            </div>
            <div class="mt-4 pt-4 border-t border-slate-200 text-center">
              <div class="text-muted text-xs">Players Remaining</div>
              <div class="text-slate-800 font-bold text-xl">{{ activePlayers() }}</div>
            </div>
          </div>
        </div>
      }

      <!-- ── RESULT ── -->
      @if (quizState() === 'completed') {
        <div class="max-w-xl mx-auto text-center py-8">
          <div class="glass-card p-10">
            <div class="text-6xl mb-4">{{ finalRank() <= 3 ? '🏆' : finalRank() <= 10 ? '🎯' : '💪' }}</div>
            <h2 class="text-2xl font-bold text-slate-800 mb-2">Quiz Completed!</h2>
            <p class="text-muted mb-6">Sports Mania Challenge · {{ totalPlayers }} players</p>

            <div class="grid grid-cols-3 gap-4 mb-6">
              <div class="stat-card text-center">
                <div class="text-2xl font-bold text-red-600">{{ correctAnswers() }}</div>
                <div class="text-muted text-xs mt-1">Correct Answers</div>
              </div>
              <div class="stat-card text-center">
                <div class="text-2xl font-bold text-green-600">{{ correctAnswers() }}/{{ questions.length }}</div>
                <div class="text-muted text-xs mt-1">Correct</div>
              </div>
              <div class="stat-card text-center">
                <div class="text-2xl font-bold text-purple-600">#{{ finalRank() }}</div>
                <div class="text-muted text-xs mt-1">Your Rank</div>
              </div>
            </div>

            <!-- Prize won -->
            @if (prizeMoney() > 0) {
              <div class="p-4 rounded-xl bg-green-50 border border-green-200 mb-6">
                <p class="text-green-700 font-bold text-lg">Prize Added to Wallet</p>
                <p class="text-green-600 text-sm mt-1">Rs {{ prizeMoney().toLocaleString('en-IN') }} added as virtual withdrawable balance</p>
                <p class="text-green-500 text-xs mt-1">Rank #{{ finalRank() }} - {{ finalRank() === 1 ? '50%' : finalRank() === 2 ? '30%' : '20%' }} of prize pool</p>
              </div>
            } @else {
              <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6">
                <p class="text-slate-600 text-sm">Better luck next time! Top 3 players win prizes.</p>
                <p class="text-muted text-xs mt-1">{{ correctAnswers() }} correct answers - Rank: #{{ finalRank() }}</p>
              </div>
            }

            <!-- Accuracy -->
            <div class="p-3 rounded-lg bg-slate-50 border border-slate-200 mb-6">
              <div class="flex justify-between text-sm">
                <span class="text-muted">Accuracy</span>
                <span class="text-slate-800 font-semibold">{{ accuracy() }}%</span>
              </div>
              <div class="h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
                <div class="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                  [style.width.%]="accuracy()"></div>
              </div>
            </div>

            <div class="flex gap-3 justify-center">
              <a routerLink="/dashboard" class="btn-secondary">Dashboard</a>
              <a routerLink="/leaderboard" class="btn-secondary">Leaderboard</a>
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
  livePlayers: LivePlayer[] = [];
  optionLabels = ['A', 'B', 'C', 'D'];
  totalPlayers = 200;
  prizeDistribution = this.state.getPrizeDistribution(7500);

  quizState = signal<'lobby' | 'active' | 'completed'>('lobby');
  currentQuestionIndex = signal(0);
  selectedAnswer = signal<number | null>(null);
  showResult = signal(false);
  timeLeft = signal(15);
  correctAnswers = signal(0);
  finalRank = signal(12);
  prizeMoney = signal(0);
  quizStartTime = 0;

  private timer: any;

  currentQuestion = computed(() => this.questions[this.currentQuestionIndex()]);
  liveRank = computed(() => this.livePlayers.find(p => p.isCurrentUser)?.rank ?? this.totalPlayers);
  activePlayers = computed(() => Math.max(1, this.totalPlayers - this.currentQuestionIndex() * 8));
  accuracy = computed(() => this.questions.length > 0 ? Math.round((this.correctAnswers() / this.questions.length) * 100) : 0);
  insufficientBalance = computed(() => {
    const user = this.auth.currentUser();
    return ((user?.walletBalance ?? 0) + (user?.bonusBalance ?? 0)) < 75;
  });

  constructor(private data: DataService, private auth: AuthService, private state: StateService) {}

  ngOnInit() {
    this.questions = this.data.getQuestions();
    this.livePlayers = this.buildLivePlayers();
  }

  ngOnDestroy() { this.clearTimer(); }

  buildLivePlayers(): LivePlayer[] {
    const base: LivePlayer[] = this.state.leaderboard().slice(0, 7).map((e, i) => ({
      rank: i + 1,
      userId: e.userId,
      name: e.name,
      avatar: e.avatar,
      score: 0,
      correctCount: 0,
      answeredCount: 0,
      totalTimeMs: 0,
      isCurrentUser: false as boolean
    }));

    const user = this.auth.currentUser();
    const me: LivePlayer = {
      rank: 5,
      userId: user?.id || 'me',
      name: user?.name || 'You',
      avatar: user?.avatar || 'ME',
      score: 0,
      correctCount: 0,
      answeredCount: 0,
      totalTimeMs: 0,
      isCurrentUser: true
    };
    base.splice(4, 0, me);
    return base.slice(0, 8).map((p, i) => ({ ...p, rank: i + 1 }));
  }

  startQuiz() {
    if (this.auth.payEntryFee(75) === 'insufficient') return;
    this.state.addTransaction({
      userId: this.auth.currentUser()?.id,
      type: 'entry_fee',
      amount: -75,
      description: 'Entry fee - Sports Mania Challenge',
      status: 'success'
    });
    this.quizStartTime = Date.now();
    this.quizState.set('active');
    this.startTimer();
  }

  startTimer() {
    this.timeLeft.set(15);
    this.timer = setInterval(() => {
      this.timeLeft.update(t => t - 1);
      // Simulate other players answering
      if (this.timeLeft() === 10) this.simulateOtherPlayers();
      if (this.timeLeft() <= 0) { this.clearTimer(); this.onTimeUp(); }
    }, 1000);
  }

  clearTimer() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }

  selectAnswer(index: number) {
    if (this.selectedAnswer() !== null || this.showResult()) return;
    this.clearTimer();
    this.selectedAnswer.set(index);
    this.showResult.set(true);

    const q = this.currentQuestion();
    if (index === q.correctAnswer) {
      this.correctAnswers.update(c => c + 1);
    }

    this.updateMyScore();
    setTimeout(() => this.nextQuestion(), 2000);
  }

  onTimeUp() {
    this.showResult.set(true);
    this.updateMyScore();
    setTimeout(() => this.nextQuestion(), 2000);
  }

  simulateOtherPlayers() {
    this.livePlayers = this.livePlayers.map(p => {
      if (p.isCurrentUser) return p;
      const answered = Math.random() > 0.3;
      const correct = Math.random() > 0.4;
      return {
        ...p,
        score: p.score + (answered && correct ? 1 : 0),
        correctCount: p.correctCount + (answered && correct ? 1 : 0),
        answeredCount: p.answeredCount + (answered ? 1 : 0),
        totalTimeMs: p.totalTimeMs + (answered ? (15 - this.timeLeft()) * 1000 : 15000)
      };
    });
    this.reRankPlayers();
  }

  updateMyScore() {
    this.livePlayers = this.livePlayers.map(p =>
      p.isCurrentUser ? {
        ...p,
        score: this.correctAnswers(),
        correctCount: this.correctAnswers(),
        answeredCount: this.currentQuestionIndex() + 1,
        totalTimeMs: p.totalTimeMs + (15 - this.timeLeft()) * 1000
      } : p
    );
    this.reRankPlayers();
  }

  reRankPlayers() {
    this.livePlayers = [...this.livePlayers]
      .sort((a, b) => b.correctCount - a.correctCount || a.totalTimeMs - b.totalTimeMs || b.answeredCount - a.answeredCount)
      .map((p, i) => ({ ...p, rank: i + 1 }));
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

  endQuiz() {
    this.clearTimer();
    const myPlayer = this.livePlayers.find(p => p.isCurrentUser);
    const rank = myPlayer?.rank ?? 15;
    this.finalRank.set(rank);

    const prize = this.state.calculatePrize(7500, rank);
    this.prizeMoney.set(prize);

    const user = this.auth.currentUser();
    const timeTaken = Math.floor((Date.now() - this.quizStartTime) / 1000);

    // Save result
    const result: QuizResult = {
      quizId: 'q3',
      quizTitle: 'Sports Mania Challenge',
      userId: user?.id || 'me',
      score: this.correctAnswers(),
      correctAnswers: this.correctAnswers(),
      totalQuestions: this.questions.length,
      rank,
      totalParticipants: this.totalPlayers,
      prize,
      timeTaken,
      completedAt: new Date().toISOString()
    };
    this.state.saveQuizResult(result);

    // Update leaderboard
    this.state.updateUserInLeaderboard(
      user?.id || 'me',
      user?.name || 'You',
      user?.avatar || 'ME',
      this.correctAnswers(),
      prize,
      rank <= 3
    );

    // Update user stats
    this.auth.updateStats(
      rank <= 3 ? 1 : 0,
      1,
      prize,
      this.state.getUserRank(user?.id || 'me')
    );

    // Prize is virtual wallet balance. Real money moves only when the user withdraws.
    if (prize > 0) {
      this.auth.updateWallet(prize);
      this.state.addTransaction({
        userId: user?.id || 'me',
        type: 'prize',
        amount: prize,
        description: `Prize won - Sports Mania Challenge (Rank #${rank})`,
        status: 'success',
        reference: 'PRIZE_' + Date.now()
      });
      this.state.addWinner({
        userId: user?.id || 'me',
        name: user?.name || 'You',
        avatar: user?.avatar || 'ME',
        quizTitle: 'Sports Mania Challenge',
        prize,
        rank,
        date: new Date().toISOString().split('T')[0]
      });
      this.state.addNotification({
        type: 'prize',
        title: 'Prize Added to Wallet',
        message: `Rs ${prize.toLocaleString('en-IN')} virtual prize balance added for Rank #${rank}`
      });
    } else {
      this.state.addNotification({
        type: 'quiz',
        title: 'Quiz Completed',
        message: `You answered ${this.correctAnswers()} correctly (Rank #${rank}) in Sports Mania Challenge`
      });
    }

    this.quizState.set('completed');
  }

  resetQuiz() {
    this.quizState.set('lobby');
    this.currentQuestionIndex.set(0);
    this.selectedAnswer.set(null);
    this.showResult.set(false);
    this.timeLeft.set(15);
    this.correctAnswers.set(0);
    this.finalRank.set(12);
    this.prizeMoney.set(0);
    this.livePlayers = this.buildLivePlayers();
  }

  formatMs(ms: number): string {
    return `${(ms / 1000).toFixed(1)}s`;
  }

  getRankClass(rank: number): string {
    if (rank === 1) return 'rank-badge-1';
    if (rank === 2) return 'rank-badge-2';
    if (rank === 3) return 'rank-badge-3';
    return 'rank-badge-other';
  }
}
