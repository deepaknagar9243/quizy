/**
 * ApiService — All backend calls go through here.
 * To connect real backend: replace mock methods with HttpClient calls.
 * Example: return this.http.post<PaymentResponse>('/api/payments/deposit', req);
 */
import { Injectable } from '@angular/core';
import { PaymentRequest, PaymentResponse, WithdrawalRequest, WithdrawalResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {

  // ─── BASE URL (change when backend is ready) ────────────────────────────────
  // private baseUrl = 'https://api.quizarena.in/v1';

  // ─── Payment / Deposit ───────────────────────────────────────────────────────
  initiateDeposit(req: PaymentRequest): Promise<PaymentResponse> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate 95% success rate
        if (Math.random() > 0.05) {
          resolve({
            success: true,
            transactionId: 'TXN' + Date.now(),
            message: 'Payment successful',
            amount: req.amount
          });
        } else {
          reject({ success: false, message: 'Payment failed. Please try again.' });
        }
      }, 1500);
    });
  }

  // ─── Withdrawal ──────────────────────────────────────────────────────────────
  initiateWithdrawal(req: WithdrawalRequest): Promise<WithdrawalResponse> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (req.amount < 100) {
          reject({ success: false, message: 'Minimum withdrawal is ₹100' });
          return;
        }
        resolve({
          success: true,
          referenceId: 'WD' + Date.now(),
          message: 'Withdrawal request submitted',
          estimatedTime: '24-48 hours'
        });
      }, 1200);
    });
  }

  // ─── Razorpay Integration (ready to plug in) ─────────────────────────────────
  // When backend is ready, call your server to create Razorpay order, then open SDK:
  // openRazorpay(orderId: string, amount: number, user: User): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     const options = {
  //       key: 'rzp_live_XXXX',
  //       amount: amount * 100,
  //       currency: 'INR',
  //       order_id: orderId,
  //       prefill: { name: user.name, email: user.email, contact: user.mobile },
  //       handler: (response: any) => resolve(response),
  //       modal: { ondismiss: () => reject('dismissed') }
  //     };
  //     const rzp = new (window as any).Razorpay(options);
  //     rzp.open();
  //   });
  // }
}
