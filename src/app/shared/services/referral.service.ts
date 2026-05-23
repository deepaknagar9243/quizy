import { Injectable } from '@angular/core';
import { ReferralCodeEntry, ReferralRecord } from '../models/models';

const RECORD_KEY = 'qa_referrals';
const MAP_KEY = 'qa_referral_map';

@Injectable({ providedIn: 'root' })
export class ReferralService {

  private loadRecords(): ReferralRecord[] {
    try { return JSON.parse(localStorage.getItem(RECORD_KEY) || '[]'); } catch { return []; }
  }

  private saveRecords(records: ReferralRecord[]) {
    localStorage.setItem(RECORD_KEY, JSON.stringify(records));
  }

  private loadMap(): Record<string, string | ReferralCodeEntry> {
    try { return JSON.parse(localStorage.getItem(MAP_KEY) || '{}'); } catch { return {}; }
  }

  private saveMap(map: Record<string, ReferralCodeEntry>) {
    localStorage.setItem(MAP_KEY, JSON.stringify(map));
  }

  generateCode(userId: string, name: string): string {
    const base = name.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 4) || 'QUIZ';
    const suffix = userId.slice(-4).toUpperCase();
    return `${base}${suffix}`;
  }

  registerCode(code: string, userId: string, validityHours = 72) {
    const now = Date.now();
    const normalized = code.toUpperCase();
    const map = this.normalizeMap();
    map[normalized] = {
      userId,
      code: normalized,
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + validityHours * 60 * 60 * 1000).toISOString()
    };
    this.saveMap(map);
  }

  validateCode(code: string, currentUserId?: string): { valid: boolean; reason?: string; entry?: ReferralCodeEntry } {
    const normalized = code.trim().toUpperCase();
    if (!normalized) return { valid: false, reason: 'Enter a referral code' };

    const entry = this.normalizeMap()[normalized];
    if (!entry) return { valid: false, reason: 'Invalid referral code' };
    if (entry.userId === currentUserId) return { valid: false, reason: 'You cannot use your own referral code' };
    if (new Date(entry.expiresAt).getTime() < Date.now()) return { valid: false, reason: 'Referral code has expired' };

    return { valid: true, entry };
  }

  findReferrerId(code: string): string | null {
    const result = this.validateCode(code);
    return result.valid ? result.entry!.userId : null;
  }

  getCodeEntry(code: string): ReferralCodeEntry | null {
    return this.normalizeMap()[code.toUpperCase()] || null;
  }

  extendCode(code: string, validityHours: number) {
    const normalized = code.toUpperCase();
    const map = this.normalizeMap();
    const entry = map[normalized];
    if (!entry) return;
    entry.expiresAt = new Date(Date.now() + validityHours * 60 * 60 * 1000).toISOString();
    this.saveMap(map);
  }

  addRecord(record: ReferralRecord) {
    const records = this.loadRecords();
    records.unshift(record);
    this.saveRecords(records);
  }

  getAll(): ReferralRecord[] { return this.loadRecords(); }

  getReferralsByUser(userId: string): ReferralRecord[] {
    return this.loadRecords().filter(r => r.referrerId === userId);
  }

  hasBeenReferred(userId: string): boolean {
    return this.loadRecords().some(r => r.referredId === userId);
  }

  private normalizeMap(): Record<string, ReferralCodeEntry> {
    const raw = this.loadMap();
    const normalized: Record<string, ReferralCodeEntry> = {};

    for (const [code, value] of Object.entries(raw)) {
      const key = code.toUpperCase();
      if (typeof value === 'string') {
        normalized[key] = {
          userId: value,
          code: key,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
        };
      } else {
        normalized[key] = {
          ...value,
          code: key,
          createdAt: value.createdAt || new Date().toISOString(),
          expiresAt: value.expiresAt || new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
        };
      }
    }

    this.saveMap(normalized);
    return normalized;
  }
}
