import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../shared/services/data.service';
import { Question } from '../../shared/models/models';

@Component({
  selector: 'app-admin-questions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fade-in space-y-5">

      <!-- Header -->
      <div class="flex items-center justify-between gap-3">
        <div>
          <h1 class="page-header">Manage Questions</h1>
          <p class="page-subheader">Add and manage quiz questions</p>
        </div>
        <button class="btn-primary text-sm px-4" (click)="openAdd()">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          <span class="hidden sm:inline">Add Question</span>
          <span class="sm:hidden">Add</span>
        </button>
      </div>

      <!-- Filter bar -->
      <div class="glass-card p-3 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          class="input-field py-2.5 text-sm flex-1"
          placeholder="Search questions..."
          [(ngModel)]="searchQuery"/>
        <select class="input-field py-2.5 text-sm sm:w-48" [(ngModel)]="filterQuiz">
          <option value="">All Quizzes</option>
          <option value="q3">Sports Mania</option>
          <option value="q1">GK Blitz</option>
          <option value="q2">Science Quiz</option>
        </select>
        <div class="flex items-center gap-2 px-1">
          <span class="text-muted text-sm font-medium">{{ filteredQuestions.length }}</span>
          <span class="text-muted text-xs">questions</span>
        </div>
      </div>

      <!-- Questions list -->
      <div class="space-y-3">
        @for (q of filteredQuestions; track q.id) {
          <div class="glass-card p-4">
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-600 font-bold text-xs flex-shrink-0 mt-0.5">Q</div>
              <div class="flex-1 min-w-0">
                <p class="text-slate-800 font-medium text-sm leading-snug mb-3">{{ q.text }}</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  @for (opt of q.options; track $index) {
                    <div class="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium"
                      [class]="$index === q.correctAnswer
                        ? 'bg-green-50 border border-green-200 text-green-700'
                        : 'bg-slate-50 border border-slate-200 text-slate-600'">
                      <span class="w-5 h-5 rounded-md flex items-center justify-center font-bold flex-shrink-0 text-xs"
                        [class]="$index === q.correctAnswer ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'">
                        {{ labels[$index] }}
                      </span>
                      <span class="flex-1 truncate">{{ opt }}</span>
                      @if ($index === q.correctAnswer) {
                        <svg class="w-3.5 h-3.5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                        </svg>
                      }
                    </div>
                  }
                </div>
                <div class="flex items-center gap-3 mt-3 text-xs text-muted">
                  <span class="flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    {{ q.timeLimit }}s
                  </span>
                  <span>{{ q.points }} pts</span>
                </div>
              </div>
              <div class="flex flex-col gap-2 flex-shrink-0">
                <button
                  class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-colors"
                  (click)="editQuestion(q)">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button
                  class="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors"
                  (click)="deleteQuestion(q.id)">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        }

        @if (filteredQuestions.length === 0) {
          <div class="glass-card p-12 text-center">
            <div class="text-4xl mb-3">❓</div>
            <p class="text-slate-700 font-semibold">No questions found</p>
            <p class="text-muted text-sm mt-1">Try a different search or add a new question</p>
          </div>
        }
      </div>

      <!-- Add/Edit Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center sm:p-4 overflow-y-auto">
          <div class="bg-white w-full sm:max-w-2xl sm:mx-auto sm:rounded-2xl rounded-t-2xl p-5 sm:p-6 max-h-[92dvh] overflow-y-auto">

            <div class="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden"></div>

            <div class="flex items-center justify-between mb-5">
              <h3 class="text-slate-800 font-bold text-lg">{{ editingId ? 'Edit Question' : 'New Question' }}</h3>
              <button class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200" (click)="showModal.set(false)">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Quiz</label>
                <select class="input-field" [(ngModel)]="form.quizId">
                  <option value="q3">Sports Mania Challenge</option>
                  <option value="q1">General Knowledge Blitz</option>
                  <option value="q2">Science & Technology Quiz</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Question Text *</label>
                <textarea
                  class="input-field resize-none"
                  rows="3"
                  placeholder="Type the question here..."
                  [(ngModel)]="form.text">
                </textarea>
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-3">Answer Options <span class="text-muted font-normal">(tap radio = correct answer)</span></label>
                <div class="space-y-2.5">
                  @for (label of labels; track label; let i = $index) {
                    <div class="flex items-center gap-3">
                      <button
                        type="button"
                        class="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 transition-all border-2"
                        [class]="form.correctAnswer === i
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'bg-slate-100 border-slate-200 text-slate-500 hover:border-green-300'"
                        (click)="form.correctAnswer = i">
                        {{ label }}
                      </button>
                      <input
                        type="text"
                        class="input-field flex-1 py-3"
                        [placeholder]="'Option ' + label"
                        [(ngModel)]="form.options[i]"/>
                    </div>
                  }
                </div>
                <p class="text-xs text-muted mt-2 flex items-center gap-1">
                  <svg class="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  Green button = correct answer
                </p>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Time Limit</label>
                  <select class="input-field" [(ngModel)]="form.timeLimit">
                    <option [value]="10">10 seconds</option>
                    <option [value]="15">15 seconds</option>
                    <option [value]="20">20 seconds</option>
                    <option [value]="30">30 seconds</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Points</label>
                  <select class="input-field" [(ngModel)]="form.points">
                    <option [value]="50">50 pts</option>
                    <option [value]="100">100 pts</option>
                    <option [value]="150">150 pts</option>
                    <option [value]="200">200 pts</option>
                  </select>
                </div>
              </div>
            </div>

            @if (formError()) {
              <div class="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{{ formError() }}</div>
            }

            <div class="flex gap-3 mt-5">
              <button class="btn-secondary flex-1" (click)="showModal.set(false)">Cancel</button>
              <button class="btn-primary flex-1" (click)="saveQuestion()">
                {{ editingId ? 'Update' : 'Add Question' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminQuestionsComponent implements OnInit {
  questions: Question[] = [];
  showModal = signal(false);
  formError = signal('');
  searchQuery = '';
  filterQuiz = '';
  editingId = '';
  labels = ['A', 'B', 'C', 'D'];

  form = this.emptyForm();

  get filteredQuestions(): Question[] {
    return this.questions.filter(q => {
      const matchSearch = !this.searchQuery || q.text.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchQuiz = !this.filterQuiz || q.quizId === this.filterQuiz;
      return matchSearch && matchQuiz;
    });
  }

  constructor(private data: DataService) {}
  ngOnInit() { this.questions = this.data.getQuestions(); }

  openAdd() {
    this.editingId = '';
    this.form = this.emptyForm();
    this.formError.set('');
    this.showModal.set(true);
  }

  editQuestion(q: Question) {
    this.editingId = q.id;
    this.form = { quizId: q.quizId, text: q.text, options: [...q.options], correctAnswer: q.correctAnswer, timeLimit: q.timeLimit, points: q.points };
    this.formError.set('');
    this.showModal.set(true);
  }

  deleteQuestion(id: string) { this.questions = this.questions.filter(q => q.id !== id); }

  saveQuestion() {
    if (!this.form.text?.trim()) { this.formError.set('Question text is required'); return; }
    if (this.form.options.some(o => !o?.trim())) { this.formError.set('All 4 options are required'); return; }

    if (this.editingId) {
      this.questions = this.questions.map(q => q.id === this.editingId ? { ...q, ...this.form } : q);
    } else {
      this.questions = [{ id: 'qs_' + Date.now(), ...this.form }, ...this.questions];
    }
    this.showModal.set(false);
  }

  private emptyForm() {
    return { quizId: 'q3', text: '', options: ['', '', '', ''], correctAnswer: 0, timeLimit: 15, points: 100 };
  }
}
