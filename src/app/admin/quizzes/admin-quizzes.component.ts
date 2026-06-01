import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../shared/services/data.service';
import { Quiz } from '../../shared/models/models';

@Component({
  selector: 'app-admin-quizzes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fade-in space-y-5">

      <!-- Header -->
      <div class="flex items-center justify-between gap-3">
        <div>
          <h1 class="page-header">Manage Quizzes</h1>
          <p class="page-subheader">Create, edit and delete quizzes</p>
        </div>
        <button class="btn-primary text-sm px-4" (click)="openAdd()">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          <span class="hidden sm:inline">Add Quiz</span>
          <span class="sm:hidden">Add</span>
        </button>
      </div>

      <!-- Stats row -->
      <div class="grid grid-cols-3 gap-3">
        <div class="stat-card text-center p-3">
          <div class="text-xl font-bold text-slate-800">{{ quizzes.length }}</div>
          <div class="text-muted text-xs mt-0.5">Total</div>
        </div>
        <div class="stat-card text-center p-3">
          <div class="text-xl font-bold text-red-600">{{ liveCount }}</div>
          <div class="text-muted text-xs mt-0.5">Live</div>
        </div>
        <div class="stat-card text-center p-3">
          <div class="text-xl font-bold text-amber-600">{{ upcomingCount }}</div>
          <div class="text-muted text-xs mt-0.5">Upcoming</div>
        </div>
      </div>

      <!-- Quiz list -->
      <div class="space-y-3">
        @for (quiz of quizzes; track quiz.id) {
          <div class="glass-card p-4">
            <!-- Top row: title + actions -->
            <div class="flex items-start gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-2 mb-1">
                  @if (quiz.status === 'live') {
                    <span class="badge-live">LIVE</span>
                  } @else if (quiz.status === 'upcoming') {
                    <span class="badge-upcoming">UPCOMING</span>
                  } @else {
                    <span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 font-semibold">DONE</span>
                  }
                  <span class="text-xs text-muted bg-slate-100 px-2 py-0.5 rounded-full">{{ quiz.category }}</span>
                </div>
                <h3 class="text-slate-800 font-semibold text-sm leading-snug">{{ quiz.title }}</h3>
                <p class="text-muted text-xs mt-1">🕐 {{ formatTime(quiz.startTime) }} · {{ quiz.duration }} min</p>
              </div>
              <!-- Action buttons -->
              <div class="flex gap-2 flex-shrink-0">
                <button
                  class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-colors"
                  (click)="editQuiz(quiz)"
                  title="Edit">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button
                  class="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors"
                  (click)="deleteQuiz(quiz.id)"
                  title="Delete">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Stats grid -->
            <div class="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-100">
              <div class="text-center">
                <div class="text-sm font-bold text-slate-800">₹{{ quiz.entryFee }}</div>
                <div class="text-xs text-muted">Entry</div>
              </div>
              <div class="text-center">
                <div class="text-sm font-bold text-green-600">₹{{ formatAmount(quiz.prizePool) }}</div>
                <div class="text-xs text-muted">Prize</div>
              </div>
              <div class="text-center">
                <div class="text-sm font-bold text-slate-800">{{ quiz.totalParticipants }}/{{ quiz.maxParticipants }}</div>
                <div class="text-xs text-muted">Players</div>
              </div>
              <div class="text-center">
                <div class="text-sm font-bold text-slate-800">{{ quiz.totalQuestions }}Q</div>
                <div class="text-xs text-muted">Questions</div>
              </div>
            </div>

            <!-- Fill bar -->
            <div class="mt-3">
              <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all"
                  [style.width.%]="(quiz.totalParticipants / quiz.maxParticipants) * 100"></div>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Add/Edit Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center sm:p-4 overflow-y-auto">
          <div class="bg-white w-full sm:max-w-lg sm:mx-auto sm:rounded-2xl rounded-t-2xl p-5 sm:p-6 max-h-[92dvh] overflow-y-auto">

            <!-- Handle (mobile) -->
            <div class="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden"></div>

            <div class="flex items-center justify-between mb-5">
              <h3 class="text-slate-800 font-bold text-lg">{{ editingId ? 'Edit Quiz' : 'New Quiz' }}</h3>
              <button class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200" (click)="closeModal()">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Quiz Title *</label>
                <input type="text" class="input-field" placeholder="e.g. Sports Mania Challenge" [(ngModel)]="form.title"/>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                  <select class="input-field" [(ngModel)]="form.category">
                    <option value="General">General Knowledge</option>
                    <option value="Science">Science</option>
                    <option value="Sports">Sports</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="History">History</option>
                    <option value="Geography">Geography</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                  <select class="input-field" [(ngModel)]="form.status">
                    <option value="upcoming">Upcoming</option>
                    <option value="live">Live</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Entry Fee (₹)</label>
                  <input type="number" class="input-field" placeholder="50" [(ngModel)]="form.entryFee" inputmode="numeric"/>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Prize Pool (₹)</label>
                  <input type="number" class="input-field" placeholder="5000" [(ngModel)]="form.prizePool" inputmode="numeric"/>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Max Players</label>
                  <input type="number" class="input-field" placeholder="200" [(ngModel)]="form.maxParticipants" inputmode="numeric"/>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Questions</label>
                  <input type="number" class="input-field" placeholder="21" [(ngModel)]="form.totalQuestions" inputmode="numeric"/>
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Start Date & Time</label>
                <input type="datetime-local" class="input-field" [(ngModel)]="form.startTime"/>
              </div>
            </div>

            @if (formError()) {
              <div class="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{{ formError() }}</div>
            }

            <div class="flex gap-3 mt-5">
              <button class="btn-secondary flex-1" (click)="closeModal()">Cancel</button>
              <button class="btn-primary flex-1" (click)="saveQuiz()">
                {{ editingId ? 'Update' : 'Create Quiz' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Delete Confirm -->
      @if (showDeleteConfirm()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div class="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl">
            <div class="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </div>
            <h3 class="text-slate-800 font-bold text-lg mb-2">Delete Quiz?</h3>
            <p class="text-muted text-sm mb-6">This cannot be undone. All questions and participant data will be lost.</p>
            <div class="flex gap-3">
              <button class="btn-secondary flex-1" (click)="showDeleteConfirm.set(false)">Cancel</button>
              <button class="btn-danger flex-1 py-3" (click)="confirmDelete()">Delete</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminQuizzesComponent implements OnInit {
  quizzes: Quiz[] = [];
  showModal = signal(false);
  showDeleteConfirm = signal(false);
  formError = signal('');
  deleteTargetId = '';
  editingId = '';

  form = this.emptyForm();

  get liveCount() { return this.quizzes.filter(q => q.status === 'live').length; }
  get upcomingCount() { return this.quizzes.filter(q => q.status === 'upcoming').length; }

  constructor(private data: DataService) {}

  ngOnInit() { this.quizzes = this.data.getQuizzes(); }

  openAdd() {
    this.editingId = '';
    this.form = this.emptyForm();
    this.formError.set('');
    this.showModal.set(true);
  }

  editQuiz(quiz: Quiz) {
    this.editingId = quiz.id;
    this.form = {
      title: quiz.title,
      category: quiz.category,
      status: quiz.status,
      entryFee: quiz.entryFee,
      prizePool: quiz.prizePool,
      maxParticipants: quiz.maxParticipants,
      totalQuestions: quiz.totalQuestions,
      startTime: quiz.startTime.slice(0, 16)
    };
    this.formError.set('');
    this.showModal.set(true);
  }

  deleteQuiz(id: string) {
    this.deleteTargetId = id;
    this.showDeleteConfirm.set(true);
  }

  confirmDelete() {
    this.quizzes = this.quizzes.filter(q => q.id !== this.deleteTargetId);
    this.showDeleteConfirm.set(false);
  }

  saveQuiz() {
    if (!this.form.title?.trim()) { this.formError.set('Quiz title is required'); return; }
    if (!this.form.entryFee || this.form.entryFee < 0) { this.formError.set('Enter a valid entry fee'); return; }
    if (!this.form.prizePool || this.form.prizePool <= 0) { this.formError.set('Enter a valid prize pool'); return; }

    if (this.editingId) {
      this.quizzes = this.quizzes.map(q =>
        q.id === this.editingId
          ? { ...q, ...this.form, entryFee: +this.form.entryFee!, prizePool: +this.form.prizePool!, maxParticipants: +this.form.maxParticipants! }
          : q
      );
    } else {
      this.quizzes = [{
        id: 'q_' + Date.now(),
        title: this.form.title,
        category: this.form.category,
        status: this.form.status,
        entryFee: +this.form.entryFee!,
        prizePool: +this.form.prizePool!,
        maxParticipants: +this.form.maxParticipants!,
        totalParticipants: 0,
        totalQuestions: +this.form.totalQuestions,
        startTime: this.form.startTime,
        duration: 15
      }, ...this.quizzes];
    }
    this.closeModal();
  }

  closeModal() {
    this.showModal.set(false);
    this.formError.set('');
  }

  formatTime(d: string): string {
    return new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  formatAmount(n: number): string {
    if (n >= 100000) return (n / 100000).toFixed(1) + 'L';
    if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
    return n.toString();
  }

  private emptyForm() {
    return { title: '', category: 'General', status: 'upcoming' as const, entryFee: null as number | null, prizePool: null as number | null, maxParticipants: null as number | null, totalQuestions: 21, startTime: '' };
  }
}
