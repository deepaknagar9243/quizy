# Backend Integration Guide

## Quick Switch

In `src/app/shared/services/api.service.ts`, change:
```ts
const USE_MOCK = false;  // was true
```
That's it. All components stay unchanged.

---

## Environment URLs

| File | Used when |
|------|-----------|
| `src/environments/environment.ts` | `npm start` (dev) |
| `src/environments/environment.prod.ts` | `npm run build` (prod) |

Update `apiUrl` and `razorpayKey` in both files.

---

## Expected API Contract

### Auth
```
POST /api/v1/auth/login
Body: { identifier: string, password: string }
Response: { token: string, refreshToken?: string, expiresIn: number, user: User }

POST /api/v1/auth/register
Body: { name, email, mobile, password, referralCode? }
Response: { token, refreshToken?, expiresIn, user }

POST /api/v1/auth/refresh
Body: { refreshToken: string }
Response: { token: string, expiresIn: number }
```

### Wallet
```
POST /api/v1/wallet/deposit
Body: PaymentRequest
Response: PaymentResponse

POST /api/v1/wallet/withdraw
Body: WithdrawalRequest
Response: WithdrawalResponse

GET  /api/v1/wallet/transactions?type=&page=&limit=
Response: PaginatedResponse<Transaction>
```

### Razorpay Flow
```
POST /api/v1/payments/razorpay/order   → { orderId, amount, currency }
POST /api/v1/payments/razorpay/verify  → { success, transactionId, message }
```

### Quizzes
```
GET  /api/v1/quizzes?status=&page=&limit=
GET  /api/v1/quizzes/:id
GET  /api/v1/quizzes/:id/questions
POST /api/v1/quizzes/:id/join
POST /api/v1/quizzes/:id/answer  Body: { questionId, answer, timeTakenMs }
```

### Leaderboard
```
GET /api/v1/leaderboard?period=all|weekly|monthly&page=
Response: PaginatedResponse<LeaderboardEntry>
```

### Admin
```
GET  /api/v1/admin/stats
GET  /api/v1/admin/users?page=&limit=&search=
POST /api/v1/admin/withdrawals/:id/approve
POST /api/v1/admin/withdrawals/:id/reject  Body: { reason }
```

### Profile / KYC
```
PATCH /api/v1/users/me          Body: { name?, mobile? }
POST  /api/v1/users/me/avatar   Body: FormData (avatar file)
POST  /api/v1/kyc/submit        Body: FormData (docType, docNumber, front, back?)
```

---

## JWT Flow

- Token stored in `localStorage` key `qa_token`
- `AuthInterceptor` auto-attaches `Authorization: Bearer <token>` to every request
- `ErrorInterceptor` catches 401 → clears token → redirects to `/login`
- To store token after login: `authService.setToken(response.token)`

---

## WebSocket (Live Quiz)

`environment.wsUrl` is ready. Connect using:
```ts
const ws = new WebSocket(`${environment.wsUrl}/quiz/${quizId}`);
```
Events to handle: `question`, `answer_result`, `leaderboard_update`, `quiz_end`

---

## Recommended Backend Stack

- **Node.js** — Express / Fastify / NestJS
- **Database** — PostgreSQL + Prisma ORM
- **Auth** — JWT (jsonwebtoken) + bcrypt
- **Payments** — Razorpay SDK
- **WebSocket** — Socket.io or ws
- **Queue** — Bull (for prize distribution)
