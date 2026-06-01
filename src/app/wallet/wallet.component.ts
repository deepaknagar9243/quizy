import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../shared/services/auth.service';
import { StateService } from '../shared/services/state.service';
import { ApiService } from '../shared/services/api.service';
import { BackendTransaction, BackendWalletSummary, PaymentRequest, WithdrawalRequest } from '../shared/models/models';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fade-in space-y-6">
      <div>
        <h1 class="page-header">Wallet</h1>
        <p class="page-subheader">Manage your funds and transactions</p>
      </div>

      <!-- Balance Card -->
      <div class="glass-card p-6 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-r from-red-50 to-transparent pointer-events-none"></div>
        <div class="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p class="text-muted text-sm mb-1">Available Balance</p>
            @if (loadingBalance()) {
              <div class="h-10 w-32 bg-slate-200 rounded-xl animate-pulse"></div>
            } @else {
              <div class="text-4xl font-bold text-slate-800">₹{{ walletSummary()?.balance?.toLocaleString('en-IN') ?? user()?.walletBalance?.toLocaleString('en-IN') }}</div>
            }
            @if (pendingAmt() > 0) {
              <p class="text-orange-600 text-xs mt-1">Pending withdrawal: ₹{{ pendingAmt().toLocaleString('en-IN') }}</p>
            }
          </div>
          <div class="flex flex-wrap gap-3">
            <button class="btn-primary" (click)="openDeposit()">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Add Money
            </button>
            <button class="btn-secondary" (click)="openWithdraw()">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
              </svg>
              Withdraw
            </button>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="stat-card">
          <div class="text-muted text-xs mb-2">Total Deposited</div>
          <div class="text-xl font-bold text-slate-800">₹{{ (walletSummary()?.totalDeposited ?? 0).toLocaleString('en-IN') }}</div>
        </div>
        <div class="stat-card">
          <div class="text-muted text-xs mb-2">Total Withdrawn</div>
          <div class="text-xl font-bold text-slate-800">₹{{ (walletSummary()?.totalWithdrawn ?? 0).toLocaleString('en-IN') }}</div>
        </div>
        <div class="stat-card">
          <div class="text-muted text-xs mb-2">Prize Earnings</div>
          <div class="text-xl font-bold text-green-600">₹{{ (walletSummary()?.totalEarned ?? 0).toLocaleString('en-IN') }}</div>
        </div>
        <div class="stat-card">
          <div class="text-muted text-xs mb-2">Entry Fees Paid</div>
          <div class="text-xl font-bold text-red-500">₹{{ (walletSummary()?.totalSpent ?? 0).toLocaleString('en-IN') }}</div>
        </div>
      </div>

      <!-- Transactions -->
      <div class="glass-card overflow-hidden">
        <div class="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 class="text-slate-800 font-bold">Transaction History</h3>
          <div class="flex items-center gap-3">
            <select class="input-field py-1.5 text-sm w-40" [(ngModel)]="txFilter" (ngModelChange)="loadTransactions()">
              <option value="">All</option>
              <option value="DEPOSIT">Deposits</option>
              <option value="WITHDRAWAL">Withdrawals</option>
              <option value="PRIZE">Prizes</option>
              <option value="ENTRY_FEE">Entry Fees</option>
            </select>
          </div>
        </div>

        @if (loadingTx()) {
          <div class="p-8 text-center">
            <div class="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        } @else if (transactions().length === 0) {
          <div class="p-12 text-center text-muted">No transactions found</div>
        } @else {
          <div class="divide-y divide-slate-100">
            @for (tx of transactions(); track tx.id) {
              <div class="px-5 py-4 grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-4 hover:bg-slate-50 transition-colors">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg" [class]="getTxBg(tx.type)">
                  {{ getTxIcon(tx.type) }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-slate-800 font-medium text-sm truncate">{{ tx.description }}</div>
                  <div class="text-muted text-xs mt-0.5">{{ formatDate(tx.createdAt) }}</div>
                </div>
                <div class="text-right">
                  <div class="font-bold text-sm" [class]="tx.amount > 0 ? 'text-green-600' : 'text-red-500'">
                    {{ tx.amount > 0 ? '+' : '' }}₹{{ Math.abs(tx.amount).toLocaleString('en-IN') }}
                  </div>
                  <span class="text-xs px-2 py-0.5 rounded-full mt-0.5 inline-block"
                    [class]="tx.status === 'SUCCESS' ? 'bg-green-50 text-green-600' : tx.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-500'">
                    {{ tx.status | lowercase }}
                  </span>
                </div>
              </div>
            }
          </div>
          <!-- Load more -->
          @if (!isLastPage()) {
            <div class="p-4 text-center">
              <button class="btn-ghost text-sm" (click)="loadMore()" [disabled]="loadingTx()">Load more</button>
            </div>
          }
        }
      </div>

      <!-- DEPOSIT MODAL -->
      @if (showDeposit()) {
        <div class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center sm:p-4">
          <div class="bg-white w-full sm:max-w-md sm:mx-auto sm:rounded-2xl rounded-t-2xl p-5 max-h-[92dvh] overflow-y-auto">
            <div class="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden"></div>
            <div class="flex items-center justify-between mb-5">
              <h3 class="text-slate-800 font-bold text-lg">Add Money</h3>
              <button class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center" (click)="showDeposit.set(false)">✕</button>
            </div>

            <div class="grid grid-cols-3 gap-2 mb-4">
              @for (amt of quickAmounts; track amt) {
                <button class="py-2 text-sm rounded-xl border font-semibold transition-all"
                  [class]="depositAmt === amt ? 'border-red-500 bg-red-50 text-red-600' : 'border-slate-200 text-slate-600 hover:border-red-300'"
                  (click)="depositAmt = amt">₹{{ amt.toLocaleString('en-IN') }}</button>
              }
            </div>

            <div class="mb-4">
              <label class="block text-sm font-semibold text-slate-700 mb-2">Custom Amount (Min ₹10)</label>
              <input type="number" class="input-field" placeholder="Enter amount" [(ngModel)]="depositAmt" min="10" inputmode="numeric"/>
            </div>

            <div class="mb-5">
              <label class="block text-sm font-semibold text-slate-700 mb-3">Payment Method</label>
              <div class="space-y-2">
                @for (m of paymentMethods; track m.id) {
                  <label class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all"
                    [class]="depositMethod === m.id ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-slate-300'">
                    <input type="radio" [value]="m.id" [(ngModel)]="depositMethod" class="hidden"/>
                    <span class="text-xl">{{ m.icon }}</span>
                    <div class="flex-1">
                      <div class="text-slate-800 text-sm font-medium">{{ m.name }}</div>
                      <div class="text-muted text-xs">{{ m.desc }}</div>
                    </div>
                    @if (depositMethod === m.id) { <span class="text-red-500 font-bold">✓</span> }
                  </label>
                }
              </div>
            </div>

            @if (depositMethod === 'UPI') {
              <div class="mb-4">
                <label class="block text-sm font-semibold text-slate-700 mb-2">UPI ID</label>
                <input type="text" class="input-field" placeholder="yourname@upi" [(ngModel)]="upiId"/>
              </div>
            }

            @if (depositError()) {
              <div class="mb-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{{ depositError() }}</div>
            }

            <div class="flex gap-3">
              <button class="btn-secondary flex-1" (click)="showDeposit.set(false)" [disabled]="processing()">Cancel</button>
              <button class="btn-primary flex-1" (click)="processDeposit()" [disabled]="processing() || !depositAmt || depositAmt < 10">
                @if (processing()) { <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> }
                Pay ₹{{ (depositAmt || 0).toLocaleString('en-IN') }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- WITHDRAW MODAL -->
      @if (showWithdraw()) {
        <div class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center sm:p-4">
          <div class="bg-white w-full sm:max-w-md sm:mx-auto sm:rounded-2xl rounded-t-2xl p-5 max-h-[92dvh] overflow-y-auto">
            <div class="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden"></div>
            <div class="flex items-center justify-between mb-5">
              <h3 class="text-slate-800 font-bold text-lg">Withdraw Funds</h3>
              <button class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center" (click)="showWithdraw.set(false)">✕</button>
            </div>

            <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 mb-4 flex justify-between">
              <span class="text-muted text-sm">Available</span>
              <span class="text-slate-800 font-bold">₹{{ (walletSummary()?.balance ?? user()?.walletBalance ?? 0).toLocaleString('en-IN') }}</span>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-semibold text-slate-700 mb-2">Method</label>
              <div class="flex gap-2">
                <button class="flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all"
                  [class]="withdrawMethod === 'upi' ? 'border-red-500 bg-red-50 text-red-600' : 'border-slate-200 text-slate-600'"
                  (click)="withdrawMethod = 'upi'">📱 UPI</button>
                <button class="flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all"
                  [class]="withdrawMethod === 'bank' ? 'border-red-500 bg-red-50 text-red-600' : 'border-slate-200 text-slate-600'"
                  (click)="withdrawMethod = 'bank'">🏦 Bank</button>
              </div>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-semibold text-slate-700 mb-2">
                {{ withdrawMethod === 'upi' ? 'UPI ID' : 'Account Number / IFSC' }}
              </label>
              <input type="text" class="input-field" [placeholder]="withdrawMethod === 'upi' ? 'yourname@upi' : 'ACCNO@IFSC'" [(ngModel)]="accountDetail"/>
              <p class="text-xs text-muted mt-1">{{ withdrawMethod === 'upi' ? 'e.g. name@okaxis' : 'Format: AccountNumber@IFSCCode' }}</p>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-semibold text-slate-700 mb-2">Amount (Min ₹100)</label>
              <input type="number" class="input-field" placeholder="Enter amount" [(ngModel)]="withdrawAmt" min="100" inputmode="numeric"/>
            </div>

            <div class="p-3 rounded-xl bg-yellow-50 border border-yellow-200 mb-4">
              <p class="text-yellow-700 text-xs">⚠️ Processed in 24-48 hours. TDS applicable above ₹10,000.</p>
            </div>

            @if (withdrawError()) {
              <div class="mb-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{{ withdrawError() }}</div>
            }

            <div class="flex gap-3">
              <button class="btn-secondary flex-1" (click)="showWithdraw.set(false)" [disabled]="processing()">Cancel</button>
              <button class="btn-primary flex-1" (click)="processWithdraw()" [disabled]="processing() || !withdrawAmt || withdrawAmt < 100">
                @if (processing()) { <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> }
                Withdraw ₹{{ (withdrawAmt || 0).toLocaleString('en-IN') }}
              </button>
            </div>
          </div>
        </div>
      }

      @if (successMsg()) {
        <div class="fixed bottom-24 lg:bottom-6 right-4 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 fade-in">
          <span>✓</span><span class="font-medium text-sm">{{ successMsg() }}</span>
        </div>
      }
    </div>
  `
})
export class WalletComponent implements OnInit {
  Math = Math;
  user = this.auth.currentUser;

  walletSummary = signal<BackendWalletSummary | null>(null);
  transactions = signal<BackendTransaction[]>([]);
  loadingBalance = signal(true);
  loadingTx = signal(true);
  isLastPage = signal(true);
  currentPage = 0;
  txFilter = '';

  showDeposit = signal(false);
  showWithdraw = signal(false);
  processing = signal(false);
  depositError = signal('');
  withdrawError = signal('');
  successMsg = signal('');

  depositAmt: number | null = null;
  depositMethod = 'UPI';
  upiId = '';
  withdrawAmt: number | null = null;
  withdrawMethod: 'upi' | 'bank' = 'upi';
  accountDetail = '';

  quickAmounts = [100, 200, 500, 1000, 2000, 5000];
  paymentMethods = [
    { id: 'UPI', name: 'UPI', icon: '📱', desc: 'Google Pay, PhonePe, Paytm' },
    { id: 'CARD', name: 'Debit / Credit Card', icon: '💳', desc: 'Visa, Mastercard, Rupay' },
    { id: 'NET_BANKING', name: 'Net Banking', icon: '🏦', desc: 'All major banks' },
  ];

  pendingAmt = computed(() =>
    this.transactions().filter(t => t.type === 'WITHDRAWAL' && t.status === 'PENDING')
      .reduce((s, t) => s + Math.abs(t.amount), 0)
  );

  constructor(private auth: AuthService, private state: StateService, private api: ApiService) {}

  async ngOnInit() {
    await Promise.all([this.loadWalletSummary(), this.loadTransactions()]);
  }

  async loadWalletSummary() {
    this.loadingBalance.set(true);
    try {
      const summary = await this.api.getWalletSummary();
      this.walletSummary.set(summary);
      // Sync wallet balance to auth user
      this.auth.updateWallet(summary.balance - (this.user()?.walletBalance ?? 0));
    } catch {
      // fallback to local user balance
    } finally {
      this.loadingBalance.set(false);
    }
  }

  async loadTransactions() {
    this.loadingTx.set(true);
    this.currentPage = 0;
    try {
      const res = await this.api.getTransactions({ page: 0, size: 20 });
      this.transactions.set(res.content);
      this.isLastPage.set(res.last);
    } catch {
      // fallback to local state transactions
      const local = this.state.transactions().map(t => ({
        id: parseInt(t.id.replace('tx_', '')) || 0,
        type: t.type.toUpperCase(),
        amount: t.amount,
        description: t.description,
        status: t.status.toUpperCase(),
        createdAt: t.date
      } as BackendTransaction));
      this.transactions.set(local);
    } finally {
      this.loadingTx.set(false);
    }
  }

  async loadMore() {
    this.currentPage++;
    this.loadingTx.set(true);
    try {
      const res = await this.api.getTransactions({ page: this.currentPage, size: 20 });
      this.transactions.update(prev => [...prev, ...res.content]);
      this.isLastPage.set(res.last);
    } finally {
      this.loadingTx.set(false);
    }
  }

  openDeposit() { this.depositError.set(''); this.showDeposit.set(true); }
  openWithdraw() { this.withdrawError.set(''); this.showWithdraw.set(true); }

  async processDeposit() {
    if (!this.depositAmt || this.depositAmt < 10) { this.depositError.set('Minimum deposit is ₹10'); return; }
    if (this.depositMethod === 'UPI' && !this.upiId.includes('@')) { this.depositError.set('Enter a valid UPI ID'); return; }

    this.processing.set(true);
    this.depositError.set('');
    try {
      const req: PaymentRequest = { amount: this.depositAmt, method: this.depositMethod.toLowerCase() as any, upiId: this.upiId };
      await this.api.initiateDeposit(req);
      await this.loadWalletSummary();
      await this.loadTransactions();
      this.state.addNotification({ type: 'deposit', title: 'Money Added', message: `₹${this.depositAmt.toLocaleString('en-IN')} added to your wallet` });
      this.showDeposit.set(false);
      this.depositAmt = null;
      this.upiId = '';
      this.showSuccess(`₹${req.amount.toLocaleString('en-IN')} added successfully!`);
    } catch (e: any) {
      this.depositError.set(e?.message || 'Payment failed. Please try again.');
    } finally {
      this.processing.set(false);
    }
  }

  async processWithdraw() {
    const balance = this.walletSummary()?.balance ?? this.user()?.walletBalance ?? 0;
    if (!this.withdrawAmt || this.withdrawAmt < 100) { this.withdrawError.set('Minimum withdrawal is ₹100'); return; }
    if (this.withdrawAmt > balance) { this.withdrawError.set('Insufficient balance'); return; }
    if (!this.accountDetail.trim()) { this.withdrawError.set('Enter your UPI ID or bank account details'); return; }

    this.processing.set(true);
    this.withdrawError.set('');
    try {
      const req: WithdrawalRequest = { amount: this.withdrawAmt, method: this.withdrawMethod, upiId: this.withdrawMethod === 'upi' ? this.accountDetail : undefined };
      await this.api.initiateWithdrawal(req);
      await this.loadWalletSummary();
      await this.loadTransactions();
      this.state.addNotification({ type: 'withdrawal', title: 'Withdrawal Requested', message: `₹${this.withdrawAmt.toLocaleString('en-IN')} withdrawal submitted` });
      this.showWithdraw.set(false);
      this.withdrawAmt = null;
      this.accountDetail = '';
      this.showSuccess(`Withdrawal of ₹${req.amount.toLocaleString('en-IN')} submitted!`);
    } catch (e: any) {
      this.withdrawError.set(e?.message || 'Withdrawal failed. Please try again.');
    } finally {
      this.processing.set(false);
    }
  }

  private showSuccess(msg: string) {
    this.successMsg.set(msg);
    setTimeout(() => this.successMsg.set(''), 3500);
  }

  getTxBg(type: string): string {
    const m: Record<string, string> = { DEPOSIT: 'bg-blue-50', WITHDRAWAL: 'bg-orange-50', PRIZE: 'bg-green-50', ENTRY_FEE: 'bg-red-50', REFUND: 'bg-purple-50', BONUS: 'bg-yellow-50' };
    return m[type] || 'bg-slate-100';
  }

  getTxIcon(type: string): string {
    const m: Record<string, string> = { DEPOSIT: '↓', WITHDRAWAL: '↑', PRIZE: '🏆', ENTRY_FEE: '🎯', REFUND: '↩', BONUS: '🎁' };
    return m[type] || '💰';
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
