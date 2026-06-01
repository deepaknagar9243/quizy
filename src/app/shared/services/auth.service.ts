import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/models';
import { AdminSettingsService } from './admin-settings.service';
import { ReferralService } from './referral.service';
import { ApiService, USE_MOCK } from './api.service';

interface StoredUser extends User { password: string; }
interface PasswordResetRequest { userId: string; code: string; expiresAt: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly KEY        = 'qa_user';
  private readonly TOKEN_KEY  = 'qa_token';
  private readonly RTOKEN_KEY = 'qa_refresh_token';
  private readonly USERS_KEY  = 'qa_users';
  private readonly RESET_KEY  = 'qa_password_reset';

  currentUser = signal<User | null>(this.loadUser());

  constructor(
    private router: Router,
    private adminSettings: AdminSettingsService,
    private referral: ReferralService,
    private api: ApiService
  ) {
    if (USE_MOCK) this.ensureDemoUsers();
  }

  // ── Token helpers ────────────────────────────────────────────────
  setToken(token: string, refreshToken?: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    if (refreshToken) localStorage.setItem(this.RTOKEN_KEY, refreshToken);
  }

  getToken(): string | null { return localStorage.getItem(this.TOKEN_KEY); }
  getRefreshToken(): string | null { return localStorage.getItem(this.RTOKEN_KEY); }

  // ── Backend login (USE_MOCK=false) ───────────────────────────────
  async loginWithBackend(identifier: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await this.api.login({ identifier, password });
      this.setToken(res.token, res.refreshToken);
      this.persist(res.user);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Login failed' };
    }
  }

  async registerWithBackend(name: string, email: string, mobile: string, password: string, referralCode?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await this.api.register({ name, email, mobile, password, referralCode });
      this.setToken(res.token, res.refreshToken);
      this.persist(res.user);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Registration failed' };
    }
  }

  // ── Local (mock) helpers ─────────────────────────────────────────
  private loadUser(): User | null {
    try { const s = localStorage.getItem(this.KEY); return s ? JSON.parse(s) : null; }
    catch { return null; }
  }

  private loadUsers(): StoredUser[] {
    try { return JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]'); }
    catch { return []; }
  }

  private saveUsers(users: StoredUser[]) {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  getStoredUsers(): User[] { return this.loadUsers().map(u => this.withoutPassword(u)); }

  private loadResetRequests(): Record<string, PasswordResetRequest> {
    try { return JSON.parse(localStorage.getItem(this.RESET_KEY) || '{}'); }
    catch { return {}; }
  }

  private normalize(v: string) { return v.trim().toLowerCase(); }
  private withoutPassword(u: StoredUser): User { const { password: _p, ...safe } = u; return safe; }

  private persist(user: User) {
    localStorage.setItem(this.KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  private ensureDemoUsers() {
    const users = this.loadUsers();
    if (users.some(u => this.normalize(u.email) === 'demo@quiz.com')) return;

    const userId = 'demo_user';
    const code = this.referral.generateCode(userId, 'Rahul Kumar');
    const demo: StoredUser = {
      id: userId, name: 'Rahul Kumar', email: 'demo@quiz.com', mobile: '9876543210',
      avatar: 'RK', walletBalance: 3750, bonusBalance: 50, totalWins: 8,
      totalQuizzes: 24, totalEarnings: 8550, rank: 47, isAdmin: false,
      kycVerified: true, referralCode: code, referralCount: 0,
      createdAt: new Date().toISOString(), password: 'demo123'
    };
    users.push(demo);
    this.saveUsers(users);
    this.referral.registerCode(code, userId, this.adminSettings.get().referralCodeValidityHours);
  }

  // ── Mock login ───────────────────────────────────────────────────
  login(identifier: string, password: string): boolean {
    const normalized = this.normalize(identifier);

    if (normalized === 'admin@quiz.com') {
      if (password !== 'admin123') return false;
      const userId = 'admin_user';
      const user: User = {
        id: userId, name: 'Admin User', email: 'admin@quiz.com', mobile: '9876543210',
        avatar: 'AD', walletBalance: 0, bonusBalance: 0, totalWins: 0,
        totalQuizzes: 0, totalEarnings: 0, rank: 0, isAdmin: true, kycVerified: true,
        referralCode: this.referral.generateCode(userId, 'Admin'), referralCount: 0,
        createdAt: new Date().toISOString()
      };
      this.referral.registerCode(user.referralCode!, userId, this.adminSettings.get().referralCodeValidityHours);
      this.persist(user);
      return true;
    }

    const stored = this.loadUsers().find(u =>
      this.normalize(u.email) === normalized || u.mobile === identifier.trim()
    );
    if (!stored || stored.password !== password) return false;

    this.referral.registerCode(stored.referralCode!, stored.id, this.adminSettings.get().referralCodeValidityHours);
    this.persist(this.withoutPassword(stored));
    this.claimPendingBonus();
    return true;
  }

  // ── Mock register ────────────────────────────────────────────────
  register(name: string, email: string, mobile: string, password: string, referralCode?: string): boolean {
    const normalizedEmail = this.normalize(email);
    const users = this.loadUsers();
    if (users.some(u => this.normalize(u.email) === normalizedEmail || u.mobile === mobile)) return false;

    const settings = this.adminSettings.get();
    const userId = 'user_' + Date.now();
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
    const code = this.referral.generateCode(userId, name);
    const normalizedRef = referralCode?.trim().toUpperCase();
    const validatedRef = normalizedRef ? this.referral.validateCode(normalizedRef, userId) : null;

    const user: StoredUser = {
      id: userId, name, email: normalizedEmail, mobile, avatar: initials,
      walletBalance: 0, bonusBalance: settings.registrationBonus,
      totalWins: 0, totalQuizzes: 0, totalEarnings: 0, rank: 9999,
      isAdmin: false, kycVerified: false, referralCode: code,
      referredBy: validatedRef?.valid ? normalizedRef : undefined,
      referralCount: 0, createdAt: new Date().toISOString(), password
    };

    this.referral.registerCode(code, userId, settings.referralCodeValidityHours);

    if (validatedRef?.valid && normalizedRef) {
      const referrerId = validatedRef.entry!.userId;
      user.bonusBalance += settings.referralJoinBonus;
      const pendingKey = 'qa_pending_bonus_' + referrerId;
      const pendingCountKey = 'qa_pending_referral_count_' + referrerId;
      localStorage.setItem(pendingKey, String(parseFloat(localStorage.getItem(pendingKey) || '0') + settings.referralBonus));
      localStorage.setItem(pendingCountKey, String(parseInt(localStorage.getItem(pendingCountKey) || '0', 10) + 1));
      this.referral.addRecord({
        referrerId, referrerName: users.find(u => u.id === referrerId)?.name || 'Referrer',
        referredId: userId, referredName: name,
        bonusPaid: settings.referralBonus, joinBonusPaid: settings.referralJoinBonus,
        code: normalizedRef, date: new Date().toISOString()
      });
    }

    users.push(user);
    this.saveUsers(users);
    this.persist(this.withoutPassword(user));
    return true;
  }

  // ── Password reset (mock) ────────────────────────────────────────
  requestPasswordReset(identifier: string): { success: boolean; error?: string; code?: string } {
    const normalized = this.normalize(identifier);
    const user = this.loadUsers().find(u => this.normalize(u.email) === normalized || u.mobile === identifier.trim());
    if (!user) return { success: false, error: 'No account found with this email or mobile' };

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const requests = this.loadResetRequests();
    requests[normalized] = { userId: user.id, code, expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString() };
    localStorage.setItem(this.RESET_KEY, JSON.stringify(requests));
    return { success: true, code };
  }

  resetPassword(identifier: string, code: string, newPassword: string): { success: boolean; error?: string } {
    const normalized = this.normalize(identifier);
    const requests = this.loadResetRequests();
    const req = requests[normalized];
    if (!req) return { success: false, error: 'Please request a reset code first' };
    if (new Date(req.expiresAt).getTime() < Date.now()) {
      delete requests[normalized];
      localStorage.setItem(this.RESET_KEY, JSON.stringify(requests));
      return { success: false, error: 'Reset code has expired' };
    }
    if (req.code !== code.trim()) return { success: false, error: 'Invalid reset code' };

    const users = this.loadUsers();
    const idx = users.findIndex(u => u.id === req.userId);
    if (idx < 0) return { success: false, error: 'Account no longer exists' };

    users[idx] = { ...users[idx], password: newPassword };
    this.saveUsers(users);
    delete requests[normalized];
    localStorage.setItem(this.RESET_KEY, JSON.stringify(requests));
    return { success: true };
  }

  // ── Bonus / wallet helpers ───────────────────────────────────────
  claimPendingBonus() {
    const user = this.currentUser();
    if (!user) return;
    const pendingKey = 'qa_pending_bonus_' + user.id;
    const pendingCountKey = 'qa_pending_referral_count_' + user.id;
    const pending = parseFloat(localStorage.getItem(pendingKey) || '0');
    const pendingCount = parseInt(localStorage.getItem(pendingCountKey) || '0', 10);
    if (pending > 0 || pendingCount > 0) {
      const updated = { ...user, bonusBalance: user.bonusBalance + pending, referralCount: (user.referralCount || 0) + pendingCount };
      const users = this.loadUsers();
      const idx = users.findIndex(u => u.id === user.id);
      if (idx >= 0) { users[idx] = { ...users[idx], ...updated }; this.saveUsers(users); }
      this.persist(updated);
      localStorage.removeItem(pendingKey);
      localStorage.removeItem(pendingCountKey);
    }
  }

  logout(): void {
    localStorage.removeItem(this.KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.RTOKEN_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean { return this.currentUser() !== null; }
  isAdmin(): boolean { return this.currentUser()?.isAdmin === true; }

  updateWallet(amount: number): void {
    const user = this.currentUser();
    if (!user) return;
    this.adjustUserWallet(user.id, amount);
  }

  adjustUserWallet(userId: string, amount: number): User | null {
    const current = this.currentUser();
    const users = this.loadUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx >= 0) {
      users[idx] = { ...users[idx], walletBalance: Math.max(0, users[idx].walletBalance + amount) };
      this.saveUsers(users);
      const updated = this.withoutPassword(users[idx]);
      if (current?.id === userId) this.persist(updated);
      return updated;
    }
    if (current?.id === userId) {
      const updated = { ...current, walletBalance: Math.max(0, current.walletBalance + amount) };
      this.persist(updated);
      return updated;
    }
    return null;
  }

  payEntryFee(amount: number): 'ok' | 'insufficient' {
    const user = this.currentUser();
    if (!user) return 'insufficient';
    const total = user.walletBalance + user.bonusBalance;
    if (total < amount) return 'insufficient';
    let bonus = user.bonusBalance, real = user.walletBalance;
    if (bonus >= amount) { bonus -= amount; }
    else { amount -= bonus; bonus = 0; real -= amount; }
    this.persist({ ...user, walletBalance: Math.max(0, real), bonusBalance: Math.max(0, bonus) });
    return 'ok';
  }

  updateStats(wins: number, quizzes: number, earnings: number, rank: number): void {
    const user = this.currentUser();
    if (!user) return;
    this.persist({ ...user, totalWins: user.totalWins + wins, totalQuizzes: user.totalQuizzes + quizzes, totalEarnings: user.totalEarnings + earnings, rank });
  }

  updateProfile(name: string, mobile: string): void {
    const user = this.currentUser();
    if (!user) return;
    const users = this.loadUsers();
    const idx = users.findIndex(u => u.id === user.id);
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || user.avatar;
    const updated = { ...user, name, mobile, avatar: initials };
    if (idx >= 0) { users[idx] = { ...users[idx], name, mobile, avatar: initials }; this.saveUsers(users); }
    this.persist(updated);
  }
}
