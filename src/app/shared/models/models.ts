export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  avatar: string;
  walletBalance: number;
  totalWins: number;
  totalQuizzes: number;
  rank: number;
  isAdmin?: boolean;
}

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
}

export interface Question {
  id: string;
  quizId: string;
  text: string;
  options: string[];
  correctAnswer: number;
  timeLimit: number;
  points: number;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'prize' | 'entry_fee';
  amount: number;
  description: string;
  date: string;
  status: 'success' | 'pending' | 'failed';
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  score: number;
  quizWins: number;
  totalEarnings: number;
}

export interface Winner {
  userId: string;
  name: string;
  avatar: string;
  quizTitle: string;
  prize: number;
  rank: number;
  date: string;
}

export interface AdminStats {
  totalUsers: number;
  totalQuizzes: number;
  totalRevenue: number;
  activePlayers: number;
  todaySignups: number;
  todayRevenue: number;
}
