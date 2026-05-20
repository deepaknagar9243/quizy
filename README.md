# QuizArena — Live Quiz Competition Platform

A professional Angular 17 frontend MVP for a live quiz competition platform where users join quizzes by paying entry fees, compete in real-time, and winners earn rewards.

---

## 🚀 Tech Stack

- **Angular 17** — Standalone components, Signals, lazy-loaded routes
- **Tailwind CSS 3** — Utility-first styling with custom dark theme
- **TypeScript** — Strict mode
- **No backend** — All data is dummy JSON via services

---

## 📁 Project Structure

```
src/app/
├── auth/
│   ├── login/          # Login page (/login)
│   └── register/       # Register page (/register)
├── dashboard/          # Main dashboard (/dashboard)
├── quiz/
│   └── live/           # Live quiz page (/quiz/live)
├── leaderboard/        # Leaderboard (/leaderboard)
├── wallet/             # Wallet page (/wallet)
├── profile/            # Profile page (/profile)
├── admin/
│   ├── dashboard/      # Admin dashboard (/admin/dashboard)
│   ├── quizzes/        # Manage quizzes (/admin/quizzes)
│   └── questions/      # Manage questions (/admin/questions)
├── layouts/
│   ├── user-layout/    # Sidebar + navbar shell for users
│   └── admin-layout/   # Admin sidebar shell
├── shared/
│   ├── components/
│   │   ├── sidebar/    # User sidebar with navigation
│   │   └── navbar/     # Top navbar
│   ├── services/
│   │   ├── auth.service.ts   # Auth state + localStorage
│   │   └── data.service.ts   # All dummy data
│   └── models/
│       └── models.ts   # TypeScript interfaces
└── core/
    └── guards/
        ├── auth.guard.ts
        └── admin.guard.ts
```

---

## ⚙️ Setup & Run

### Prerequisites
- Node.js 18+
- npm 9+

### Install & Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Open browser
http://localhost:4200
```

### Build for Production

```bash
npm run build
```

---

## 🔐 Demo Credentials

| Role   | Email             | Password     |
|--------|-------------------|--------------|
| User   | any@email.com     | anypassword  |
| Admin  | admin@quiz.com    | anypassword  |

---

## 📄 Pages & Routes

| Route               | Page                    |
|---------------------|-------------------------|
| `/login`            | Login                   |
| `/register`         | Register                |
| `/dashboard`        | Main Dashboard          |
| `/quiz/live`        | Live Quiz (playable!)   |
| `/leaderboard`      | Leaderboard             |
| `/wallet`           | Wallet                  |
| `/profile`          | Profile                 |
| `/admin/dashboard`  | Admin Dashboard         |
| `/admin/quizzes`    | Manage Quizzes (CRUD)   |
| `/admin/questions`  | Manage Questions (CRUD) |

---

## ✨ Key Features

### Live Quiz
- 21 real sports questions
- 15-second countdown timer per question
- Animated progress bar (turns red when < 5s)
- Answer highlighting (correct/wrong)
- Live leaderboard sidebar (updates as you answer)
- Score tracking with speed bonus points
- Quiz result screen with rank & prize

### Dashboard
- Wallet balance display
- Upcoming quiz cards with join button
- Live quiz banner
- Top 5 leaderboard preview
- Recent winners feed

### Wallet
- Add money modal with payment method selector
- Withdraw modal with validation
- Transaction history table

### Admin Panel
- Platform stats (users, revenue, quizzes, active players)
- Full quiz CRUD (create, edit, delete)
- Full question CRUD with correct answer selector

---

## 🎨 Design

- **Theme**: Dark blue glassmorphism
- **Colors**: `#0a0f1e` background · `#2563eb` primary blue · Green for earnings
- **Cards**: `backdrop-filter: blur` glass effect with subtle blue borders
- **Responsive**: Mobile-first, collapsible sidebar on mobile

---

## 📝 Notes

- Auth state persists in `localStorage`
- All data is in `DataService` — replace with HTTP calls when connecting a backend
- Quiz page is fully interactive — play through all 21 questions
- Admin routes are accessible to any logged-in user in this demo
