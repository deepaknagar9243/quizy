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
    <div class="fade-in space-y-6">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 class="page-header">Manage Questions</h1>
          <p class="page-subheader">Add and manage quiz questions</p>
        </div>
        <button class="btn-primary" (click)="openAddModal()">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Add Question
        </button>
      </div>

      <!-- Filter Bar -->
      <div class="glass-card p-4 flex flex-wrap gap-3 items-center">
        <div class="flex-1 min-w-48">
          <input type="text" class="input-field py-2 text-sm" placeholder="Search questions..." [(ngModel)]="searchQuery" />
        </div>
        <select class="input-field py-2 text-sm w-auto" [(ngModel)]="filterQuiz">
          <option value="">All Quizzes</option>
          <option value="q3">Sports Mania Challenge</option>
          <option value="q1">General Knowledge Blitz</option>
        </select>
        <div class="text-muted text-sm">{{ filteredQuestions.length }} questions</div>
      </div>

      <!-- Questions List -->
      <div class="space-y-3">
        @for (question of filteredQuestions; track question.id) {
          <div class="glass-card p-5">
            <div class="flex items-start gap-4">
              <div class="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600 font-bold text-sm flex-shrink-0 mt-0.5">
                Q
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-slate-800 font-medium text-sm mb-3">{{ question.text }}</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  @for (option of question.options; track $index) {
                    <div class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                      [class]="$index === question.correctAnswer
                        ? 'bg-green-50 border border-green-200 text-green-700'
                        : 'bg-slate-50 border border-slate-200 text-slate-600'">
                      <span class="w-5 h-5 rounded flex items-center justify-center font-bold flex-shrink-0"
                        [class]="$index === question.correctAnswer ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-500'">
                        {{ optionLabels[$index] }}
                      </span>
                      {{ option }}
                      @if ($index === question.correctAnswer) {
                        <span class="ml-auto">✓</span>
                      }
                    </div>
                  }
                </div>
                <div class="flex items-center gap-4 mt-3 text-xs text-muted">
                  <span>⏱ {{ question.timeLimit }}s</span>
                </div>
              </div>
              <div class="flex gap-2 flex-shrink-0">
                <button class="btn-secondary text-xs px-3 py-1.5" (click)="editQuestion(question)">Edit</button>
                <button class="btn-danger text-xs" (click)="deleteQuestion(question.id)">Del</button>
              </div>
            </div>
          </div>
        }

        @if (filteredQuestions.length === 0) {
          <div class="glass-card p-12 text-center">
            <div class="text-4xl mb-3">❓</div>
            <p class="text-muted">No questions found</p>
          </div>
        }
      </div>

      <!-- Add/Edit Question Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div class="glass-card p-6 w-full max-w-2xl my-4">
            <h3 class="text-slate-800 font-bold text-lg mb-5">
              {{ editingId ? 'Edit Question' : 'Add New Question' }}
            </h3>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-2">Quiz</label>
                <select class="input-field" [(ngModel)]="form.quizId">
                  <option value="q3">Sports Mania Challenge</option>
                  <option value="q1">General Knowledge Blitz</option>
                  <option value="q2">Science & Technology Quiz</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-600 mb-2">Question Text</label>
                <textarea
                  class="input-field h-24 resize-none"
                  placeholder="Enter the question..."
                  [(ngModel)]="form.text"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-600 mb-3">Answer Options</label>
                <div class="space-y-2">
                  @for (label of optionLabels; track label; let i = $index) {
                    <div class="flex items-center gap-3">
                      <label class="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="correctAnswer"
                          [value]="i"
                          [(ngModel)]="form.correctAnswer"
                          class="accent-green-500"
                        />
                        <span class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                          [class]="form.correctAnswer === i ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-500 border border-red-100'">
                          {{ label }}
                        </span>
                      </label>
                      <input
                        type="text"
                        class="input-field flex-1 py-2"
                        [placeholder]="'Option ' + label"
                        [(ngModel)]="form.options[i]"
                      />
                    </div>
                  }
                </div>
                <p class="text-xs text-muted mt-2">Select the radio button next to the correct answer</p>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-600 mb-2">Time Limit (seconds)</label>
                  <select class="input-field" [(ngModel)]="form.timeLimit">
                    <option value="10">10 seconds</option>
                    <option value="15">15 seconds</option>
                    <option value="20">20 seconds</option>
                    <option value="30">30 seconds</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="flex gap-3 mt-6">
              <button class="btn-secondary flex-1 justify-center" (click)="showModal.set(false)">Cancel</button>
              <button class="btn-primary flex-1 justify-center" (click)="saveQuestion()">
                {{ editingId ? 'Update Question' : 'Add Question' }}
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
  searchQuery = '';
  filterQuiz = '';
  editingId = '';
  optionLabels = ['A', 'B', 'C', 'D'];

  form = {
    quizId: 'q3',
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    timeLimit: 15,
    points: 100
  };

  get filteredQuestions(): Question[] {
    return this.questions.filter(q => {
      const matchSearch = !this.searchQuery || q.text.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchQuiz = !this.filterQuiz || q.quizId === this.filterQuiz;
      return matchSearch && matchQuiz;
    });
  }

  constructor(private data: DataService) {}

  ngOnInit() {
    this.questions = this.data.getQuestions();
  }

  openAddModal() {
    this.editingId = '';
    this.form = { quizId: 'q3', text: '', options: ['', '', '', ''], correctAnswer: 0, timeLimit: 15, points: 100 };
    this.showModal.set(true);
  }

  editQuestion(question: Question) {
    this.editingId = question.id;
    this.form = {
      quizId: question.quizId,
      text: question.text,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
      timeLimit: question.timeLimit,
      points: question.points
    };
    this.showModal.set(true);
  }

  deleteQuestion(id: string) {
    this.questions = this.questions.filter(q => q.id !== id);
  }

  saveQuestion() {
    if (!this.form.text || this.form.options.some(o => !o)) return;
    if (this.editingId) {
      this.questions = this.questions.map(q =>
        q.id === this.editingId ? { ...q, ...this.form } : q
      );
    } else {
      const newQ: Question = {
        id: 'qs_' + Date.now(),
        ...this.form
      };
      this.questions = [newQ, ...this.questions];
    }
    this.showModal.set(false);
  }
}
