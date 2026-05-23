import { Injectable, signal } from '@angular/core';
import { AdminSettings } from '../models/models';

const KEY = 'qa_admin_settings';

const DEFAULT_SETTINGS: AdminSettings = {
  registrationBonus: 50,      // ₹50 on signup — NOT withdrawable
  referralBonus: 25,          // ₹25 to referrer — NOT withdrawable
  referralJoinBonus: 25,      // ₹25 to new user who used referral — NOT withdrawable
  referralCodeValidityHours: 72,
  minWithdrawal: 100,
  maxWithdrawal: 50000,
  bonusWithdrawable: false,
};

@Injectable({ providedIn: 'root' })
export class AdminSettingsService {
  settings = signal<AdminSettings>(this.load());

  private load(): AdminSettings {
    try {
      const s = localStorage.getItem(KEY);
      return s ? { ...DEFAULT_SETTINGS, ...JSON.parse(s) } : DEFAULT_SETTINGS;
    } catch { return DEFAULT_SETTINGS; }
  }

  save(s: AdminSettings) {
    localStorage.setItem(KEY, JSON.stringify(s));
    this.settings.set(s);
  }

  get(): AdminSettings { return this.settings(); }
}
