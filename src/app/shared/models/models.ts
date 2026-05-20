// ─── Core User ───────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  avatar: string;
  walletBalance: number;
  totalWins: number;
  totalQuizzes: number;
  totalEarnings: number;
  rank: number;
  isAdmin?: boolean;
  kycVerified?: boolean;
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

// ─── Live Leaderboard (during quiz) ──────────────────────────────────────────
export interface LivePlayer {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  score: number;
  answeredCount: number;
  isCurrentUser?: boolean;
}

// ─── Transaction ──────────────────────────────────────────────────────────────
export interface Transaction {
  id: string;
  userId?: string;
  type: 'deposit' | 'withdrawal' | 'prize' | 'entry_fee' | 'refund' | 'bonus';
  amount: number;
  description: string;
  date: string;
  status: 'success' | 'pending' | 'failed';
  reference?: string;
  paymentMethod?: string;
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

// ─── Admin ────────────────────────────────────────────────────────────────────
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
  type: 'prize' | 'deposit' | 'withdrawal' | 'quiz' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
