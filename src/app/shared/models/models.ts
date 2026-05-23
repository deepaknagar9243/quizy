// ─── Core User ───────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  avatar: string;
  walletBalance: number;       // real money (withdrawable)
  bonusBalance: number;        // bonus/referral (NOT withdrawable)
  totalWins: number;
  totalQuizzes: number;
  totalEarnings: number;
  rank: number;
  isAdmin?: boolean;
  kycVerified?: boolean;
  referralCode?: string;
  referredBy?: string;
  referralCount?: number;
  createdAt?: string;
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────
export interface Quiz {
  id: string;
  title: string;
  category: string;
  entryFee: number;
  prizePool: number;
  startTime: string;
  status: 'upcoming' | 'live' | 'completed';
  totalParticipants: number;
  maxParticipants: number;
  totalQuestions: number;
  duration: number;
  prizeDistribution?: PrizeDistribution[];
}

export interface PrizeDistribution {
  rank: number;
  label: string;
  amount: number;
  percentage: number;
}

// ─── Question ─────────────────────────────────────────────────────────────────
export interface Question {
  id: string;
  quizId: string;
  text: string;
  options: string[];
  correctAnswer: number;
  timeLimit: number;
  points: number;
}

// ─── Quiz Result ──────────────────────────────────────────────────────────────
export interface QuizResult {
  quizId: string;
  quizTitle: string;
  userId: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  rank: number;
  totalParticipants: number;
  prize: number;
  timeTaken: number;
  completedAt: string;
}

// ─── Live Player (during quiz) ────────────────────────────────────────────────
export interface LivePlayer {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  score: number;
  correctCount: number;
  answeredCount: number;
  totalTimeMs: number;
  isCurrentUser?: boolean;
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  score: number;
  quizWins: number;
  totalEarnings: number;
}

// ─── Transaction ──────────────────────────────────────────────────────────────
export interface Transaction {
  id: string;
  userId?: string;
  type: 'deposit' | 'withdrawal' | 'prize' | 'entry_fee' | 'refund' | 'bonus' | 'referral';
  amount: number;
  description: string;
  date: string;
  status: 'success' | 'pending' | 'failed';
  reference?: string;
  paymentMethod?: string;
  isBonus?: boolean;           // bonus = not withdrawable
}

// ─── Payment ──────────────────────────────────────────────────────────────────
export interface PaymentRequest {
  amount: number;
  method: 'upi' | 'card' | 'netbanking' | 'wallet';
  upiId?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  cardHolder?: string;
  bankCode?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  message: string;
  amount?: number;
}

// ─── Withdrawal ───────────────────────────────────────────────────────────────
export interface WithdrawalRequest {
  amount: number;
  method: 'upi' | 'bank';
  upiId?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolder?: string;
}

export interface WithdrawalResponse {
  success: boolean;
  referenceId: string;
  message: string;
  estimatedTime: string;
}

// ─── Winner ───────────────────────────────────────────────────────────────────
export interface Winner {
  userId: string;
  name: string;
  avatar: string;
  quizTitle: string;
  prize: number;
  rank: number;
  date: string;
}

// ─── Admin Settings ───────────────────────────────────────────────────────────
export interface AdminSettings {
  registrationBonus: number;       // e.g. 50 — given on signup (bonus, not withdrawable)
  referralBonus: number;           // e.g. 25 — given to referrer per successful referral
  referralJoinBonus: number;       // e.g. 25 — given to new user who joined via referral
  referralCodeValidityHours: number;
  minWithdrawal: number;           // e.g. 100
  maxWithdrawal: number;           // e.g. 50000
  bonusWithdrawable: boolean;      // always false — bonus can't be withdrawn
}

// ─── Referral ─────────────────────────────────────────────────────────────────
export interface ReferralCodeEntry {
  userId: string;
  code: string;
  createdAt: string;
  expiresAt: string;
}

export interface ReferralRecord {
  referrerId: string;
  referrerName: string;
  referredId: string;
  referredName: string;
  bonusPaid: number;
  joinBonusPaid?: number;
  code?: string;
  date: string;
}

// ─── Admin Stats ──────────────────────────────────────────────────────────────
export interface AdminStats {
  totalUsers: number;
  totalQuizzes: number;
  totalRevenue: number;
  activePlayers: number;
  todaySignups: number;
  todayRevenue: number;
  totalWithdrawals: number;
  pendingWithdrawals: number;
}

// ─── Notification ─────────────────────────────────────────────────────────────
export interface AppNotification {
  id: string;
  type: 'prize' | 'deposit' | 'withdrawal' | 'quiz' | 'system' | 'referral' | 'bonus';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
