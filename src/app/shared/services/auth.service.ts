import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly KEY = 'qa_user';

  currentUser = signal<User | null>(this.loadUser());

  constructor(private router: Router) {}

  private loadUser(): User | null {
    try {
      const s = localStorage.getItem(this.KEY);
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  }

  private persist(user: User) {
    localStorage.setItem(this.KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  login(email: string, _password: string): boolean {
    const isAdmin = email === 'admin@quiz.com';
    const user: User = {
      id: isAdmin ? 'admin_user' : 'current_user_' + email.split('@')[0],
      name: isAdmin ? 'Admin User' : 'Rahul Kumar',
      email,
      mobile: '9876543210',
      avatar: isAdmin ? 'AD' : 'RK',
      walletBalance: isAdmin ? 0 : 3750,
      totalWins: isAdmin ? 0 : 8,
      totalQuizzes: isAdmin ? 0 : 24,
      totalEarnings: isAdmin ? 0 : 8550,
      rank: isAdmin ? 0 : 47,
      isAdmin,
      kycVerified: true,
      createdAt: new Date().toISOString()
    };
    this.persist(user);
    return true;
  }

  register(name: string, email: string, mobile: string, _password: string): boolean {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const user: User = {
      id: 'user_' + Date.now(),
      name, email, mobile,
      avatar: initials,
      walletBalance: 0,
      totalWins: 0,
      totalQuizzes: 0,
      totalEarnings: 0,
      rank: 9999,
      isAdmin: false,
      kycVerified: false,
      createdAt: new Date().toISOString()
    };
    this.persist(user);
    return true;
  }

  logout(): void {
    localStorage.removeItem(this.KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean { return this.currentUser() !== null; }
  isAdmin(): boolean { return this.currentUser()?.isAdmin === true; }

  updateWallet(amount: number): void {
    const user = this.currentUser();
    if (!user) return;
    const updated = { ...user, walletBalance: Math.max(0, user.walletBalance + amount) };
    this.persist(updated);
  }

  updateStats(wins: number, quizzes: number, earnings: number, rank: number): void {
    const user = this.currentUser();
    if (!user) return;
    const updated = {
      ...user,
      totalWins: user.totalWins + wins,
      totalQuizzes: user.totalQuizzes + quizzes,
      totalEarnings: user.totalEarnings + earnings,
      rank
    };
    this.persist(updated);
  }
}
