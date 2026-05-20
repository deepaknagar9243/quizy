import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'quiz_user';
  
  currentUser = signal<User | null>(this.loadUser());

  constructor(private router: Router) {}

  private loadUser(): User | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  login(email: string, password: string): boolean {
    // Dummy login - accept any credentials
    const user: User = {
      id: 'current_user',
      name: 'Rahul Kumar',
      email: email,
      mobile: '9876543210',
      avatar: 'RK',
      walletBalance: 3750,
      totalWins: 8,
      totalQuizzes: 24,
      rank: 47,
      isAdmin: email === 'admin@quiz.com'
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    this.currentUser.set(user);
    return true;
  }

  register(name: string, email: string, mobile: string, password: string): boolean {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const user: User = {
      id: 'current_user',
      name,
      email,
      mobile,
      avatar: initials,
      walletBalance: 0,
      totalWins: 0,
      totalQuizzes: 0,
      rank: 9999,
      isAdmin: false
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    this.currentUser.set(user);
    return true;
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  isAdmin(): boolean {
    return this.currentUser()?.isAdmin === true;
  }

  updateWallet(amount: number): void {
    const user = this.currentUser();
    if (user) {
      const updated = { ...user, walletBalance: user.walletBalance + amount };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
      this.currentUser.set(updated);
    }
  }
}
