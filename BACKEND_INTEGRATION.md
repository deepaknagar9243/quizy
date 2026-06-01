# Backend Integration Guide — QuizArena

## ⚡ Go Live in 2 Steps

**Step 1** — `src/app/shared/services/api.service.ts` line 1 ke paas:
```ts
export const USE_MOCK = false;   // was true
```

**Step 2** — `src/environments/environment.ts`:
```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',   // your backend URL
  wsUrl: 'ws://localhost:3000',
  razorpayKey: 'rzp_test_XXXXXXXXXX',
};
```

That's it. Zero component changes needed.

---

## 🔐 Auth Flow

### Mock (current)
- Users stored in `localStorage` key `qa_users`
- Admin: `admin@quiz.com` / `admin123`
- Demo: `demo@quiz.com` / `demo123`

### Real Backend
```
POST /api/v1/auth/login
Body:     { identifier: string, password: string }
Response: { token: string, refreshToken?: string, expiresIn: number, user: User }

POST /api/v1/auth/register
Body:     { name, email, mobile, password, referralCode? }
Response: { token, refreshToken?, expiresIn, user }

POST /api/v1/auth/refresh
Body:     { refreshToken: string }
Response: { token: string, expiresIn: number }

POST /api/v1/auth/forgot-password
Body:     { identifier: string }   // email or mobile
Response: { success: boolean, message: string }

POST /api/v1/auth/reset-password
Body:     { identifier, otp, newPassword }
Response: { success: boolean }

GET  /api/v1/auth/me
Headers:  Authorization: Bearer <token>
Response: User
```

**JWT Storage:**
- Token → `localStorage` key `qa_token`
- Refresh token → `localStorage` key `qa_refresh_token`
- `AuthInterceptor` auto-attaches `Authorization: Bearer <token>` to every request
- `ErrorInterceptor` catches 401 → clears tokens → redirects to `/login`

---

## 🎯 Quizzes

```
GET  /api/v1/quizzes?status=upcoming|live|completed&category=&page=&limit=
GET  /api/v1/quizzes/live
GET  /api/v1/quizzes/:id
GET  /api/v1/quizzes/:id/questions
POST /api/v1/quizzes/:id/join
     Response: { success, message, entryFeeDeducted }
POST /api/v1/quizzes/:id/answer
     Body: { questionId, answer: number, timeTakenMs: number }
     Response: { correct: boolean, correctAnswer: number, points: number }
GET  /api/v1/quizzes/:id/result
     Response: QuizResult

# Admin CRUD
POST   /api/v1/admin/quizzes
PATCH  /api/v1/admin/quizzes/:id
DELETE /api/v1/admin/quizzes/:id
```

---

## 💰 Wallet & Payments

```
GET  /api/v1/wallet/balance
     Response: { walletBalance: number, bonusBalance: number }

GET  /api/v1/wallet/transactions?type=&page=&limit=
     Response: PaginatedResponse<Transaction>

POST /api/v1/wallet/deposit
     Body: PaymentRequest
     Response: PaymentResponse

POST /api/v1/wallet/withdraw
     Body: WithdrawalRequest
     Response: WithdrawalResponse
```

### Razorpay Flow (Recommended)
```
1. Frontend calls:  POST /api/v1/payments/razorpay/order
   Body:            { amount: number }
   Response:        { orderId, amount, currency, keyId }

2. Frontend opens Razorpay SDK with orderId

3. On payment success, frontend calls:
   POST /api/v1/payments/razorpay/verify
   Body: { orderId, paymentId, signature }
   Response: PaymentResponse
```

---

## 🏆 Leaderboard

```
GET /api/v1/leaderboard?period=all|weekly|monthly&page=&limit=
    Response: PaginatedResponse<LeaderboardEntry>

GET /api/v1/leaderboard/winners
    Response: Winner[]
```

---

## 🎁 Referrals

```
GET  /api/v1/referrals/validate?code=XXXX
     Response: { valid: boolean, reason?: string, referrerName?: string }

GET  /api/v1/referrals/stats
     Response: { code, totalReferrals, totalEarned, records[] }
```

---

## 👤 Profile & KYC

```
PATCH /api/v1/users/me
      Body: { name?, mobile? }
      Response: User

POST  /api/v1/users/me/change-password
      Body: { currentPassword, newPassword }

POST  /api/v1/users/me/avatar
      Body: FormData (field: avatar)
      Response: { avatarUrl: string }

POST  /api/v1/kyc/submit
      Body: FormData (docType, docNumber, front, back?)
      Response: { success, message }
```

---

## 🔔 Notifications

```
GET  /api/v1/notifications?page=&limit=
     Response: PaginatedResponse<AppNotification>

POST /api/v1/notifications/read-all
     Response: { success: boolean }
```

---

## 🛡️ Admin

```
GET  /api/v1/admin/stats
     Response: AdminStats

GET  /api/v1/admin/users?page=&limit=&search=
     Response: PaginatedResponse<User>

GET  /api/v1/admin/withdrawals/pending
     Response: Transaction[]

POST /api/v1/admin/withdrawals/:id/approve
POST /api/v1/admin/withdrawals/:id/reject
     Body: { reason: string }

GET  /api/v1/admin/settings
PATCH /api/v1/admin/settings
      Body: AdminSettings

# Question CRUD
POST   /api/v1/admin/questions
PATCH  /api/v1/admin/questions/:id
DELETE /api/v1/admin/questions/:id
```

---

## 📦 TypeScript Models (already in models.ts)

```ts
User, Quiz, Question, QuizResult, LivePlayer
LeaderboardEntry, Winner, Transaction
PaymentRequest, PaymentResponse
WithdrawalRequest, WithdrawalResponse
AdminStats, AdminSettings
AppNotification
ApiResponse<T>, PaginatedResponse<T>
LoginRequest, RegisterRequest, AuthResponse
```

---

## 🌐 WebSocket (Live Quiz)

```ts
// Connect
const ws = new WebSocket(`${environment.wsUrl}/quiz/${quizId}?token=${authToken}`);

// Events from server
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  switch(msg.type) {
    case 'question':          // { question: Question, questionIndex, totalQuestions }
    case 'answer_result':     // { correct, correctAnswer, points, yourRank }
    case 'leaderboard_update':// { players: LivePlayer[] }
    case 'quiz_end':          // { result: QuizResult }
    case 'player_count':      // { count: number }
  }
};

// Send answer
ws.send(JSON.stringify({ type: 'answer', questionId, answer, timeTakenMs }));
```

---

## 🔧 Recommended Backend Stack

| Layer | Tech |
|-------|------|
| Runtime | Node.js 20+ |
| Framework | NestJS (recommended) or Express/Fastify |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Payments | Razorpay Node SDK |
| WebSocket | Socket.io or ws |
| Queue | BullMQ (prize distribution, notifications) |
| Cache | Redis (leaderboard, sessions) |
| Storage | AWS S3 / Cloudflare R2 (KYC docs, avatars) |

---

## 🚀 Deployment Checklist

- [ ] Set `USE_MOCK = false` in `api.service.ts`
- [ ] Update `environment.prod.ts` with production URLs
- [ ] Set Razorpay live key in `environment.prod.ts`
- [ ] Run `npm run build` — uses `environment.prod.ts` automatically
- [ ] Deploy `dist/quiz-platform/browser/` to CDN / Nginx
- [ ] Configure CORS on backend for your frontend domain
- [ ] Set `Authorization` header whitelist on backend
