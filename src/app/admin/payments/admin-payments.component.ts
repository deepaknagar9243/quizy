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
    <div class="fade-in space-y-6">
      <div class="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 class="page-header">Payments & Rewards</h1>
          <p class="page-subheader">Process real bank/UPI withdrawals and control referral bonuses.</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <span class="px-3 py-2 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-semibold">
            {{ pendingWithdrawals().length }} pending withdrawals
          </span>
          <span class="px-3 py-2 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-semibold">
            Rs {{ paidWithdrawalTotal().toLocaleString('en-IN') }} paid
          </span>
        </div>
      </div>

      @if (message()) {
        <div class="p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
          {{ message() }}
        </div>
      }

      @if (error()) {
        <div class="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {{ error() }}
        </div>
      }

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="stat-card">
          <div class="text-muted text-xs mb-2">Pending Withdrawals</div>
          <div class="text-2xl font-bold text-slate-800">{{ pendingWithdrawalCount() }}</div>
          <div class="text-xs text-muted mt-1">Pay via bank/UPI, then approve</div>
        </div>
        <div class="stat-card">
          <div class="text-muted text-xs mb-2">Virtual Prize Credits</div>
          <div class="text-2xl font-bold text-slate-800">Rs {{ prizeCreditTotal().toLocaleString('en-IN') }}</div>
          <div class="text-xs text-muted mt-1">Shown in user wallet, paid only on withdrawal</div>
        </div>
        <div class="stat-card">
          <div class="text-muted text-xs mb-2">Referral Bonus</div>
          <div class="text-2xl font-bold text-red-600">Rs {{ settings.referralBonus }}</div>
          <div class="text-xs text-muted mt-1">Paid to referrer</div>
        </div>
        <div class="stat-card">
          <div class="text-muted text-xs mb-2">Join Bonus</div>
          <div class="text-2xl font-bold text-green-600">Rs {{ settings.referralJoinBonus }}</div>
          <div class="text-xs text-muted mt-1">Paid to new user</div>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6">
        <div class="glass-card overflow-hidden">
          <div class="p-5 border-b border-slate-200 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-slate-800 font-bold">Withdrawal Queue</h2>
              <p class="text-xs text-muted mt-1">User wallet is virtual. Pay the user externally, then approve to debit wallet.</p>
            </div>
            <span class="px-3 py-2 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 text-sm font-semibold">
              Razorpay/bank settlement outside wallet
            </span>
          </div>

          @if (pendingWithdrawals().length === 0) {
            <div class="p-10 text-center">
              <div class="font-semibold text-slate-800">No pending withdrawals</div>
              <p class="text-sm text-muted mt-1">User withdrawal requests will appear here.</p>
            </div>
          }

          <div class="divide-y divide-slate-100">
            @for (tx of pendingWithdrawals(); track tx.id) {
              <div class="p-5 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-4 hover:bg-slate-50">
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="px-2 py-1 rounded-lg text-xs font-bold bg-orange-50 text-orange-700">WITHDRAWAL</span>
                    <span class="text-xs text-muted">{{ tx.date | date:'medium' }}</span>
                  </div>
                  <div class="font-semibold text-slate-800 mt-2">{{ tx.description }}</div>
                  <div class="text-xs text-muted mt-1">
                    User: {{ userLabel(tx.userId) }} | Ref: {{ tx.reference || tx.id }}
                  </div>
                </div>
                <div class="flex flex-col sm:flex-row lg:flex-col gap-2 lg:items-end">
                  <div class="text-lg font-bold text-orange-600">
                    Rs {{ abs(tx.amount).toLocaleString('en-IN') }}
                  </div>
                  <div class="flex gap-2">
                    <button class="btn-primary min-h-0 py-2 px-4 text-sm" (click)="approve(tx)">Mark Paid</button>
                    <button class="btn-danger min-h-0 py-2 px-4 text-sm" (click)="reject(tx)">Reject</button>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <div class="glass-card p-5">
          <h2 class="text-slate-800 font-bold mb-1">Referral Settings</h2>
          <p class="text-xs text-muted mb-5">Changing these values affects future signups only.</p>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">Referrer Bonus</label>
              <input class="input-field" type="number" min="0" [(ngModel)]="referralBonus" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">New User Join Bonus</label>
              <input class="input-field" type="number" min="0" [(ngModel)]="referralJoinBonus" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">Code Validity Hours</label>
              <input class="input-field" type="number" min="1" [(ngModel)]="referralCodeValidityHours" />
            </div>
            <button class="btn-primary w-full" (click)="saveSettings()">Save referral settings</button>
          </div>

          <div class="mt-6 rounded-xl bg-slate-50 border border-slate-200 p-4">
            <div class="text-sm font-semibold text-slate-800">Referral Health</div>
            <div class="grid grid-cols-2 gap-3 mt-3">
              <div>
                <div class="text-xs text-muted">Total Referrals</div>
                <div class="text-lg font-bold text-slate-800">{{ referrals.length }}</div>
              </div>
              <div>
                <div class="text-xs text-muted">Bonus Liability</div>
                <div class="text-lg font-bold text-slate-800">Rs {{ referralLiability().toLocaleString('en-IN') }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="glass-card overflow-hidden">
        <div class="p-5 border-b border-slate-200">
          <h2 class="text-slate-800 font-bold">Recent Payment Audit</h2>
        </div>
        <div class="divide-y divide-slate-100">
          @for (tx of recentAudit(); track tx.id) {
            <div class="px-5 py-4 grid grid-cols-[minmax(0,1fr)_auto] gap-3">
              <div class="min-w-0">
                <div class="font-medium text-sm text-slate-800 truncate">{{ tx.description }}</div>
                <div class="text-xs text-muted mt-1">{{ tx.date | date:'medium' }} | {{ tx.reference || tx.id }}</div>
              </div>
              <div class="text-right">
                <div class="font-bold text-sm">Rs {{ abs(tx.amount).toLocaleString('en-IN') }}</div>
                <span class="text-xs px-2 py-1 rounded-full inline-block mt-1"
                  [class]="tx.status === 'success' ? 'bg-green-50 text-green-700' : tx.status === 'failed' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-700'">
                  {{ tx.status }}
                </span>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class AdminPaymentsComponent {
  settings = this.adminSettings.get();
  referralBonus = this.settings.referralBonus;
  referralJoinBonus = this.settings.referralJoinBonus;
  referralCodeValidityHours = this.settings.referralCodeValidityHours;
  message = signal('');
  error = signal('');
  referrals = this.referral.getAll();

  pendingWithdrawals = computed(() => this.state.getPendingPayouts());
  pendingWithdrawalCount = computed(() => this.pendingWithdrawals().length);
  paidWithdrawalTotal = computed(() =>
    this.state.transactions()
      .filter(tx => tx.type === 'withdrawal' && tx.status === 'success')
      .reduce((sum, tx) => sum + this.abs(tx.amount), 0)
  );
  prizeCreditTotal = computed(() =>
    this.state.transactions()
      .filter(tx => tx.type === 'prize' && tx.status === 'success')
      .reduce((sum, tx) => sum + tx.amount, 0)
  );
  referralLiability = computed(() =>
    this.referrals.reduce((sum, record) => sum + record.bonusPaid + (record.joinBonusPaid || 0), 0)
  );
  recentAudit = computed(() =>
    this.state.transactions()
      .filter(tx => tx.type === 'prize' || tx.type === 'withdrawal')
      .slice(0, 12)
  );

  constructor(
    private state: StateService,
    private auth: AuthService,
    private adminSettings: AdminSettingsService,
    private referral: ReferralService
  ) {}

  approve(tx: Transaction) {
    if (!tx.userId) return this.showError('Withdrawal user is missing');
    const user = this.auth.getStoredUsers().find(storedUser => storedUser.id === tx.userId);
    if (!user) return this.showError('User account not found');
    if (user.walletBalance < this.abs(tx.amount)) {
      return this.showError('User wallet balance is lower than this withdrawal');
    }

    this.auth.adjustUserWallet(tx.userId, tx.amount);
    const updated = this.state.updateTransactionStatus(tx.id, 'success', `WD_PAID_${Date.now()}`);
    if (!updated) return this.showError('Withdrawal record not found');

    this.showMessage('Withdrawal marked paid and wallet debited');
  }

  reject(tx: Transaction) {
    const updated = this.state.updateTransactionStatus(tx.id, 'failed', `WD_REJECTED_${Date.now()}`);
    if (!updated) return this.showError('Payout record not found');

    this.showMessage('Withdrawal rejected. Wallet balance was not debited.');
  }

  saveSettings() {
    if (this.referralBonus < 0 || this.referralJoinBonus < 0 || this.referralCodeValidityHours < 1) {
      this.showError('Referral values must be valid positive numbers');
      return;
    }

    this.settings = {
      ...this.settings,
      referralBonus: Number(this.referralBonus),
      referralJoinBonus: Number(this.referralJoinBonus),
      referralCodeValidityHours: Number(this.referralCodeValidityHours)
    };
    this.adminSettings.save(this.settings);
    this.showMessage('Referral settings updated');
  }

  userLabel(userId?: string): string {
    if (!userId) return 'Unknown user';
    return this.auth.getStoredUsers().find(user => user.id === userId)?.name || userId;
  }

  abs(value: number): number {
    return Math.abs(value);
  }

  private showMessage(text: string) {
    this.error.set('');
    this.message.set(text);
    setTimeout(() => this.message.set(''), 2500);
  }

  private showError(text: string) {
    this.message.set('');
    this.error.set(text);
    setTimeout(() => this.error.set(''), 3000);
  }
}
