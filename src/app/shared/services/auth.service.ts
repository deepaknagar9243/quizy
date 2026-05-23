import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/models';
import { AdminSettingsService } from './admin-settings.service';
import { ReferralService } from './referral.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly KEY = 'qa_user';

  currentUser = signal<User | null>(this.loadUser());

  constructor(
    private router: Router,
    private adminSettings: AdminSettingsService,
    private referral: ReferralService
  ) {}

  private loadUser(): User | null {
    try {
      const s = localStorage.getItem(this.KEY);
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  }

  private persist(user: User) {
    localStorage.setItem(this.KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  login(email: string, _password: string): boolean {
    const isAdmin = email === 'admin@quiz.com';
    const userId = isAdmin ? 'admin_user' : 'current_user_' + email.split('@')[0];
    const user: User = {
      id: userId,
      name: isAdmin ? 'Admin User' : 'Rahul Kumar',
      email,
      mobile: '9876543210',
      avatar: isAdmin ? 'AD' : 'RK',
      walletBalance: isAdmin ? 0 : 3750,
      bonusBalance: isAdmin ? 0 : 50,
      totalWins: isAdmin ? 0 : 8,
      totalQuizzes: isAdmin ? 0 : 24,
      totalEarnings: isAdmin ? 0 : 8550,
      rank: isAdmin ? 0 : 47,
      isAdmin,
      kycVerified: true,
      referralCode: this.referral.generateCode(userId, isAdmin ? 'Admin' : 'Rahul Kumar'),
      referralCount: 0,
      createdAt: new Date().toISOString()
    };
    this.referral.registerCode(user.referralCode!, userId, this.adminSettings.get().referralCodeValidityHours);
    this.persist(user);
    this.claimPendingBonus();
    return true;
  }

  register(name: string, email: string, mobile: string, _password: string, referralCode?: string): boolean {
    const settings = this.adminSettings.get();
    const userId = 'user_' + Date.now();
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const code = this.referral.generateCode(userId, name);

    const user: User = {
      id: userId,
      name, email, mobile,
      avatar: initials,
      walletBalance: 0,
      bonusBalance: settings.registrationBonus,   // signup bonus — NOT withdrawable
      totalWins: 0,
      totalQuizzes: 0,
      totalEarnings: 0,
      rank: 9999,
      isAdmin: false,
      kycVerified: false,
      referralCode: code,
      referredBy: referralCode?.toUpperCase() || undefined,
      referralCount: 0,
      createdAt: new Date().toISOString()
    };

    // Register this user's referral code
    this.referral.registerCode(code, userId, settings.referralCodeValidityHours);

    // Apply referral bonus if valid code provided
    if (referralCode) {
      const validated = this.referral.validateCode(referralCode.toUpperCase(), userId);
      const referrerId = validated.valid ? validated.entry!.userId : null;
      if (referrerId) {
        // Give join bonus to new user
        user.bonusBalance += settings.referralJoinBonus;

        // Give referral bonus to referrer (stored for when they next login)
        const pendingKey = 'qa_pending_bonus_' + referrerId;
        const pendingCountKey = 'qa_pending_referral_count_' + referrerId;
        const existing = parseFloat(localStorage.getItem(pendingKey) || '0');
        localStorage.setItem(pendingKey, String(existing + settings.referralBonus));
        const existingCount = parseInt(localStorage.getItem(pendingCountKey) || '0', 10);
        localStorage.setItem(pendingCountKey, String(existingCount + 1));

        // Record referral
        this.referral.addRecord({
          referrerId,
          referrerName: 'Referrer',
          referredId: userId,
          referredName: name,
          bonusPaid: settings.referralBonus,
          joinBonusPaid: settings.referralJoinBonus,
          code: referralCode.toUpperCase(),
          date: new Date().toISOString()
        });
      }
    }

    this.persist(user);
    return true;
  }

  // Call on login to credit any pending referral bonuses
  claimPendingBonus() {
    const user = this.currentUser();
    if (!user) return;
    const pendingKey = 'qa_pending_bonus_' + user.id;
    const pendingCountKey = 'qa_pending_referral_count_' + user.id;
    const pending = parseFloat(localStorage.getItem(pendingKey) || '0');
    const pendingCount = parseInt(localStorage.getItem(pendingCountKey) || '0', 10);
    if (pending > 0) {
      const updated = {
        ...user,
        bonusBalance: user.bonusBalance + pending,
        referralCount: (user.referralCount || 0) + pendingCount
      };
      this.persist(updated);
      localStorage.removeItem(pendingKey);
      localStorage.removeItem(pendingCountKey);
    }
  }

  logout(): void {
    localStorage.removeItem(this.KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean { return this.currentUser() !== null; }
  isAdmin(): boolean { return this.currentUser()?.isAdmin === true; }

  // Only real wallet balance changes (prize, deposit, withdrawal, entry fee)
  updateWallet(amount: number): void {
    const user = this.currentUser();
    if (!user) return;
    this.persist({ ...user, walletBalance: Math.max(0, user.walletBalance + amount) });
  }

  // Use bonus balance for entry fee (bonus first, then real)
  payEntryFee(amount: number): 'ok' | 'insufficient' {
    const user = this.currentUser();
    if (!user) return 'insufficient';
    const total = user.walletBalance + user.bonusBalance;
    if (total < amount) return 'insufficient';

    let bonus = user.bonusBalance;
    let real = user.walletBalance;

    if (bonus >= amount) {
      bonus -= amount;
    } else {
      amount -= bonus;
      bonus = 0;
      real -= amount;
    }

    this.persist({ ...user, walletBalance: Math.max(0, real), bonusBalance: Math.max(0, bonus) });
    return 'ok';
  }

  updateStats(wins: number, quizzes: number, earnings: number, rank: number): void {
    const user = this.currentUser();
    if (!user) return;
    this.persist({
      ...user,
      totalWins: user.totalWins + wins,
      totalQuizzes: user.totalQuizzes + quizzes,
      totalEarnings: user.totalEarnings + earnings,
      rank
    });
}
}
