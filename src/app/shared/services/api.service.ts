/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  ApiService  —  Exact match with QuizArena Spring Boot backend
 *
 *  Backend base: http://localhost:8080/api
 *  All responses wrapped in: { success: boolean, message?: string, data: T }
 *
 *  TO GO LIVE: Set USE_MOCK = false  (zero component changes needed)
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, of, delay, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  User, Quiz, Question, LeaderboardEntry, Transaction, AdminStats,
  ApiSuccess, PagedData, PaginatedResponse,
  LoginRequest, RegisterRequest,
  BackendAuthData, BackendUserProfile, BackendQuiz,
  BackendQuestionDto, BackendQuestionAdminDto, BackendAnswerResult,
  BackendWalletSummary, BackendTransaction, BackendLeaderboardEntry,
  BackendAdminStats, BackendParticipation,
  PaymentRequest, PaymentResponse, WithdrawalRequest, WithdrawalResponse,
  QuizResult
} from '../models/models';

// ── Toggle: true = localStorage mock, false = real Spring Boot backend ────────
export const USE_MOCK = false;

@Injectable({ providedIn: 'root' })
export class ApiService {
  // Spring Boot runs at /api context path
  private base = environment.apiUrl;           // http://localhost:8080/api/v1
  private payBase = environment.paymentApiUrl; // http://localhost:8080/api/payment

  constructor(private http: HttpClient) {}

  // ════════════════════════════════════════════════════════════════════════════
  //  AUTH  —  /api/auth/*
  // ════════════════════════════════════════════════════════════════════════════

  /** POST /auth/login  →  { success, data: { accessToken, refreshToken, expiresIn, user } } */
  login(req: LoginRequest): Promise<BackendAuthData> {
    if (USE_MOCK) return this.mock<BackendAuthData>(null as any, 800);
    return this.post<BackendAuthData>('/auth/login', req);
  }

  /** POST /auth/register */
  register(req: RegisterRequest): Promise<BackendAuthData> {
    if (USE_MOCK) return this.mock<BackendAuthData>(null as any, 900);
    return this.post<BackendAuthData>('/auth/register', req);
  }

  /** POST /auth/refresh */
  refreshToken(refreshToken: string): Promise<BackendAuthData> {
    if (USE_MOCK) return this.mock<BackendAuthData>(null as any);
    return this.post<BackendAuthData>('/auth/refresh', { refreshToken });
  }

  /** GET /auth/me */
  getMe(): Promise<BackendUserProfile> {
    if (USE_MOCK) return this.mock<BackendUserProfile>(null as any);
    return this.get<BackendUserProfile>('/auth/me');
  }

  /** PUT /auth/change-password */
  changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (USE_MOCK) return this.mock<void>(undefined as any, 600);
    return this.put<void>('/auth/change-password', { currentPassword, newPassword });
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  QUIZZES  —  /api/quizzes/*
  // ════════════════════════════════════════════════════════════════════════════

  /** GET /quizzes?status=UPCOMING&page=0&size=10 */
  getQuizzes(params?: { status?: string; page?: number; size?: number }): Promise<PagedData<BackendQuiz>> {
    if (USE_MOCK) return this.mock<PagedData<BackendQuiz>>({ content: [], pageNumber: 0, pageSize: 10, totalElements: 0, totalPages: 0, last: true, first: true });
    return this.get<PagedData<BackendQuiz>>('/quizzes', params);
  }

  /** GET /quizzes/:id */
  getQuiz(id: number): Promise<BackendQuiz> {
    if (USE_MOCK) return this.mock<BackendQuiz>(null as any);
    return this.get<BackendQuiz>(`/quizzes/${id}`);
  }

  /** POST /quizzes/:id/join */
  joinQuiz(quizId: number): Promise<BackendParticipation> {
    if (USE_MOCK) return this.mock<BackendParticipation>(null as any);
    return this.post<BackendParticipation>(`/quizzes/${quizId}/join`, {});
  }

  /** GET /quizzes/:id/questions/:index  (0-based, no correct answer) */
  getQuestion(quizId: number, index: number): Promise<BackendQuestionDto> {
    if (USE_MOCK) return this.mock<BackendQuestionDto>(null as any);
    return this.get<BackendQuestionDto>(`/quizzes/${quizId}/questions/${index}`);
  }

  /** POST /quizzes/:id/answers */
  submitAnswer(quizId: number, payload: { questionId: number; selectedOptionIndex: number; timeTakenMs: number }): Promise<BackendAnswerResult> {
    if (USE_MOCK) return this.mock<BackendAnswerResult>(null as any);
    return this.post<BackendAnswerResult>(`/quizzes/${quizId}/answers`, payload);
  }

  /** POST /quizzes/:id/complete */
  completeQuiz(quizId: number): Promise<void> {
    if (USE_MOCK) return this.mock<void>(undefined as any);
    return this.post<void>(`/quizzes/${quizId}/complete`, {});
  }

  /** GET /quizzes/:id/leaderboard */
  getQuizLeaderboard(quizId: number): Promise<BackendLeaderboardEntry[]> {
    if (USE_MOCK) return this.mock<BackendLeaderboardEntry[]>([]);
    return this.get<BackendLeaderboardEntry[]>(`/quizzes/${quizId}/leaderboard`);
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  WALLET  —  /api/wallet/*
  // ════════════════════════════════════════════════════════════════════════════

  /** GET /wallet */
  getWalletSummary(): Promise<BackendWalletSummary> {
    if (USE_MOCK) return this.mock<BackendWalletSummary>({ balance: 0, totalDeposited: 0, totalWithdrawn: 0, totalEarned: 0, totalSpent: 0 });
    return this.get<BackendWalletSummary>('/wallet');
  }

  /** GET /wallet/transactions?page=0&size=20 */
  getTransactions(params?: { page?: number; size?: number }): Promise<PagedData<BackendTransaction>> {
    if (USE_MOCK) return this.mock<PagedData<BackendTransaction>>({ content: [], pageNumber: 0, pageSize: 20, totalElements: 0, totalPages: 0, last: true, first: true });
    return this.get<PagedData<BackendTransaction>>('/wallet/transactions', params);
  }

  /** POST /wallet/deposit */
  initiateDeposit(req: PaymentRequest): Promise<BackendTransaction> {
    if (USE_MOCK) {
      return new Promise((resolve, reject) =>
        setTimeout(() =>
          Math.random() > 0.05
            ? resolve({ id: Date.now(), type: 'DEPOSIT', amount: req.amount, description: 'Wallet deposit', status: 'SUCCESS', createdAt: new Date().toISOString() })
            : reject(new Error('Payment gateway timeout. Please try again.')),
          1500)
      );
    }
    return this.post<BackendTransaction>('/wallet/deposit', { amount: req.amount, paymentMethod: req.method.toUpperCase(), upiId: req.upiId });
  }

  /** POST /wallet/withdraw */
  initiateWithdrawal(req: WithdrawalRequest): Promise<BackendTransaction> {
    if (USE_MOCK) {
      return new Promise((resolve, reject) =>
        setTimeout(() =>
          req.amount < 100
            ? reject(new Error('Minimum withdrawal is ₹100'))
            : resolve({ id: Date.now(), type: 'WITHDRAWAL', amount: req.amount, description: 'Withdrawal request', status: 'PENDING', createdAt: new Date().toISOString() }),
          1200)
      );
    }
    return this.post<BackendTransaction>('/wallet/withdraw', req);
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  RAZORPAY  —  /api/payment/*  (separate context, no /v1)
  // ════════════════════════════════════════════════════════════════════════════

  /** POST /payment/create-order */
  createRazorpayOrder(amount: number): Promise<{ orderId: string; amount: number; currency: string }> {
    if (USE_MOCK) return this.mock({ orderId: 'order_' + Date.now(), amount, currency: 'INR' });
    return firstValueFrom(
      this.http.post<{ orderId: string; amount: number; currency: string }>(
        `${this.payBase}/create-order`, { amount }
      ).pipe(catchError(e => throwError(() => new Error(e.error?.message || 'Order creation failed'))))
    );
  }

  /** POST /payment/verify */
  verifyRazorpayPayment(payload: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }): Promise<{ success: boolean; message: string }> {
    if (USE_MOCK) return this.mock({ success: true, message: 'Payment verified' });
    return firstValueFrom(
      this.http.post<{ success: boolean; message: string }>(
        `${this.payBase}/verify`, payload
      ).pipe(catchError(e => throwError(() => new Error(e.error?.message || 'Verification failed'))))
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  USER  —  /api/users/*
  // ════════════════════════════════════════════════════════════════════════════

  /** GET /users/me */
  getUserProfile(): Promise<BackendUserProfile> {
    if (USE_MOCK) return this.mock<BackendUserProfile>(null as any);
    return this.get<BackendUserProfile>('/users/me');
  }

  /** PUT /users/me */
  updateProfile(data: { name: string; mobile: string }): Promise<BackendUserProfile> {
    if (USE_MOCK) return this.mock<BackendUserProfile>(null as any, 600);
    return this.put<BackendUserProfile>('/users/me', data);
  }

  /** GET /users/me/history */
  getUserHistory(params?: { page?: number; size?: number }): Promise<PagedData<BackendParticipation>> {
    if (USE_MOCK) return this.mock<PagedData<BackendParticipation>>({ content: [], pageNumber: 0, pageSize: 10, totalElements: 0, totalPages: 0, last: true, first: true });
    return this.get<PagedData<BackendParticipation>>('/users/me/history', params);
  }

  /** GET /users/leaderboard */
  getGlobalLeaderboard(params?: { page?: number; size?: number }): Promise<PagedData<BackendLeaderboardEntry>> {
    if (USE_MOCK) return this.mock<PagedData<BackendLeaderboardEntry>>({ content: [], pageNumber: 0, pageSize: 20, totalElements: 0, totalPages: 0, last: true, first: true });
    return this.get<PagedData<BackendLeaderboardEntry>>('/users/leaderboard', params);
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  ADMIN  —  /api/admin/*
  // ════════════════════════════════════════════════════════════════════════════

  /** GET /admin/stats */
  getAdminStats(): Promise<BackendAdminStats> {
    if (USE_MOCK) return this.mock<BackendAdminStats>(null as any);
    return this.get<BackendAdminStats>('/admin/stats');
  }

  /** GET /admin/users */
  getAdminUsers(params?: { search?: string; page?: number; size?: number }): Promise<PagedData<BackendUserProfile>> {
    if (USE_MOCK) return this.mock<PagedData<BackendUserProfile>>({ content: [], pageNumber: 0, pageSize: 20, totalElements: 0, totalPages: 0, last: true, first: true });
    return this.get<PagedData<BackendUserProfile>>('/admin/users', params);
  }

  /** POST /admin/quizzes */
  createQuiz(data: any): Promise<BackendQuiz> {
    if (USE_MOCK) return this.mock<BackendQuiz>({ ...data, id: Date.now() });
    return this.post<BackendQuiz>('/admin/quizzes', data);
  }

  /** PUT /admin/quizzes/:id */
  updateQuiz(id: number, data: any): Promise<BackendQuiz> {
    if (USE_MOCK) return this.mock<BackendQuiz>({ ...data, id });
    return this.put<BackendQuiz>(`/admin/quizzes/${id}`, data);
  }

  /** DELETE /admin/quizzes/:id */
  deleteQuiz(id: number): Promise<void> {
    if (USE_MOCK) return this.mock<void>(undefined as any);
    return this.delete<void>(`/admin/quizzes/${id}`);
  }

  /** GET /admin/quizzes/:id/questions  (with correct answers) */
  getAdminQuestions(quizId: number): Promise<BackendQuestionAdminDto[]> {
    if (USE_MOCK) return this.mock<BackendQuestionAdminDto[]>([]);
    return this.get<BackendQuestionAdminDto[]>(`/admin/quizzes/${quizId}/questions`);
  }

  /** POST /admin/questions */
  createQuestion(data: any): Promise<BackendQuestionAdminDto> {
    if (USE_MOCK) return this.mock<BackendQuestionAdminDto>({ ...data, id: Date.now() });
    return this.post<BackendQuestionAdminDto>('/admin/questions', data);
  }

  /** PUT /admin/questions/:id */
  updateQuestion(id: number, data: any): Promise<BackendQuestionAdminDto> {
    if (USE_MOCK) return this.mock<BackendQuestionAdminDto>({ ...data, id });
    return this.put<BackendQuestionAdminDto>(`/admin/questions/${id}`, data);
  }

  /** DELETE /admin/questions/:id */
  deleteQuestion(id: number): Promise<void> {
    if (USE_MOCK) return this.mock<void>(undefined as any);
    return this.delete<void>(`/admin/questions/${id}`);
  }

  /** PATCH /admin/users/:id/deactivate */
  deactivateUser(userId: number): Promise<void> {
    if (USE_MOCK) return this.mock<void>(undefined as any);
    return this.patch<void>(`/admin/users/${userId}/deactivate`, {});
  }

  /** PATCH /admin/users/:id/activate */
  activateUser(userId: number): Promise<void> {
    if (USE_MOCK) return this.mock<void>(undefined as any);
    return this.patch<void>(`/admin/users/${userId}/activate`, {});
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  PRIVATE HTTP HELPERS  —  auto-unwrap { success, data } wrapper
  // ════════════════════════════════════════════════════════════════════════════

  private get<T>(path: string, params?: Record<string, any>): Promise<T> {
    let p = new HttpParams();
    if (params) Object.entries(params).forEach(([k, v]) => { if (v != null) p = p.set(k, String(v)); });
    return firstValueFrom(
      this.http.get<ApiSuccess<T>>(`${this.base}${path}`, { params: p }).pipe(
        map(r => r.data),
        catchError(e => throwError(() => new Error(e.error?.message || e.message || 'Request failed')))
      )
    );
  }

  private post<T>(path: string, body: any): Promise<T> {
    return firstValueFrom(
      this.http.post<ApiSuccess<T>>(`${this.base}${path}`, body).pipe(
        map(r => r.data),
        catchError(e => throwError(() => new Error(e.error?.message || e.message || 'Request failed')))
      )
    );
  }

  private put<T>(path: string, body: any): Promise<T> {
    return firstValueFrom(
      this.http.put<ApiSuccess<T>>(`${this.base}${path}`, body).pipe(
        map(r => r.data),
        catchError(e => throwError(() => new Error(e.error?.message || e.message || 'Request failed')))
      )
    );
  }

  private patch<T>(path: string, body: any): Promise<T> {
    return firstValueFrom(
      this.http.patch<ApiSuccess<T>>(`${this.base}${path}`, body).pipe(
        map(r => r.data),
        catchError(e => throwError(() => new Error(e.error?.message || e.message || 'Request failed')))
      )
    );
  }

  private delete<T>(path: string): Promise<T> {
    return firstValueFrom(
      this.http.delete<ApiSuccess<T>>(`${this.base}${path}`).pipe(
        map(r => r.data),
        catchError(e => throwError(() => new Error(e.error?.message || e.message || 'Request failed')))
      )
    );
  }

  private mock<T>(data: T, ms = 300): Promise<T> {
    return firstValueFrom(of(data).pipe(delay(ms)));
  }
}
