/**
 * ApiService — Central HTTP layer.
 *
 * HOW TO SWITCH TO REAL BACKEND:
 *   Set USE_MOCK = false  →  all methods call real endpoints via HttpClient.
 *   Every method signature stays the same — no changes needed in components.
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, of, delay } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PaymentRequest, PaymentResponse,
  WithdrawalRequest, WithdrawalResponse,
  Quiz, Question, LeaderboardEntry, Winner, Transaction,
  AdminStats, User, ApiResponse, PaginatedResponse,
  LoginRequest, RegisterRequest, AuthResponse
} from '../models/models';

// ─── Toggle this to switch between mock and real backend ─────────────────────
const USE_MOCK = true;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ─── Auth ─────────────────────────────────────────────────────────────────────
  login(req: LoginRequest): Promise<AuthResponse> {
    if (USE_MOCK) return this.mock<AuthResponse>(null as any, 800); // handled by AuthService locally
    return firstValueFrom(this.http.post<AuthResponse>(`${this.base}/auth/login`, req));
  }

  register(req: RegisterRequest): Promise<AuthResponse> {
    if (USE_MOCK) return this.mock<AuthResponse>(null as any, 800);
    return firstValueFrom(this.http.post<AuthResponse>(`${this.base}/auth/register`, req));
  }

  refreshToken(refreshToken: string): Promise<{ token: string; expiresIn: number }> {
    if (USE_MOCK) return this.mock({ token: 'mock_token', expiresIn: 3600 });
    return firstValueFrom(this.http.post<{ token: string; expiresIn: number }>(`${this.base}/auth/refresh`, { refreshToken }));
  }

  // ─── Quizzes ──────────────────────────────────────────────────────────────────
  getQuizzes(params?: { status?: string; page?: number; limit?: number }): Promise<PaginatedResponse<Quiz>> {
    if (USE_MOCK) return this.mock({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 });
    return firstValueFrom(this.http.get<PaginatedResponse<Quiz>>(`${this.base}/quizzes`, { params: params as any }));
  }

  getQuiz(id: string): Promise<Quiz> {
    if (USE_MOCK) return this.mock({} as Quiz);
    return firstValueFrom(this.http.get<Quiz>(`${this.base}/quizzes/${id}`));
  }

  joinQuiz(quizId: string): Promise<{ success: boolean; message: string }> {
    if (USE_MOCK) return this.mock({ success: true, message: 'Joined successfully' });
    return firstValueFrom(this.http.post<{ success: boolean; message: string }>(`${this.base}/quizzes/${quizId}/join`, {}));
  }

  submitAnswer(quizId: string, questionId: string, answer: number, timeTakenMs: number): Promise<{ correct: boolean; points: number }> {
    if (USE_MOCK) return this.mock({ correct: false, points: 0 });
    return firstValueFrom(this.http.post<{ correct: boolean; points: number }>(`${this.base}/quizzes/${quizId}/answer`, { questionId, answer, timeTakenMs }));
  }

  // ─── Questions ────────────────────────────────────────────────────────────────
  getQuestions(quizId: string): Promise<Question[]> {
    if (USE_MOCK) return this.mock([]);
    return firstValueFrom(this.http.get<Question[]>(`${this.base}/quizzes/${quizId}/questions`));
  }

  // ─── Leaderboard ──────────────────────────────────────────────────────────────
  getLeaderboard(params?: { period?: 'all' | 'weekly' | 'monthly'; page?: number }): Promise<PaginatedResponse<LeaderboardEntry>> {
    if (USE_MOCK) return this.mock({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 });
    return firstValueFrom(this.http.get<PaginatedResponse<LeaderboardEntry>>(`${this.base}/leaderboard`, { params: params as any }));
  }

  // ─── Transactions ─────────────────────────────────────────────────────────────
  getTransactions(params?: { type?: string; page?: number; limit?: number }): Promise<PaginatedResponse<Transaction>> {
    if (USE_MOCK) return this.mock({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 });
    return firstValueFrom(this.http.get<PaginatedResponse<Transaction>>(`${this.base}/wallet/transactions`, { params: params as any }));
  }

  // ─── Payment / Deposit ────────────────────────────────────────────────────────
  initiateDeposit(req: PaymentRequest): Promise<PaymentResponse> {
    if (USE_MOCK) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          Math.random() > 0.05
            ? resolve({ success: true, transactionId: 'TXN' + Date.now(), message: 'Payment successful', amount: req.amount })
            : reject(new Error('Payment failed. Please try again.'));
        }, 1500);
      });
    }
    return firstValueFrom(this.http.post<PaymentResponse>(`${this.base}/wallet/deposit`, req));
  }

  // ─── Razorpay order creation (backend creates order, frontend opens SDK) ──────
  createRazorpayOrder(amount: number): Promise<{ orderId: string; amount: number; currency: string }> {
    if (USE_MOCK) return this.mock({ orderId: 'order_mock_' + Date.now(), amount, currency: 'INR' });
    return firstValueFrom(this.http.post<{ orderId: string; amount: number; currency: string }>(`${this.base}/payments/razorpay/order`, { amount }));
  }

  verifyRazorpayPayment(payload: { orderId: string; paymentId: string; signature: string }): Promise<PaymentResponse> {
    if (USE_MOCK) return this.mock({ success: true, transactionId: payload.paymentId, message: 'Verified', amount: 0 });
    return firstValueFrom(this.http.post<PaymentResponse>(`${this.base}/payments/razorpay/verify`, payload));
  }

  // ─── Withdrawal ───────────────────────────────────────────────────────────────
  initiateWithdrawal(req: WithdrawalRequest): Promise<WithdrawalResponse> {
    if (USE_MOCK) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          req.amount < 100
            ? reject(new Error('Minimum withdrawal is ₹100'))
            : resolve({ success: true, referenceId: 'WD' + Date.now(), message: 'Withdrawal request submitted', estimatedTime: '24-48 hours' });
        }, 1200);
      });
    }
    return firstValueFrom(this.http.post<WithdrawalResponse>(`${this.base}/wallet/withdraw`, req));
  }

  // ─── Admin ────────────────────────────────────────────────────────────────────
  getAdminStats(): Promise<AdminStats> {
    if (USE_MOCK) return this.mock({} as AdminStats);
    return firstValueFrom(this.http.get<AdminStats>(`${this.base}/admin/stats`));
  }

  getUsers(params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<User>> {
    if (USE_MOCK) return this.mock({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 });
    return firstValueFrom(this.http.get<PaginatedResponse<User>>(`${this.base}/admin/users`, { params: params as any }));
  }

  approveWithdrawal(txId: string): Promise<{ success: boolean }> {
    if (USE_MOCK) return this.mock({ success: true });
    return firstValueFrom(this.http.post<{ success: boolean }>(`${this.base}/admin/withdrawals/${txId}/approve`, {}));
  }

  rejectWithdrawal(txId: string, reason: string): Promise<{ success: boolean }> {
    if (USE_MOCK) return this.mock({ success: true });
    return firstValueFrom(this.http.post<{ success: boolean }>(`${this.base}/admin/withdrawals/${txId}/reject`, { reason }));
  }

  // ─── Profile ──────────────────────────────────────────────────────────────────
  updateProfile(data: Partial<Pick<User, 'name' | 'mobile'>>): Promise<User> {
    if (USE_MOCK) return this.mock({} as User);
    return firstValueFrom(this.http.patch<User>(`${this.base}/users/me`, data));
  }

  uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const form = new FormData();
    form.append('avatar', file);
    if (USE_MOCK) return this.mock({ avatarUrl: '' });
    return firstValueFrom(this.http.post<{ avatarUrl: string }>(`${this.base}/users/me/avatar`, form));
  }

  // ─── KYC ──────────────────────────────────────────────────────────────────────
  submitKyc(data: { docType: string; docNumber: string; frontImage: File; backImage?: File }): Promise<{ success: boolean; message: string }> {
    const form = new FormData();
    form.append('docType', data.docType);
    form.append('docNumber', data.docNumber);
    form.append('front', data.frontImage);
    if (data.backImage) form.append('back', data.backImage);
    if (USE_MOCK) return this.mock({ success: true, message: 'KYC submitted for review' });
    return firstValueFrom(this.http.post<{ success: boolean; message: string }>(`${this.base}/kyc/submit`, form));
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────
  private mock<T>(data: T, delayMs = 300): Promise<T> {
    return firstValueFrom(of(data).pipe(delay(delayMs)));
  }
}
