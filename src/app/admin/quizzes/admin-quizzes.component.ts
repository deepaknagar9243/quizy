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
    <div class="fade-in space-y-6">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 class="page-header">Manage Quizzes</h1>
          <p class="page-subheader">Create, edit and delete quizzes</p>
        </div>
        <button class="btn-primary" (click)="showAddModal.set(true)">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Add Quiz
        </button>
      </div>

      <!-- Quiz Cards Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        @for (quiz of quizzes; track quiz.id) {
          <div class="glass-card p-5">
            <div class="flex items-start justify-between gap-3 mb-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  @if (quiz.status === 'live') {
                    <span class="badge-live">LIVE</span>
                  } @else if (quiz.status === 'upcoming') {
                    <span class="badge-upcoming">UPCOMING</span>
                  } @else {
                    <span class="text-xs px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/30">COMPLETED</span>
                  }
                  <span class="text-xs text-muted">{{ quiz.category }}</span>
                </div>
                <h3 class="text-white font-semibold text-sm truncate">{{ quiz.title }}</h3>
              </div>
              <div class="flex gap-2 flex-shrink-0">
                <button class="btn-secondary text-xs px-3 py-1.5" (click)="editQuiz(quiz)">Edit</button>
                <button class="btn-danger text-xs" (click)="deleteQuiz(quiz.id)">Delete</button>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 mt-3">
              <div class="glass-card-light p-3 rounded-xl">
                <div class="text-muted text-xs mb-1">Entry Fee</div>
                <div class="text-white font-bold">₹{{ quiz.entryFee }}</div>
              </div>
              <div class="glass-card-light p-3 rounded-xl">
                <div class="text-muted text-xs mb-1">Prize Pool</div>
                <div class="text-green-400 font-bold">₹{{ quiz.prizePool.toLocaleString('en-IN') }}</div>
              </div>
              <div class="glass-card-light p-3 rounded-xl">
                <div class="text-muted text-xs mb-1">Participants</div>
                <div class="text-white font-bold">{{ quiz.totalParticipants }}/{{ quiz.maxParticipants }}</div>
              </div>
              <div class="glass-card-light p-3 rounded-xl">
                <div class="text-muted text-xs mb-1">Questions</div>
                <div class="text-white font-bold">{{ quiz.totalQuestions }}</div>
              </div>
            </div>

            <div class="mt-3 pt-3 border-t border-blue-900/15 flex items-center justify-between text-xs text-muted">
              <span>🕐 {{ formatTime(quiz.startTime) }}</span>
              <span>{{ quiz.duration }} min duration</span>
            </div>
          </div>
        }
      </div>

      <!-- Add/Edit Quiz Modal -->
      @if (showAddModal() || showEditModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div class="glass-card p-6 w-full max-w-lg my-4">
            <h3 class="text-white font-bold text-lg mb-5">
              {{ showEditModal() ? 'Edit Quiz' : 'Add New Quiz' }}
            </h3>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">Quiz Title</label>
                <input type="text" class="input-field" placeholder="Enter quiz title" [(ngModel)]="form.title" />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-300 mb-2">Category</label>
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
                  <label class="block text-sm font-medium text-slate-300 mb-2">Status</label>
                  <select class="input-field" [(ngModel)]="form.status">
                    <option value="upcoming">Upcoming</option>
                    <option value="live">Live</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-300 mb-2">Entry Fee (₹)</label>
                  <input type="number" class="input-field" placeholder="e.g. 50" [(ngModel)]="form.entryFee" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-300 mb-2">Prize Pool (₹)</label>
                  <input type="number" class="input-field" placeholder="e.g. 5000" [(ngModel)]="form.prizePool" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-300 mb-2">Max Participants</label>
                  <input type="number" class="input-field" placeholder="e.g. 200" [(ngModel)]="form.maxParticipants" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-300 mb-2">Total Questions</label>
                  <input type="number" class="input-field" placeholder="e.g. 21" [(ngModel)]="form.totalQuestions" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-300 mb-2">Start Date & Time</label>
                <input type="datetime-local" class="input-field" [(ngModel)]="form.startTime" />
              </div>
            </div>

            <div class="flex gap-3 mt-6">
              <button class="btn-secondary flex-1 justify-center" (click)="closeModals()">Cancel</button>
              <button class="btn-primary flex-1 justify-center" (click)="saveQuiz()">
                {{ showEditModal() ? 'Update Quiz' : 'Create Quiz' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Delete Confirm Modal -->
      @if (showDeleteConfirm()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div class="glass-card p-6 w-full max-w-sm text-center">
            <div class="text-4xl mb-4">⚠️</div>
            <h3 class="text-white font-bold text-lg mb-2">Delete Quiz?</h3>
            <p class="text-muted text-sm mb-6">This action cannot be undone. All associated questions and participant data will be lost.</p>
            <div class="flex gap-3">
              <button class="btn-secondary flex-1 justify-center" (click)="showDeleteConfirm.set(false)">Cancel</button>
              <button class="btn-danger flex-1 justify-center py-2.5" (click)="confirmDelete()">Delete</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminQuizzesComponent implements OnInit {
  quizzes: Quiz[] = [];
  showAddModal = signal(false);
  showEditModal = signal(false);
  showDeleteConfirm = signal(false);
  deleteTargetId = '';

  form = {
    title: '',
    category: 'General',
    status: 'upcoming' as 'upcoming' | 'live' | 'completed',
    entryFee: null as number | null,
    prizePool: null as number | null,
    maxParticipants: null as number | null,
    totalQuestions: 21,
    startTime: ''
  };

  editingId = '';

  constructor(private data: DataService) {}

  ngOnInit() {
    this.quizzes = this.data.getQuizzes();
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
    this.showEditModal.set(true);
  }

  deleteQuiz(id: string) {
    this.deleteTargetId = id;
    this.showDeleteConfirm.set(true);
  }

  confirmDelete() {
    this.quizzes = this.quizzes.filter(q => q.id !== this.deleteTargetId);
    this.showDeleteConfirm.set(false);
    this.deleteTargetId = '';
  }

  saveQuiz() {
    if (!this.form.title) return;
    if (this.showEditModal()) {
      this.quizzes = this.quizzes.map(q =>
        q.id === this.editingId
          ? { ...q, ...this.form, entryFee: this.form.entryFee || 0, prizePool: this.form.prizePool || 0, maxParticipants: this.form.maxParticipants || 100 }
          : q
      );
    } else {
      const newQuiz: Quiz = {
        id: 'q_' + Date.now(),
        title: this.form.title,
        category: this.form.category,
        status: this.form.status,
        entryFee: this.form.entryFee || 0,
        prizePool: this.form.prizePool || 0,
        maxParticipants: this.form.maxParticipants || 100,
        totalParticipants: 0,
        totalQuestions: this.form.totalQuestions,
        startTime: this.form.startTime,
        duration: 15
      };
      this.quizzes = [newQuiz, ...this.quizzes];
    }
    this.closeModals();
  }

  closeModals() {
    this.showAddModal.set(false);
    this.showEditModal.set(false);
    this.resetForm();
  }

  resetForm() {
    this.form = { title: '', category: 'General', status: 'upcoming', entryFee: null, prizePool: null, maxParticipants: null, totalQuestions: 21, startTime: '' };
    this.editingId = '';
  }

  formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
}
