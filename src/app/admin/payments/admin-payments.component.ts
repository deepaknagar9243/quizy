import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Transaction } from '../../shared/models/models';
import { AdminSettingsService } from '../../shared/services/admin-settings.service';
import { AuthService } from '../../shared/services/auth.service';
import { ReferralService } from '../../shared/services/referral.service';
import { StateService } from '../../shared/services/state.service';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fade-in space-y-5">

      <!-- Header -->
      <div>
        <h1 class="page-header">Payments & Rewards</h1>
        <p class="page-subheader">Process withdrawals and manage referral bonuses</p>
      </div>

      <!-- Toast -->
      @if (message()) {
        <div class="p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          {{ message() }}
        </div>
      }
      @if (error()) {
        <div class="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {{ error() }}
        </div>
      }

      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="stat-card">
          <div class="text-muted text-xs mb-2">Pending</div>
          <div class="text-2xl font-bold text-orange-600">{{ pendingWithdrawals().length }}</div>
          <div class="text-xs text-muted mt-1">Withdrawals</div>
        </div>
        <div class="stat-card">
          <div class="text-muted text-xs mb-2">Paid Out</div>
          <div class="text-2xl font-bold text-slate-800">₹{{ formatAmount(paidTotal()) }}</div>
          <div class="text-xs text-muted mt-1">Total</div>
        </div>
        <div class="stat-card">
          <div class="text-muted text-xs mb-2">Referral Bonus</div>
          <div class="text-2xl font-bold text-red-600">₹{{ settings.referralBonus }}</div>
          <div class="text-xs text-muted mt-1">Per referrer</div>
        </div>
        <div class="stat-card">
          <div class="text-muted text-xs mb-2">Join Bonus</div>
          <div class="text-2xl font-bold text-green-600">₹{{ settings.referralJoinBonus }}</div>
          <div class="text-xs text-muted mt-1">New user</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 p-1 bg-slate-100 rounded-xl w-full sm:w-auto sm:inline-flex">
        <button
          class="flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-all"
          [class]="activeTab() === 'withdrawals' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
          (click)="activeTab.set('withdrawals')">
          Withdrawals
          @if (pendingWithdrawals().length > 0) {
            <span class="ml-1.5 px-1.5 py-0.5 rounded-full bg-orange-500 text-white text-xs font-bold">{{ pendingWithdrawals().length }}</span>
          }
        </button>
        <button
          class="flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-all"
          [class]="activeTab() === 'referrals' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
          (click)="activeTab.set('referrals')">
          Referral Settings
        </button>
        <button
          class="flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-all"
          [class]="activeTab() === 'audit' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
          (click)="activeTab.set('audit')">
          Audit Log
        </button>
      </div>

      <!-- Withdrawals Tab -->
      @if (activeTab() === 'withdrawals') {
        <div class="glass-card overflow-hidden">
          <div class="p-4 border-b border-slate-200">
            <h2 class="text-slate-800 font-bold">Withdrawal Queue</h2>
            <p class="text-xs text-muted mt-1">Pay user externally via bank/UPI, then tap "Mark Paid" to debit their wallet.</p>
          </div>

          @if (pendingWithdrawals().length === 0) {
            <div class="p-12 text-center">
              <div class="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                <svg class="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <p class="text-slate-700 font-semibold">All clear!</p>
              <p class="text-muted text-sm mt-1">No pending withdrawals</p>
            </div>
          }

          <div class="divide-y divide-slate-100">
            @for (tx of pendingWithdrawals(); track tx.id) {
              <div class="p-4">
                <!-- Top: amount + status -->
                <div class="flex items-start justify-between gap-3 mb-3">
                  <div class="flex-1 min-w-0">
                    <div class="flex flex-wrap items-center gap-2 mb-1">
                      <span class="px-2 py-0.5 rounded-lg text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">PENDING</span>
                      <span class="text-xs text-muted">{{ tx.date | date:'d MMM, h:mm a' }}</span>
                    </div>
                    <p class="text-slate-800 font-semibold text-sm">{{ tx.description }}</p>
                    <p class="text-xs text-muted mt-0.5">
                      {{ userLabel(tx.userId) }}
                      @if (tx.reference) { · Ref: {{ tx.reference }} }
                    </p>
                  </div>
                  <div class="text-right flex-shrink-0">
                    <div class="text-xl font-bold text-orange-600">₹{{ abs(tx.amount).toLocaleString('en-IN') }}</div>
                  </div>
                </div>
                <!-- Actions -->
                <div class="flex gap-2">
                  <button class="btn-primary flex-1 text-sm py-2.5" (click)="approve(tx)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    Mark Paid
                  </button>
                  <button class="btn-danger flex-1 text-sm py-2.5" (click)="reject(tx)">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    Reject
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Referral Settings Tab -->
      @if (activeTab() === 'referrals') {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div class="glass-card p-5">
            <h2 class="text-slate-800 font-bold mb-1">Referral Configuration</h2>
            <p class="text-xs text-muted mb-5">Changes apply to future signups only.</p>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Referrer Bonus (₹)</label>
                <input class="input-field" type="number" min="0" [(ngModel)]="referralBonus" inputmode="numeric"/>
                <p class="text-xs text-muted mt-1">Paid to the person who shared the code</p>
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">New User Join Bonus (₹)</label>
                <input class="input-field" type="number" min="0" [(ngModel)]="referralJoinBonus" inputmode="numeric"/>
                <p class="text-xs text-muted mt-1">Paid to the new user who used the code</p>
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Code Validity (hours)</label>
                <input class="input-field" type="number" min="1" [(ngModel)]="referralCodeValidityHours" inputmode="numeric"/>
              </div>
              <button class="btn-primary w-full" (click)="saveSettings()">Save Settings</button>
            </div>
          </div>

          <div class="glass-card p-5">
            <h2 class="text-slate-800 font-bold mb-4">Referral Health</h2>
            <div class="grid grid-cols-2 gap-4 mb-5">
              <div class="stat-card p-4">
                <div class="text-muted text-xs mb-1">Total Referrals</div>
                <div class="text-2xl font-bold text-slate-800">{{ referrals.length }}</div>
              </div>
              <div class="stat-card p-4">
                <div class="text-muted text-xs mb-1">Bonus Liability</div>
                <div class="text-2xl font-bold text-red-600">₹{{ referralLiability().toLocaleString('en-IN') }}</div>
              </div>
            </div>

            @if (referrals.length > 0) {
              <div class="space-y-2">
                <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recent Referrals</p>
                @for (r of referrals.slice(0, 5); track r.referredId) {
                  <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {{ r.referrerName.charAt(0) }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-slate-800 text-xs font-semibold truncate">{{ r.referrerName }} → {{ r.referredName }}</p>
                      <p class="text-muted text-xs">{{ r.date | date:'d MMM' }}</p>
                    </div>
                    <div class="text-green-600 text-xs font-bold flex-shrink-0">+₹{{ r.bonusPaid }}</div>
                  </div>
                }
              </div>
            } @else {
              <div class="text-center py-6 text-muted text-sm">No referrals yet</div>
            }
          </div>
        </div>
      }

      <!-- Audit Log Tab -->
      @if (activeTab() === 'audit') {
        <div class="glass-card overflow-hidden">
          <div class="p-4 border-b border-slate-200">
            <h2 class="text-slate-800 font-bold">Payment Audit Log</h2>
            <p class="text-xs text-muted mt-1">All prize credits and withdrawal transactions</p>
          </div>
          <div class="divide-y divide-slate-100">
            @for (tx of recentAudit(); track tx.id) {
              <div class="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                  [class]="tx.type === 'prize' ? 'bg-green-50' : tx.type === 'withdrawal' ? 'bg-orange-50' : 'bg-slate-100'">
                  {{ tx.type === 'prize' ? '🏆' : tx.type === 'withdrawal' ? '🏦' : '💰' }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-slate-800 text-sm font-medium truncate">{{ tx.description }}</p>
                  <p class="text-muted text-xs mt-0.5">{{ tx.date | date:'d MMM, h:mm a' }}</p>
                </div>
                <div class="text-right flex-shrink-0">
                  <div class="text-sm font-bold" [class]="tx.amount > 0 ? 'text-green-600' : 'text-slate-700'">
                    {{ tx.amount > 0 ? '+' : '' }}₹{{ abs(tx.amount).toLocaleString('en-IN') }}
                  </div>
                  <span class="text-xs px-2 py-0.5 rounded-full inline-block mt-0.5"
                    [class]="tx.status === 'success' ? 'bg-green-50 text-green-700' : tx.status === 'failed' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-700'">
                    {{ tx.status }}
                  </span>
                </div>
              </div>
            }
            @if (recentAudit().length === 0) {
              <div class="p-10 text-center text-muted text-sm">No transactions yet</div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class AdminPaymentsComponent {
  activeTab = signal<'withdrawals' | 'referrals' | 'audit'>('withdrawals');
  settings = this.adminSettings.get();
  referralBonus = this.settings.referralBonus;
  referralJoinBonus = this.settings.referralJoinBonus;
  referralCodeValidityHours = this.settings.referralCodeValidityHours;
  message = signal('');
  error = signal('');
  referrals = this.referral.getAll();

  pendingWithdrawals = computed(() => this.state.getPendingPayouts());
  paidTotal = computed(() =>
    this.state.transactions()
      .filter(tx => tx.type === 'withdrawal' && tx.status === 'success')
      .reduce((s, tx) => s + this.abs(tx.amount), 0)
  );
  referralLiability = computed(() =>
    this.referrals.reduce((s, r) => s + r.bonusPaid + (r.joinBonusPaid || 0), 0)
  );
  recentAudit = computed(() =>
    this.state.transactions()
      .filter(tx => tx.type === 'prize' || tx.type === 'withdrawal')
      .slice(0, 20)
  );

  constructor(
    private state: StateService,
    private auth: AuthService,
    private adminSettings: AdminSettingsService,
    private referral: ReferralService
  ) {}

  approve(tx: Transaction) {
    if (!tx.userId) return this.showError('Withdrawal user is missing');
    const user = this.auth.getStoredUsers().find(u => u.id === tx.userId);
    if (!user) return this.showError('User account not found');
    if (user.walletBalance < this.abs(tx.amount)) return this.showError('User wallet balance is insufficient');

    this.auth.adjustUserWallet(tx.userId, tx.amount);
    this.state.updateTransactionStatus(tx.id, 'success', `WD_PAID_${Date.now()}`);
    this.showMessage('Withdrawal marked paid · wallet debited');
  }

  reject(tx: Transaction) {
    this.state.updateTransactionStatus(tx.id, 'failed', `WD_REJECTED_${Date.now()}`);
    this.showMessage('Withdrawal rejected · wallet not debited');
  }

  saveSettings() {
    if (this.referralBonus < 0 || this.referralJoinBonus < 0 || this.referralCodeValidityHours < 1) {
      this.showError('All values must be valid positive numbers');
      return;
    }
    this.settings = { ...this.settings, referralBonus: +this.referralBonus, referralJoinBonus: +this.referralJoinBonus, referralCodeValidityHours: +this.referralCodeValidityHours };
    this.adminSettings.save(this.settings);
    this.showMessage('Referral settings saved');
  }

  userLabel(userId?: string): string {
    if (!userId) return 'Unknown';
    return this.auth.getStoredUsers().find(u => u.id === userId)?.name || userId;
  }

  abs(v: number) { return Math.abs(v); }

  formatAmount(n: number): string {
    if (n >= 100000) return (n / 100000).toFixed(1) + 'L';
    if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
    return n.toLocaleString('en-IN');
  }

  private showMessage(text: string) {
    this.error.set('');
    this.message.set(text);
    setTimeout(() => this.message.set(''), 3000);
  }

  private showError(text: string) {
    this.message.set('');
    this.error.set(text);
    setTimeout(() => this.error.set(''), 3000);
  }
}
