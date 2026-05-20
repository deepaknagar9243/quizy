import { Injectable, signal, computed } from '@angular/core';
import { Transaction, LeaderboardEntry, Winner, AppNotification, QuizResult } from '../models/models';

const STORAGE_KEYS = {
  TRANSACTIONS: 'qa_transactions',
  LEADERBOARD: 'qa_leaderboard',
  WINNERS: 'qa_winners',
  NOTIFICATIONS: 'qa_notifications',
  QUIZ_RESULTS: 'qa_quiz_results',
};

@Injectable({ providedIn: 'root' })
export class StateService {

  // ─── Reactive State ──────────────────────────────────────────────────────────
  transactions = signal<Transaction[]>(this.load(STORAGE_KEYS.TRANSACTIONS, this.defaultTransactions()));
  leaderboard = signal<LeaderboardEntry[]>(this.load(STORAGE_KEYS.LEADERBOARD, this.defaultLeaderboard()));
  recentWinners = signal<Winner[]>(this.load(STORAGE_KEYS.WINNERS, this.defaultWinners()));
  notifications = signal<AppNotification[]>(this.load(STORAGE_KEYS.NOTIFICATIONS, []));
  quizResults = signal<QuizResult[]>(this.load(STORAGE_KEYS.QUIZ_RESULTS, []));

  unreadCount = computed(() => this.notifications().filter(n => !n.read).length);

  // ─── Storage helpers ─────────────────────────────────────────────────────────
  private load<T>(key: string, fallback: T): T {
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : fallback;
    } catch { return fallback; }
  }

  private save(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // ─── Transactions ─────────────────────────────────────────────────────────────
  addTransaction(tx: Omit<Transaction, 'id' | 'date'>) {
    const newTx: Transaction = {
      ...tx,
      id: 'tx_' + Date.now(),
      date: new Date().toISOString()
    };
    const updated = [newTx, ...this.transactions()];
    this.transactions.set(updated);
    this.save(STORAGE_KEYS.TRANSACTIONS, updated);
    return newTx;
  }

  // ─── Leaderboard ─────────────────────────────────────────────────────────────
  updateUserInLeaderboard(userId: string, name: string, avatar: string, scoreToAdd: number, prizeWon: number, isWin: boolean) {
    let board = [...this.leaderboard()];
    const idx = board.findIndex(e => e.userId === userId);

    if (idx >= 0) {
      board[idx] = {
        ...board[idx],
        score: board[idx].score + scoreToAdd,
        totalEarnings: board[idx].totalEarnings + prizeWon,
        quizWins: board[idx].quizWins + (isWin ? 1 : 0)
      };
    } else {
      board.push({
        rank: 0,
        userId,
        name,
        avatar,
        score: scoreToAdd,
        quizWins: isWin ? 1 : 0,
        totalEarnings: prizeWon
      });
    }

    // Re-rank
    board = board
      .sort((a, b) => b.score - a.score)
      .map((e, i) => ({ ...e, rank: i + 1 }));

    this.leaderboard.set(board);
    this.save(STORAGE_KEYS.LEADERBOARD, board);
  }

  getUserRank(userId: string): number {
    return this.leaderboard().find(e => e.userId === userId)?.rank ?? 999;
  }

  // ─── Winners ─────────────────────────────────────────────────────────────────
  addWinner(winner: Winner) {
    const updated = [winner, ...this.recentWinners()].slice(0, 20);
    this.recentWinners.set(updated);
    this.save(STORAGE_KEYS.WINNERS, updated);
  }

  // ─── Quiz Results ─────────────────────────────────────────────────────────────
  saveQuizResult(result: QuizResult) {
    const updated = [result, ...this.quizResults()];
    this.quizResults.set(updated);
    this.save(STORAGE_KEYS.QUIZ_RESULTS, updated);
  }

  getUserQuizResults(userId: string): QuizResult[] {
    return this.quizResults().filter(r => r.userId === userId);
  }

  // ─── Notifications ────────────────────────────────────────────────────────────
  addNotification(n: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) {
    const notif: AppNotification = {
      ...n,
      id: 'n_' + Date.now(),
      read: false,
      createdAt: new Date().toISOString()
    };
    const updated = [notif, ...this.notifications()].slice(0, 50);
    this.notifications.set(updated);
    this.save(STORAGE_KEYS.NOTIFICATIONS, updated);
  }

  markAllRead() {
    const updated = this.notifications().map(n => ({ ...n, read: true }));
    this.notifications.set(updated);
    this.save(STORAGE_KEYS.NOTIFICATIONS, updated);
  }

  // ─── Prize Distribution Calculator ───────────────────────────────────────────
  calculatePrize(prizePool: number, rank: number): number {
    const dist: Record<number, number> = { 1: 0.50, 2: 0.30, 3: 0.20 };
    return Math.floor((dist[rank] || 0) * prizePool);
  }

  getPrizeDistribution(prizePool: number) {
    return [
      { rank: 1, label: '🥇 1st Place', amount: Math.floor(prizePool * 0.50), percentage: 50 },
      { rank: 2, label: '🥈 2nd Place', amount: Math.floor(prizePool * 0.30), percentage: 30 },
      { rank: 3, label: '🥉 3rd Place', amount: Math.floor(prizePool * 0.20), percentage: 20 },
    ];
  }

  // ─── Default Data ─────────────────────────────────────────────────────────────
  private defaultTransactions(): Transaction[] {
    return [
      { id: 't1', type: 'prize', amount: 3500, description: 'Prize won - GK Blitz Quiz', date: '2024-12-19T10:00:00', status: 'success', reference: 'TXN001' },
      { id: 't2', type: 'entry_fee', amount: -50, description: 'Entry fee - GK Blitz Quiz', date: '2024-12-19T09:00:00', status: 'success' },
      { id: 't3', type: 'deposit', amount: 500, description: 'Wallet deposit via UPI', date: '2024-12-18T15:00:00', status: 'success', reference: 'TXN002', paymentMethod: 'upi' },
      { id: 't4', type: 'entry_fee', amount: -100, description: 'Entry fee - Science Quiz', date: '2024-12-18T11:00:00', status: 'success' },
      { id: 't5', type: 'prize', amount: 1500, description: 'Prize won - Sports Mania', date: '2024-12-17T18:00:00', status: 'success', reference: 'TXN003' },
      { id: 't6', type: 'withdrawal', amount: -2000, description: 'Withdrawal to bank account', date: '2024-12-16T12:00:00', status: 'success', reference: 'WD001' },
      { id: 't7', type: 'deposit', amount: 1000, description: 'Wallet deposit via card', date: '2024-12-15T09:00:00', status: 'success', reference: 'TXN004', paymentMethod: 'card' },
      { id: 't8', type: 'entry_fee', amount: -75, description: 'Entry fee - Bollywood Quiz', date: '2024-12-15T08:00:00', status: 'success' },
      { id: 't9', type: 'prize', amount: 800, description: 'Prize won - History Quiz', date: '2024-12-14T20:00:00', status: 'success', reference: 'TXN005' },
      { id: 't10', type: 'withdrawal', amount: -1000, description: 'Withdrawal to UPI', date: '2024-12-13T14:00:00', status: 'pending', reference: 'WD002' },
    ];
  }

  private defaultLeaderboard(): LeaderboardEntry[] {
    return [
      { rank: 1, userId: 'u1', name: 'Arjun Sharma', avatar: 'AS', score: 12500, quizWins: 23, totalEarnings: 45000 },
      { rank: 2, userId: 'u2', name: 'Priya Patel', avatar: 'PP', score: 11200, quizWins: 19, totalEarnings: 38500 },
      { rank: 3, userId: 'u3', name: 'Rohit Verma', avatar: 'RV', score: 10800, quizWins: 17, totalEarnings: 32000 },
      { rank: 4, userId: 'u4', name: 'Sneha Gupta', avatar: 'SG', score: 9600, quizWins: 14, totalEarnings: 27500 },
      { rank: 5, userId: 'u5', name: 'Karan Mehta', avatar: 'KM', score: 8900, quizWins: 12, totalEarnings: 22000 },
      { rank: 6, userId: 'u6', name: 'Ananya Singh', avatar: 'AN', score: 8200, quizWins: 10, totalEarnings: 18500 },
      { rank: 7, userId: 'u7', name: 'Vikram Joshi', avatar: 'VJ', score: 7800, quizWins: 9, totalEarnings: 15000 },
      { rank: 8, userId: 'u8', name: 'Divya Kumar', avatar: 'DK', score: 7100, quizWins: 8, totalEarnings: 12000 },
      { rank: 9, userId: 'u9', name: 'Raj Nair', avatar: 'RN', score: 6500, quizWins: 7, totalEarnings: 9500 },
      { rank: 10, userId: 'u10', name: 'Meera Iyer', avatar: 'MI', score: 5800, quizWins: 6, totalEarnings: 7000 },
    ];
  }

  private defaultWinners(): Winner[] {
    return [
      { userId: 'u1', name: 'Arjun Sharma', avatar: 'AS', quizTitle: 'GK Blitz', prize: 3500, rank: 1, date: '2024-12-19' },
      { userId: 'u2', name: 'Priya Patel', avatar: 'PP', quizTitle: 'Science Quiz', prize: 2000, rank: 2, date: '2024-12-19' },
      { userId: 'u3', name: 'Rohit Verma', avatar: 'RV', quizTitle: 'Sports Mania', prize: 1500, rank: 1, date: '2024-12-18' },
      { userId: 'u4', name: 'Sneha Gupta', avatar: 'SG', quizTitle: 'Bollywood Quiz', prize: 1000, rank: 1, date: '2024-12-18' },
      { userId: 'u5', name: 'Karan Mehta', avatar: 'KM', quizTitle: 'History Masters', prize: 5000, rank: 1, date: '2024-12-17' },
    ];
  }
}
