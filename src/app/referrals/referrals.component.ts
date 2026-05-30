import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminSettingsService } from '../shared/services/admin-settings.service';
import { AuthService } from '../shared/services/auth.service';
import { ReferralService } from '../shared/services/referral.service';

@Component({
  selector: 'app-referrals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fade-in space-y-6 max-w-5xl">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="page-header">Refer & Earn</h1>
          <p class="page-subheader">Share your code and earn bonus balance when friends join.</p>
        </div>
        <button class="btn-secondary" (click)="copyInviteLink()">Copy invite link</button>
      </div>

      @if (message()) {
        <div class="p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
          {{ message() }}
        </div>
      }

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div class="glass-card p-6 lg:col-span-2">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div class="stat-card">
              <div class="text-muted text-xs font-semibold uppercase">Your Code</div>
              <div class="text-2xl font-bold text-slate-800 mt-2 tracking-wide">{{ referralCode() }}</div>
            </div>
            <div class="stat-card">
              <div class="text-muted text-xs font-semibold uppercase">Successful Referrals</div>
              <div class="text-2xl font-bold text-red-600 mt-2">{{ records().length }}</div>
            </div>
            <div class="stat-card">
              <div class="text-muted text-xs font-semibold uppercase">Bonus Earned</div>
              <div class="text-2xl font-bold text-green-600 mt-2">Rs {{ totalEarned().toLocaleString('en-IN') }}</div>
            </div>
          </div>

          <label class="block text-sm font-semibold text-slate-700 mb-2">Invite Link</label>
          <div class="flex flex-col sm:flex-row gap-3">
            <input class="input-field font-mono text-sm" [value]="inviteLink()" readonly />
            <button class="btn-primary sm:w-36" (click)="copyInviteLink()">Copy</button>
          </div>

          <div class="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="rounded-xl bg-red-50 border border-red-100 p-4">
              <div class="text-sm font-semibold text-slate-800">You earn</div>
              <div class="text-xl font-bold text-red-600 mt-1">Rs {{ settings.referralBonus }}</div>
              <p class="text-xs text-muted mt-1">Credited as bonus balance after a friend signs up.</p>
            </div>
            <div class="rounded-xl bg-green-50 border border-green-100 p-4">
              <div class="text-sm font-semibold text-slate-800">Friend gets</div>
              <div class="text-xl font-bold text-green-600 mt-1">Rs {{ settings.referralJoinBonus }}</div>
              <p class="text-xs text-muted mt-1">Added to their signup bonus when your code is valid.</p>
            </div>
          </div>
        </div>

        <div class="glass-card p-6">
          <h2 class="text-slate-800 font-bold mb-4">How it works</h2>
          <div class="space-y-4">
            <div class="flex gap-3">
              <div class="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <div class="text-sm font-semibold text-slate-800">Share your link</div>
                <div class="text-xs text-muted mt-1">Send it to friends or paste your code manually.</div>
              </div>
            </div>
            <div class="flex gap-3">
              <div class="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <div class="text-sm font-semibold text-slate-800">Friend signs up</div>
                <div class="text-xs text-muted mt-1">The register form applies your referral code.</div>
              </div>
            </div>
            <div class="flex gap-3">
              <div class="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <div class="text-sm font-semibold text-slate-800">Bonus is credited</div>
                <div class="text-xs text-muted mt-1">Pending bonuses are claimed on your next login.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="glass-card p-6">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-slate-800 font-bold">Referral History</h2>
          <span class="text-xs text-muted">{{ records().length }} records</span>
        </div>

        @if (records().length) {
          <div class="divide-y divide-slate-100">
            @for (record of records(); track record.referredId) {
              <div class="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div class="font-semibold text-slate-800">{{ record.referredName }}</div>
                  <div class="text-xs text-muted">Code {{ record.code }} - {{ record.date | date:'medium' }}</div>
                </div>
                <div class="text-sm font-bold text-green-600">+Rs {{ record.bonusPaid }}</div>
              </div>
            }
          </div>
        } @else {
          <div class="rounded-xl bg-slate-50 border border-slate-200 p-6 text-center">
            <div class="text-slate-800 font-semibold">No referrals yet</div>
            <p class="text-sm text-muted mt-1">Copy your link and invite your first friend.</p>
          </div>
        }
      </div>
    </div>
  `
})
export class ReferralsComponent {
  user = this.auth.currentUser;
  settings = this.adminSettings.get();
  message = signal('');
  referralCode = computed(() => this.user()?.referralCode || '');
  inviteLink = computed(() => `${window.location.origin}/register?ref=${this.referralCode()}`);
  records = computed(() => this.referral.getReferralsByUser(this.user()?.id || ''));
  totalEarned = computed(() => this.records().reduce((sum, record) => sum + record.bonusPaid, 0));

  constructor(
    private auth: AuthService,
    private referral: ReferralService,
    private adminSettings: AdminSettingsService
  ) {}

  copyInviteLink() {
    const text = this.inviteLink();
    if (!text) return;

    navigator.clipboard?.writeText(text)
      .then(() => this.showMessage('Invite link copied'))
      .catch(() => this.showMessage(text));
  }

  private showMessage(text: string) {
    this.message.set(text);
    setTimeout(() => this.message.set(''), 2500);
  }
}
