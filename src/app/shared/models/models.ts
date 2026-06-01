// ─── Core User ───────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  avatar: string;
  walletBalance: number;
  bonusBalance: number;
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
  hasJoined?: boolean;
  description?: string;
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
  questionOrder?: number;
  totalQuestions?: number;
  explanation?: string;
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

// ─── Live Player ──────────────────────────────────────────────────────────────
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
  isBonus?: boolean;
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
  registrationBonus: number;
  referralBonus: number;
  referralJoinBonus: number;
  referralCodeValidityHours: number;
  minWithdrawal: number;
  maxWithdrawal: number;
  bonusWithdrawable: boolean;
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

// ─── API Response Wrappers (matches Spring Boot backend) ─────────────────────
export interface ApiSuccess<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PagedData<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Backend Auth DTOs (exact match with Spring Boot) ────────────────────────
export interface LoginRequest {
  email: string;       // backend uses 'email' field
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  mobile: string;
  password: string;
  referralCode?: string;
}

// Backend AuthData response shape
export interface BackendAuthData {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
  user: BackendUserProfile;
}

export interface BackendUserProfile {
  id: number;
  name: string;
  email: string;
  mobile: string;
  role: string;
  walletBalance: number;
  totalWins: number;
  totalQuizzes: number;
  isActive: boolean;
  createdAt: string;
}

// Backend Quiz shape (uses numbers for IDs, BigDecimal as number)
export interface BackendQuiz {
  id: number;
  title: string;
  description?: string;
  category: string;
  entryFee: number;
  prizePool: number;
  startTime: string;
  endTime?: string;
  status: string;
  maxParticipants: number;
  totalParticipants: number;
  durationMinutes: number;
  timePerQuestion: number;
  totalQuestions: number;
  hasJoined?: boolean;
}

// Backend Question shape (live quiz — no correctAnswer)
export interface BackendQuestionDto {
  id: number;
  text: string;
  options: string[];
  timeLimit: number;
  points: number;
  questionOrder: number;
  totalQuestions: number;
}

// Backend Question shape (admin — has correctAnswer)
export interface BackendQuestionAdminDto {
  id: number;
  quizId: number;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  timeLimit: number;
  points: number;
  questionOrder: number;
  explanation?: string;
  createdAt: string;
}

// Backend Answer Result
export interface BackendAnswerResult {
  questionId: number;
  isCorrect: boolean;
  correctAnswerIndex: number;
  pointsEarned: number;
  totalScore: number;
  explanation?: string;
}

// Backend Wallet Summary
export interface BackendWalletSummary {
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalEarned: number;
  totalSpent: number;
}

// Backend Transaction
export interface BackendTransaction {
  id: number;
  type: string;
  amount: number;
  description: string;
  status: string;
  paymentMethod?: string;
  balanceBefore?: number;
  balanceAfter?: number;
  createdAt: string;
}

// Backend Leaderboard Entry
export interface BackendLeaderboardEntry {
  rank: number;
  userId: number;
  name: string;
  score: number;
  correctAnswers: number;
  prizeWon: number;
}

// Backend Admin Stats
export interface BackendAdminStats {
  totalUsers: number;
  totalQuizzes: number;
  activeQuizzes: number;
  totalParticipations: number;
  totalRevenue: number;
  todaySignups: number;
  todayRevenue: number;
}

// Backend Participation
export interface BackendParticipation {
  id: number;
  quizId: number;
  quizTitle: string;
  score: number;
  correctAnswers: number;
  totalAnswered: number;
  finalRank?: number;
  prizeWon: number;
  status: string;
  joinedAt: string;
  completedAt?: string;
}
