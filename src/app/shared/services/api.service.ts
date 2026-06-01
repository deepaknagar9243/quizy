/**
 * ─────────────────────────────────────────────────────────────────
 *  ApiService  —  Single source of truth for ALL backend calls
 *
 *  HOW TO GO LIVE:
 *    1. Set USE_MOCK = false
 *    2. Set correct apiUrl in src/environments/environment.ts
 *    3. Done — every component works without any change
 * ─────────────────────────────────────────────────────────────────
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, of, delay, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  User, Quiz, Question, LeaderboardEntry, Winner, Transaction,
  AdminStats, ApiResponse, PaginatedResponse,
  LoginRequest, RegisterRequest, AuthResponse,
  PaymentRequest, PaymentResponse,
  WithdrawalRequest, WithdrawalResponse,
  QuizResult
} from '../models/models';

// ── Toggle: true = dummy data, false = real backend ──────────────
export const USE_MOCK = true;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ════════════════════════════════════════════════════════════════
  //  AUTH
  // ════════════════════════════════════════════════════════════════

  login(req: LoginRequest): Promise<AuthResponse> {
    if (USE_MOCK) return this.mock<AuthResponse>(null as any, 800);
    return this.post<AuthResponse>('/auth/login', req);
  }

  register(req: RegisterRequest): Promise<AuthResponse> {
    if (USE_MOCK) return this.mock<AuthResponse>(null as any, 900);
    return this.post<AuthResponse>('/auth/register', req);
  }

  refreshToken(token: string): Promise<{ token: string; expiresIn: number }> {
    if (USE_MOCK) return this.mock({ token: 'mock_token', expiresIn: 3600 });
    return this.post('/auth/refresh', { refreshToken: token });
  }

  requestPasswordReset(identifier: string): Promise<{ success: boolean; message: string }> {
    if (USE_MOCK) return this.mock({ success: true, message: 'OTP sent' });
    return this.post('/auth/forgot-password', { identifier });
  }

  resetPassword(identifier: string, otp: string, newPassword: string): Promise<{ success: boolean }> {
    if (USE_MOCK) return this.mock({ success: true });
    return this.post('/auth/reset-password', { identifier, otp, newPassword });
  }

  getMe(): Promise<User> {
    if (USE_MOCK) return this.mock({} as User);
    return this.get<User>('/auth/me');
  }

  // ════════════════════════════════════════════════════════════════
  //  QUIZZES
  // ════════════════════════════════════════════════════════════════

  getQuizzes(params?: { status?: string; category?: string; page?: number; limit?: number }): Promise<PaginatedResponse<Quiz>> {
    if (USE_MOCK) return this.mock({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 });
    return this.get<PaginatedResponse<Quiz>>('/quizzes', params);
  }

  getQuiz(id: string): Promise<Quiz> {
    if (USE_MOCK) return this.mock({} as Quiz);
    return this.get<Quiz>(`/quizzes/${id}`);
  }

  getLiveQuiz(): Promise<Quiz | null> {
    if (USE_MOCK) return this.mock(null);
    return this.get<Quiz | null>('/quizzes/live');
  }

  joinQuiz(quizId: string): Promise<{ success: boolean; message: string; entryFeeDeducted: number }> {
    if (USE_MOCK) return this.mock({ success: true, message: 'Joined', entryFeeDeducted: 75 });
    return this.post(`/quizzes/${quizId}/join`, {});
  }

  submitAnswer(quizId: string, payload: { questionId: string; answer: number; timeTakenMs: number }): Promise<{ correct: boolean; correctAnswer: number; points: number }> {
    if (USE_MOCK) return this.mock({ correct: false, correctAnswer: 0, points: 0 });
    return this.post(`/quizzes/${quizId}/answer`, payload);
  }

  getQuizResult(quizId: string): Promise<QuizResult> {
    if (USE_MOCK) return this.mock({} as QuizResult);
    return this.get<QuizResult>(`/quizzes/${quizId}/result`);
  }

  // Admin quiz CRUD
  createQuiz(data: Partial<Quiz>): Promise<Quiz> {
    if (USE_MOCK) return this.mock({ ...data, id: 'q_' + Date.now() } as Quiz);
    return this.post<Quiz>('/admin/quizzes', data);
  }

  updateQuiz(id: string, data: Partial<Quiz>): Promise<Quiz> {
    if (USE_MOCK) return this.mock({ ...data, id } as Quiz);
    return this.patch<Quiz>(`/admin/quizzes/${id}`, data);
  }

  deleteQuiz(id: string): Promise<{ success: boolean }> {
    if (USE_MOCK) return this.mock({ success: true });
    return this.delete(`/admin/quizzes/${id}`);
  }

  // ════════════════════════════════════════════════════════════════
  //  QUESTIONS
  // ════════════════════════════════════════════════════════════════

  getQuestions(quizId: string): Promise<Question[]> {
    if (USE_MOCK) return this.mock([]);
    return this.get<Question[]>(`/quizzes/${quizId}/questions`);
  }

  createQuestion(data: Partial<Question>): Promise<Question> {
    if (USE_MOCK) return this.mock({ ...data, id: 'qs_' + Date.now() } as Question);
    return this.post<Question>('/admin/questions', data);
  }

  updateQuestion(id: string, data: Partial<Question>): Promise<Question> {
    if (USE_MOCK) return this.mock({ ...data, id } as Question);
    return this.patch<Question>(`/admin/questions/${id}`, data);
  }

  deleteQuestion(id: string): Promise<{ success: boolean }> {
    if (USE_MOCK) return this.mock({ success: true });
    return this.delete(`/admin/questions/${id}`);
  }

  // ════════════════════════════════════════════════════════════════
  //  LEADERBOARD
  // ════════════════════════════════════════════════════════════════

  getLeaderboard(params?: { period?: 'all' | 'weekly' | 'monthly'; page?: number; limit?: number }): Promise<PaginatedResponse<LeaderboardEntry>> {
    if (USE_MOCK) return this.mock({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 });
    return this.get<PaginatedResponse<LeaderboardEntry>>('/leaderboard', params);
  }

  getRecentWinners(): Promise<Winner[]> {
    if (USE_MOCK) return this.mock([]);
    return this.get<Winner[]>('/leaderboard/winners');
  }

  // ════════════════════════════════════════════════════════════════
  //  WALLET & TRANSACTIONS
  // ════════════════════════════════════════════════════════════════

  getWalletBalance(): Promise<{ walletBalance: number; bonusBalance: number }> {
    if (USE_MOCK) return this.mock({ walletBalance: 0, bonusBalance: 0 });
    return this.get('/wallet/balance');
  }

  getTransactions(params?: { type?: string; page?: number; limit?: number }): Promise<PaginatedResponse<Transaction>> {
    if (USE_MOCK) return this.mock({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 });
    return this.get<PaginatedResponse<Transaction>>('/wallet/transactions', params);
  }

  // ── Deposit (mock simulates 95% success) ──────────────────────
  initiateDeposit(req: PaymentRequest): Promise<PaymentResponse> {
    if (USE_MOCK) {
      return new Promise((resolve, reject) =>
        setTimeout(() =>
          Math.random() > 0.05
            ? resolve({ success: true, transactionId: 'TXN' + Date.now(), message: 'Payment successful', amount: req.amount })
            : reject(new Error('Payment gateway timeout. Please try again.')),
          1500)
      );
    }
    return this.post<PaymentResponse>('/wallet/deposit', req);
  }

  // ── Razorpay: backend creates order → frontend opens SDK ──────
  createRazorpayOrder(amount: number): Promise<{ orderId: string; amount: number; currency: string; keyId: string }> {
    if (USE_MOCK) return this.mock({ orderId: 'order_' + Date.now(), amount, currency: 'INR', keyId: environment.razorpayKey });
    return this.post('/payments/razorpay/order', { amount });
  }

  verifyRazorpayPayment(payload: { orderId: string; paymentId: string; signature: string }): Promise<PaymentResponse> {
    if (USE_MOCK) return this.mock({ success: true, transactionId: payload.paymentId, message: 'Payment verified', amount: 0 });
    return this.post<PaymentResponse>('/payments/razorpay/verify', payload);
  }

  // ── Withdrawal ────────────────────────────────────────────────
  initiateWithdrawal(req: WithdrawalRequest): Promise<WithdrawalResponse> {
    if (USE_MOCK) {
      return new Promise((resolve, reject) =>
        setTimeout(() =>
          req.amount < 100
            ? reject(new Error('Minimum withdrawal is ₹100'))
            : resolve({ success: true, referenceId: 'WD' + Date.now(), message: 'Withdrawal request submitted', estimatedTime: '24-48 hours' }),
          1200)
      );
    }
    return this.post<WithdrawalResponse>('/wallet/withdraw', req);
  }

  // ════════════════════════════════════════════════════════════════
  //  REFERRALS
  // ════════════════════════════════════════════════════════════════

  validateReferralCode(code: string): Promise<{ valid: boolean; reason?: string; referrerName?: string }> {
    if (USE_MOCK) return this.mock({ valid: true, referrerName: 'Demo User' });
    return this.get('/referrals/validate', { code });
  }

  getReferralStats(): Promise<{ code: string; totalReferrals: number; totalEarned: number; records: any[] }> {
    if (USE_MOCK) return this.mock({ code: '', totalReferrals: 0, totalEarned: 0, records: [] });
    return this.get('/referrals/stats');
  }

  // ════════════════════════════════════════════════════════════════
  //  PROFILE & KYC
  // ════════════════════════════════════════════════════════════════

  updateProfile(data: Partial<Pick<User, 'name' | 'mobile'>>): Promise<User> {
    if (USE_MOCK) return this.mock({} as User, 600);
    return this.patch<User>('/users/me', data);
  }

  changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean }> {
    if (USE_MOCK) return this.mock({ success: true }, 600);
    return this.post('/users/me/change-password', { currentPassword, newPassword });
  }

  uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    if (USE_MOCK) return this.mock({ avatarUrl: '' }, 800);
    const form = new FormData();
    form.append('avatar', file);
    return firstValueFrom(
      this.http.post<{ avatarUrl: string }>(`${this.base}/users/me/avatar`, form).pipe(
        catchError(e => throwError(() => new Error(e.error?.message || 'Upload failed')))
      )
    );
  }

  submitKyc(data: { docType: string; docNumber: string; frontImage: File; backImage?: File }): Promise<{ success: boolean; message: string }> {
    if (USE_MOCK) return this.mock({ success: true, message: 'KYC submitted for review' }, 1000);
    const form = new FormData();
    form.append('docType', data.docType);
    form.append('docNumber', data.docNumber);
    form.append('front', data.frontImage);
    if (data.backImage) form.append('back', data.backImage);
    return firstValueFrom(
      this.http.post<{ success: boolean; message: string }>(`${this.base}/kyc/submit`, form).pipe(
        catchError(e => throwError(() => new Error(e.error?.message || 'KYC submission failed')))
      )
    );
  }

  // ════════════════════════════════════════════════════════════════
  //  ADMIN
  // ════════════════════════════════════════════════════════════════

  getAdminStats(): Promise<AdminStats> {
    if (USE_MOCK) return this.mock({} as AdminStats);
    return this.get<AdminStats>('/admin/stats');
  }

  getAdminUsers(params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<User>> {
    if (USE_MOCK) return this.mock({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 });
    return this.get<PaginatedResponse<User>>('/admin/users', params);
  }

  getPendingWithdrawals(): Promise<Transaction[]> {
    if (USE_MOCK) return this.mock([]);
    return this.get<Transaction[]>('/admin/withdrawals/pending');
  }

  approveWithdrawal(txId: string): Promise<{ success: boolean }> {
    if (USE_MOCK) return this.mock({ success: true });
    return this.post(`/admin/withdrawals/${txId}/approve`, {});
  }

  rejectWithdrawal(txId: string, reason: string): Promise<{ success: boolean }> {
    if (USE_MOCK) return this.mock({ success: true });
    return this.post(`/admin/withdrawals/${txId}/reject`, { reason });
  }

  getAdminSettings(): Promise<any> {
    if (USE_MOCK) return this.mock({});
    return this.get('/admin/settings');
  }

  saveAdminSettings(settings: any): Promise<{ success: boolean }> {
    if (USE_MOCK) return this.mock({ success: true });
    return this.patch('/admin/settings', settings);
  }

  // ════════════════════════════════════════════════════════════════
  //  NOTIFICATIONS
  // ════════════════════════════════════════════════════════════════

  getNotifications(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<any>> {
    if (USE_MOCK) return this.mock({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 });
    return this.get('/notifications', params);
  }

  markNotificationsRead(): Promise<{ success: boolean }> {
    if (USE_MOCK) return this.mock({ success: true });
    return this.post('/notifications/read-all', {});
  }

  // ════════════════════════════════════════════════════════════════
  //  PRIVATE HTTP HELPERS
  // ════════════════════════════════════════════════════════════════

  private get<T>(path: string, params?: Record<string, any>): Promise<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) httpParams = httpParams.set(k, String(v));
      });
    }
    return firstValueFrom(
      this.http.get<T>(`${this.base}${path}`, { params: httpParams }).pipe(
        catchError(e => throwError(() => new Error(e.error?.message || e.message || 'Request failed')))
      )
    );
  }

  private post<T>(path: string, body: any): Promise<T> {
    return firstValueFrom(
      this.http.post<T>(`${this.base}${path}`, body).pipe(
        catchError(e => throwError(() => new Error(e.error?.message || e.message || 'Request failed')))
      )
    );
  }

  private patch<T>(path: string, body: any): Promise<T> {
    return firstValueFrom(
      this.http.patch<T>(`${this.base}${path}`, body).pipe(
        catchError(e => throwError(() => new Error(e.error?.message || e.message || 'Request failed')))
      )
    );
  }

  private delete<T>(path: string): Promise<T> {
    return firstValueFrom(
      this.http.delete<T>(`${this.base}${path}`).pipe(
        catchError(e => throwError(() => new Error(e.error?.message || e.message || 'Request failed')))
      )
    );
  }

  private mock<T>(data: T, delayMs = 300): Promise<T> {
    return firstValueFrom(of(data).pipe(delay(delayMs)));
  }
}
