import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../shared/services/auth.service';
import { DataService } from '../shared/services/data.service';
import { Transaction } from '../shared/models/models';

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
        <div class="relative">
          <p class="text-muted text-sm mb-1">Available Balance</p>
          <div class="text-4xl font-bold text-slate-800 mb-1">₹{{ user()?.walletBalance?.toLocaleString('en-IN') }}</div>
          <p class="text-muted text-sm">Last updated just now</p>
          <div class="flex flex-wrap gap-3 mt-5">
            <button class="btn-primary" (click)="showDepositModal.set(true)">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Add Money
            </button>
            <button class="btn-secondary" (click)="showWithdrawModal.set(true)">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
              </svg>
              Withdraw
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="stat-card">
          <div class="text-muted text-xs mb-2">Total Deposited</div>
          <div class="text-xl font-bold text-slate-800">₹1,500</div>
        </div>
        <div class="stat-card">
          <div class="text-muted text-xs mb-2">Total Withdrawn</div>
          <div class="text-xl font-bold text-slate-800">₹3,000</div>
        </div>
        <div class="stat-card">
          <div class="text-muted text-xs mb-2">Prize Earnings</div>
          <div class="text-xl font-bold text-green-600">₹8,550</div>
        </div>
        <div class="stat-card">
          <div class="text-muted text-xs mb-2">Entry Fees Paid</div>
          <div class="text-xl font-bold text-red-500">₹300</div>
        </div>
      </div>

      <!-- Transaction History -->
      <div class="glass-card overflow-hidden">
        <div class="p-5 border-b border-slate-200 flex items-center justify-between">
          <h3 class="text-slate-800 font-bold">Transaction History</h3>
          <span class="text-muted text-sm">{{ transactions.length }} transactions</span>
        </div>

        <div class="divide-y divide-slate-100">
          @for (tx of transactions; track tx.id) {
            <div class="px-5 py-4 flex items-center gap-4 table-row">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                [class]="getTxIconClass(tx.type)">
                {{ getTxIcon(tx.type) }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-slate-800 font-medium text-sm truncate">{{ tx.description }}</div>
                <div class="text-muted text-xs mt-0.5">{{ formatDate(tx.date) }}</div>
              </div>
              <div class="text-right flex-shrink-0">
                <div class="font-bold text-sm" [class]="tx.amount > 0 ? 'text-green-600' : 'text-red-500'">
                  {{ tx.amount > 0 ? '+' : '' }}₹{{ Math.abs(tx.amount).toLocaleString('en-IN') }}
                </div>
                <div class="text-xs mt-0.5"
                  [class]="tx.status === 'success' ? 'text-green-600' : tx.status === 'pending' ? 'text-yellow-600' : 'text-red-500'">
                  {{ tx.status }}
                </div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Deposit Modal -->
      @if (showDepositModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div class="glass-card p-6 w-full max-w-md">
            <h3 class="text-slate-800 font-bold text-lg mb-4">Add Money to Wallet</h3>

            <div class="grid grid-cols-3 gap-2 mb-4">
              @for (amount of quickAmounts; track amount) {
                <button class="btn-secondary py-2 text-sm justify-center" (click)="depositAmount = amount">
                  ₹{{ amount }}
                </button>
              }
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-slate-600 mb-2">Custom Amount</label>
              <input type="number" class="input-field" placeholder="Enter amount" [(ngModel)]="depositAmount" />
            </div>

            <div class="mb-5">
              <label class="block text-sm font-medium text-slate-600 mb-3">Payment Method</label>
              <div class="space-y-2">
                @for (method of paymentMethods; track method.id) {
                  <label class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer"
                    [class]="selectedMethod === method.id ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-slate-300'">
                    <input type="radio" name="payMethod" [value]="method.id" [(ngModel)]="selectedMethod" class="hidden"/>
                    <div class="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-base">{{ method.icon }}</div>
                    <div>
                      <div class="text-slate-800 text-sm font-medium">{{ method.name }}</div>
                      <div class="text-muted text-xs">{{ method.desc }}</div>
                    </div>
                    @if (selectedMethod === method.id) {
                      <span class="ml-auto text-red-500">✓</span>
                    }
                  </label>
                }
              </div>
            </div>

            <div class="flex gap-3">
              <button class="btn-secondary flex-1 justify-center" (click)="showDepositModal.set(false)">Cancel</button>
              <button class="btn-primary flex-1 justify-center" (click)="processDeposit()">
                Pay ₹{{ depositAmount || 0 }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Withdraw Modal -->
      @if (showWithdrawModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div class="glass-card p-6 w-full max-w-md">
            <h3 class="text-slate-800 font-bold text-lg mb-4">Withdraw Funds</h3>
            <p class="text-muted text-sm mb-4">Available: ₹{{ user()?.walletBalance?.toLocaleString('en-IN') }}</p>

            <div class="mb-4">
              <label class="block text-sm font-medium text-slate-600 mb-2">Withdrawal Amount</label>
              <input type="number" class="input-field" placeholder="Enter amount" [(ngModel)]="withdrawAmount" />
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-slate-600 mb-2">Bank Account / UPI</label>
              <input type="text" class="input-field" placeholder="Enter UPI ID or account number" [(ngModel)]="withdrawAccount" />
            </div>

            <div class="p-3 rounded-lg bg-yellow-50 border border-yellow-200 mb-5">
              <p class="text-yellow-700 text-xs">⚠️ Withdrawals are processed within 24-48 hours. Minimum withdrawal is ₹100.</p>
            </div>

            <div class="flex gap-3">
              <button class="btn-secondary flex-1 justify-center" (click)="showWithdrawModal.set(false)">Cancel</button>
              <button class="btn-primary flex-1 justify-center" (click)="processWithdraw()">
                Withdraw ₹{{ withdrawAmount || 0 }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class WalletComponent implements OnInit {
  transactions: Transaction[] = [];
  showDepositModal = signal(false);
  showWithdrawModal = signal(false);
  depositAmount: number | null = null;
  withdrawAmount: number | null = null;
  withdrawAccount = '';
  selectedMethod = 'upi';
  Math = Math;

  user = this.auth.currentUser;
  quickAmounts = [100, 200, 500, 1000, 2000, 5000];
  paymentMethods = [
    { id: 'upi', name: 'UPI', icon: '📱', desc: 'Google Pay, PhonePe, Paytm' },
    { id: 'card', name: 'Debit / Credit Card', icon: '💳', desc: 'Visa, Mastercard, Rupay' },
    { id: 'netbanking', name: 'Net Banking', icon: '🏦', desc: 'All major banks supported' }
  ];

  constructor(private auth: AuthService, private data: DataService) {}

  ngOnInit() { this.transactions = this.data.getTransactions(); }

  processDeposit() {
    if (!this.depositAmount || this.depositAmount < 10) return;
    this.auth.updateWallet(this.depositAmount);
    this.showDepositModal.set(false);
    this.depositAmount = null;
  }

  processWithdraw() {
    if (!this.withdrawAmount || this.withdrawAmount < 100) return;
    const balance = this.user()?.walletBalance || 0;
    if (this.withdrawAmount > balance) return;
    this.auth.updateWallet(-this.withdrawAmount);
    this.showWithdrawModal.set(false);
    this.withdrawAmount = null;
    this.withdrawAccount = '';
  }

  getTxIconClass(type: string): string {
    const classes: Record<string, string> = {
      deposit: 'bg-blue-50 text-blue-600',
      withdrawal: 'bg-orange-50 text-orange-600',
      prize: 'bg-green-50 text-green-600',
      entry_fee: 'bg-red-50 text-red-500'
    };
    return classes[type] || 'bg-slate-100';
  }

  getTxIcon(type: string): string {
    const icons: Record<string, string> = { deposit: '↓', withdrawal: '↑', prize: '🏆', entry_fee: '🎯' };
    return icons[type] || '💰';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
