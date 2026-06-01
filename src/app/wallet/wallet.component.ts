import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../shared/services/auth.service';
import { StateService } from '../shared/services/state.service';
import { ApiService } from '../shared/services/api.service';
import { Transaction, PaymentRequest, WithdrawalRequest } from '../shared/models/models';

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
            <div class="text-4xl font-bold text-slate-800">₹{{ user()?.walletBalance?.toLocaleString('en-IN') }}</div>
            <p class="text-muted text-xs mt-1">Withdrawable now: ₹{{ withdrawable().toLocaleString('en-IN') }}</p>
            @if (pendingWithdrawals() > 0) {
              <p class="text-orange-600 text-xs mt-1">Pending withdrawal requests: ₹{{ pendingWithdrawals().toLocaleString('en-IN') }}</p>
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
          <div class="text-xl font-bold text-slate-800">₹{{ totalDeposited().toLocaleString('en-IN') }}</div>
        </div>
        <div class="stat-card">
          <div class="text-muted text-xs mb-2">Total Withdrawn</div>
          <div class="text-xl font-bold text-slate-800">₹{{ totalWithdrawn().toLocaleString('en-IN') }}</div>
        </div>
        <div class="stat-card">
          <div class="text-muted text-xs mb-2">Prize Earnings</div>
          <div class="text-xl font-bold text-green-600">₹{{ totalPrize().toLocaleString('en-IN') }}</div>
        </div>
        <div class="stat-card">
          <div class="text-muted text-xs mb-2">Entry Fees Paid</div>
          <div class="text-xl font-bold text-red-500">₹{{ totalFees().toLocaleString('en-IN') }}</div>
        </div>
      </div>

      <!-- Transactions -->
      <div class="glass-card overflow-hidden">
        <div class="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 class="text-slate-800 font-bold">Transaction History</h3>
          <div class="flex items-center gap-3">
            <select class="input-field py-1.5 text-sm w-40" [(ngModel)]="txFilter">
              <option value="">All</option>
              <option value="deposit">Deposits</option>
              <option value="withdrawal">Withdrawals</option>
              <option value="prize">Prizes</option>
              <option value="entry_fee">Entry Fees</option>
            </select>
            <span class="text-muted text-sm">{{ filteredTx().length }}</span>
          </div>
        </div>

        @if (filteredTx().length === 0) {
          <div class="p-12 text-center text-muted">No transactions found</div>
        }

        <div class="divide-y divide-slate-100">
          @for (tx of filteredTx(); track tx.id) {
            <div class="px-5 py-4 grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                [class]="getTxBg(tx.type)">
                {{ getTxIcon(tx.type) }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-slate-800 font-medium text-sm truncate">{{ tx.description }}</div>
                <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                  <span class="text-muted text-xs">{{ formatDate(tx.date) }}</span>
                  @if (tx.reference) {
                    <span class="text-xs text-slate-400">· {{ tx.reference }}</span>
                  }
                </div>
              </div>
              <div class="text-right min-w-24">
                <div class="font-bold text-sm" [class]="tx.amount > 0 ? 'text-green-600' : 'text-red-500'">
                  {{ tx.amount > 0 ? '+' : '' }}₹{{ Math.abs(tx.amount).toLocaleString('en-IN') }}
                </div>
                <span class="text-xs px-2 py-0.5 rounded-full mt-0.5 inline-block"
                  [class]="tx.status === 'success' ? 'bg-green-50 text-green-600' : tx.status === 'pending' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-500'">
                  {{ tx.status }}
                </span>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- ── DEPOSIT MODAL ── -->
      @if (showDeposit()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div class="glass-card p-6 w-full max-w-md shadow-xl">
            <div class="flex items-center justify-between mb-5">
              <h3 class="text-slate-800 font-bold text-lg">Add Money to Wallet</h3>
              <button class="text-slate-400 hover:text-slate-600 text-xl" (click)="showDeposit.set(false)">✕</button>
            </div>

            <!-- Quick amounts -->
            <div class="grid grid-cols-3 gap-2 mb-4">
              @for (amt of quickAmounts; track amt) {
                <button class="py-2 text-sm rounded-lg border font-medium transition-all"
                  [class]="depositAmt === amt ? 'border-red-500 bg-red-50 text-red-600' : 'border-slate-200 text-slate-600 hover:border-red-300'"
                  (click)="depositAmt = amt">
                  ₹{{ amt.toLocaleString('en-IN') }}
                </button>
              }
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-slate-600 mb-2">Custom Amount (Min ₹10)</label>
              <input type="number" class="input-field" placeholder="Enter amount" [(ngModel)]="depositAmt" min="10" />
            </div>

            <!-- Payment method -->
            <div class="mb-5">
              <label class="block text-sm font-medium text-slate-600 mb-3">Payment Method</label>
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

            <!-- UPI ID field -->
            @if (depositMethod === 'upi') {
              <div class="mb-4">
                <label class="block text-sm font-medium text-slate-600 mb-2">UPI ID</label>
                <input type="text" class="input-field" placeholder="yourname@upi" [(ngModel)]="upiId" />
              </div>
            }

            @if (depositError()) {
              <div class="mb-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{{ depositError() }}</div>
            }

            <div class="flex gap-3">
              <button class="btn-secondary flex-1 justify-center" (click)="showDeposit.set(false)" [disabled]="processing()">Cancel</button>
              <button class="btn-primary flex-1 justify-center" (click)="processDeposit()" [disabled]="processing() || !depositAmt || depositAmt < 10">
                @if (processing()) {
                  <span class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                }
                Pay ₹{{ (depositAmt || 0).toLocaleString('en-IN') }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- ── WITHDRAW MODAL ── -->
      @if (showWithdraw()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div class="glass-card p-6 w-full max-w-md shadow-xl">
            <div class="flex items-center justify-between mb-5">
              <h3 class="text-slate-800 font-bold text-lg">Withdraw Funds</h3>
              <button class="text-slate-400 hover:text-slate-600 text-xl" (click)="showWithdraw.set(false)">✕</button>
            </div>

            <div class="p-3 rounded-lg bg-slate-50 border border-slate-200 mb-4 flex justify-between">
              <span class="text-muted text-sm">Available to withdraw</span>
              <span class="text-slate-800 font-bold">₹{{ withdrawable().toLocaleString('en-IN') }}</span>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-slate-600 mb-2">Withdrawal Method</label>
              <div class="flex gap-2">
                <button class="flex-1 py-2 rounded-lg border text-sm font-medium transition-all"
                  [class]="withdrawMethod === 'upi' ? 'border-red-500 bg-red-50 text-red-600' : 'border-slate-200 text-slate-600'"
                  (click)="withdrawMethod = 'upi'">📱 UPI</button>
                <button class="flex-1 py-2 rounded-lg border text-sm font-medium transition-all"
                  [class]="withdrawMethod === 'bank' ? 'border-red-500 bg-red-50 text-red-600' : 'border-slate-200 text-slate-600'"
                  (click)="withdrawMethod = 'bank'">🏦 Bank Transfer</button>
              </div>
            </div>

            @if (withdrawMethod === 'upi') {
              <div class="mb-4">
                <label class="block text-sm font-medium text-slate-600 mb-2">UPI ID</label>
                <input type="text" class="input-field" placeholder="yourname@upi" [(ngModel)]="withdrawUpi" />
              </div>
            } @else {
              <div class="space-y-3 mb-4">
                <div>
                  <label class="block text-sm font-medium text-slate-600 mb-2">Account Holder Name</label>
                  <input type="text" class="input-field" placeholder="As per bank records" [(ngModel)]="bankHolder" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-600 mb-2">Account Number</label>
                  <input type="text" class="input-field" placeholder="Enter account number" [(ngModel)]="bankAccount" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-600 mb-2">IFSC Code</label>
                  <input type="text" class="input-field" placeholder="e.g. SBIN0001234" [(ngModel)]="bankIfsc" />
                </div>
              </div>
            }

            <div class="mb-4">
              <label class="block text-sm font-medium text-slate-600 mb-2">Amount (Min ₹100)</label>
              <input type="number" class="input-field" placeholder="Enter amount" [(ngModel)]="withdrawAmt" [max]="withdrawable()" min="100" />
            </div>

            <div class="p-3 rounded-lg bg-yellow-50 border border-yellow-200 mb-4">
              <p class="text-yellow-700 text-xs">⚠️ Withdrawals processed in 24-48 hours. Min ₹100. TDS applicable on winnings above ₹10,000.</p>
            </div>

            @if (withdrawError()) {
              <div class="mb-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{{ withdrawError() }}</div>
            }

            <div class="flex gap-3">
              <button class="btn-secondary flex-1 justify-center" (click)="showWithdraw.set(false)" [disabled]="processing()">Cancel</button>
              <button class="btn-primary flex-1 justify-center" (click)="processWithdraw()" [disabled]="processing() || !withdrawAmt || withdrawAmt < 100">
                @if (processing()) {
                  <span class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                }
                Withdraw ₹{{ (withdrawAmt || 0).toLocaleString('en-IN') }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- ── SUCCESS TOAST ── -->
      @if (successMsg()) {
        <div class="fixed bottom-6 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 fade-in">
          <span class="text-lg">✓</span>
          <span class="font-medium text-sm">{{ successMsg() }}</span>
        </div>
      }
    </div>
  `
})
export class WalletComponent implements OnInit {
  Math = Math;

  showDeposit = signal(false);
  showWithdraw = signal(false);
  processing = signal(false);
  depositError = signal('');
  withdrawError = signal('');
  successMsg = signal('');

  depositAmt: number | null = null;
  depositMethod = 'upi';
  upiId = '';

  withdrawAmt: number | null = null;
  withdrawMethod: 'upi' | 'bank' = 'upi';
  withdrawUpi = '';
  bankHolder = '';
  bankAccount = '';
  bankIfsc = '';

  txFilter = '';

  user = this.auth.currentUser;

  quickAmounts = [100, 200, 500, 1000, 2000, 5000];

  paymentMethods = [
    { id: 'upi', name: 'UPI', icon: '📱', desc: 'Google Pay, PhonePe, Paytm' },
    { id: 'card', name: 'Debit / Credit Card', icon: '💳', desc: 'Visa, Mastercard, Rupay' },
    { id: 'netbanking', name: 'Net Banking', icon: '🏦', desc: 'All major banks' },
  ];

  userTransactions = computed(() => {
    const userId = this.user()?.id;
    return this.state.transactions().filter(tx => !tx.userId || tx.userId === userId);
  });

  filteredTx = computed(() => {
    const txs = this.userTransactions();
    if (!this.txFilter) return txs;
    return txs.filter(t => t.type === this.txFilter);
  });

  totalDeposited = computed(() =>
    this.userTransactions().filter(t => t.type === 'deposit' && t.status === 'success').reduce((s, t) => s + t.amount, 0)
  );
  totalWithdrawn = computed(() =>
    Math.abs(this.userTransactions().filter(t => t.type === 'withdrawal' && t.status === 'success').reduce((s, t) => s + t.amount, 0))
  );
  totalPrize = computed(() =>
    this.userTransactions().filter(t => t.type === 'prize' && t.status === 'success').reduce((s, t) => s + t.amount, 0)
  );
  totalFees = computed(() =>
    Math.abs(this.userTransactions().filter(t => t.type === 'entry_fee').reduce((s, t) => s + t.amount, 0))
  );
  pendingWithdrawals = computed(() =>
    Math.abs(this.userTransactions().filter(t => t.type === 'withdrawal' && t.status === 'pending').reduce((s, t) => s + t.amount, 0))
  );
  withdrawable = computed(() => Math.max(0, (this.user()?.walletBalance ?? 0) - this.pendingWithdrawals()));

  constructor(private auth: AuthService, private state: StateService, private api: ApiService) {}

  ngOnInit() {}

  openDeposit() { this.depositError.set(''); this.showDeposit.set(true); }
  openWithdraw() { this.withdrawError.set(''); this.showWithdraw.set(true); }

  async processDeposit() {
    if (!this.depositAmt || this.depositAmt < 10) { this.depositError.set('Minimum deposit is ₹10'); return; }
    if (this.depositMethod === 'upi' && !this.upiId.includes('@')) { this.depositError.set('Enter a valid UPI ID'); return; }

    this.processing.set(true);
    this.depositError.set('');

    const req: PaymentRequest = { amount: this.depositAmt, method: this.depositMethod as any, upiId: this.upiId };

    try {
      const res = await this.api.initiateDeposit(req);
      this.auth.updateWallet(this.depositAmt);
      this.state.addTransaction({
        userId: this.user()?.id,
        type: 'deposit',
        amount: this.depositAmt,
        description: `Wallet deposit via ${this.depositMethod.toUpperCase()}`,
        status: 'success',
        reference: String(res.id),
        paymentMethod: this.depositMethod
      });
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
    const balance = this.withdrawable();
    if (!this.withdrawAmt || this.withdrawAmt < 100) { this.withdrawError.set('Minimum withdrawal is ₹100'); return; }
    if (this.withdrawAmt > balance) { this.withdrawError.set('Insufficient balance'); return; }
    if (this.withdrawMethod === 'upi' && !this.withdrawUpi.includes('@')) { this.withdrawError.set('Enter a valid UPI ID'); return; }
    if (this.withdrawMethod === 'bank' && (!this.bankAccount || !this.bankIfsc || !this.bankHolder)) {
      this.withdrawError.set('Please fill all bank details'); return;
    }

    this.processing.set(true);
    this.withdrawError.set('');

    const req: WithdrawalRequest = {
      amount: this.withdrawAmt,
      method: this.withdrawMethod,
      upiId: this.withdrawUpi,
      accountNumber: this.bankAccount,
      ifscCode: this.bankIfsc,
      accountHolder: this.bankHolder
    };

    try {
      const res = await this.api.initiateWithdrawal(req);
      this.state.addTransaction({
        userId: this.user()?.id,
        type: 'withdrawal',
        amount: -this.withdrawAmt,
        description: `Withdrawal via ${this.withdrawMethod === 'upi' ? 'UPI' : 'Bank Transfer'}`,
        status: 'pending',
        reference: String(res.id)
      });
      this.state.addNotification({ type: 'withdrawal', title: 'Withdrawal Requested', message: `₹${this.withdrawAmt.toLocaleString('en-IN')} withdrawal requested. Admin will pay and debit wallet after approval.` });
      this.showWithdraw.set(false);
      this.withdrawAmt = null;
      this.withdrawUpi = '';
      this.bankAccount = '';
      this.bankIfsc = '';
      this.bankHolder = '';
      this.showSuccess(`Withdrawal of ₹${req.amount.toLocaleString('en-IN')} submitted for admin payout!`);
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
    const m: Record<string, string> = { deposit: 'bg-blue-50', withdrawal: 'bg-orange-50', prize: 'bg-green-50', entry_fee: 'bg-red-50', refund: 'bg-purple-50', bonus: 'bg-yellow-50' };
    return m[type] || 'bg-slate-100';
  }

  getTxIcon(type: string): string {
    const m: Record<string, string> = { deposit: '↓', withdrawal: '↑', prize: '🏆', entry_fee: '🎯', refund: '↩', bonus: '🎁' };
    return m[type] || '💰';
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
