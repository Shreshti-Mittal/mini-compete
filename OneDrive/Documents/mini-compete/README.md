# Mini Compete - Competition Management Platform

Mini Compete is a full‑stack monorepo platform where organizers can create competitions and participants can register securely. The system demonstrates production‑grade backend patterns including: safe concurrency, idempotent operations, background workers, job queues, and scheduled automation. The project is Docker‑ready and follows clean modular architecture.

---

## ✅ Core Features

* 🔐 JWT‑based authentication (Organizer & Participant roles)
* 🏆 Create and register for competitions
* 🎫 Idempotent registration endpoint with concurrency control
* 🚦 Atomic seat allocation (no overselling under parallel requests)
* 📨 Asynchronous confirmation email simulation through queue workers
* ⏰ Scheduled cron reminder jobs for upcoming competitions
* 📬 In‑app mailbox system (simulated email delivery)
* 🧱 Monorepo architecture with shared tooling

---

## 🛠 Tech Stack

| Layer    | Tech                          |
| -------- | ----------------------------- |
| Frontend | Next.js (React), Tailwind CSS |
| Backend  | NestJS, Prisma ORM            |
| Database | PostgreSQL                    |
| Queue    | Redis + BullMQ                |
| Auth     | JWT + Passport                |
| Infra    | Docker Compose + Turborepo    |
| Language | TypeScript (Full‑stack)       |

---

## 📦 Repository Structure

```
mini-compete/
├── apps/
│   ├── backend/        ← NestJS API
│   └── frontend/       ← Next.js UI
├── docker-compose.yml
├── prisma/ (handled inside backend)
└── turbo.json
```

---

## 📋 Assignment Requirement Checklist

| Requirement                                    | Status |
| ---------------------------------------------- | ------ |
| Monorepo (Turborepo)                           | ✅      |
| Postgres + Redis via Docker Compose            | ✅      |
| JWT authentication                             | ✅      |
| Create competitions (organizer only)           | ✅      |
| Register with idempotency + concurrency safety | ✅      |
| Background worker queue using BullMQ           | ✅      |
| Cron scheduled tasks                           | ✅      |
| Prisma migrations + seeding                    | ✅      |
| Minimal working UI                             | ✅      |

---

## 🚀 Quick Start

### **1️⃣ Install Dependencies**

```bash
git clone <repo-url>
cd mini-compete
pnpm install
```

---

### **2️⃣ Configure Environment**

Copy and configure environment variables:

```bash
cp .env.example .env
```

Required environment example:

#### apps/backend/.env:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/minicompete"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key"
JWT_EXPIRATION="7d"
FRONTEND_URL="http://localhost:3000"
```

#### apps/frontend/.env:

```
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

---

### **3️⃣ Start Services**

```bash
docker-compose up -d
```

---

### **4️⃣ Database Setup**

```bash
cd apps/backend
pnpm prisma migrate dev
pnpm prisma:seed
```

---

### **5️⃣ Run Monorepo**

```bash
pnpm dev
```

---

## 🌐 App Access

| Service     | URL                                                    |
| ----------- | ------------------------------------------------------ |
| Frontend    | [http://localhost:3000](http://localhost:3000)         |
| Backend API | [http://localhost:3001/api](http://localhost:3001/api) |

---

## 🔐 Test Accounts

| Role        | Email                                             | Password    |
| ----------- | ------------------------------------------------- | ----------- |
| Organizer   | [organizer1@test.com](mailto:organizer1@test.com) | password123 |
| Organizer   | [organizer2@test.com](mailto:organizer2@test.com) | password123 |
| Participant | participant1–[5@test.com](mailto:5@test.com)      | password123 |

---

## 📚 API Endpoints Summary

### **Auth**

* POST `/api/auth/signup`
* POST `/api/auth/login`

### **Competitions**

* GET `/api/competitions`
* POST `/api/competitions` (Organizer)

### **Registration**

* POST `/api/competitions/:id/register` (Participant)

  * Requires: `Idempotency-Key` header
* GET `/api/users/me/registrations`

### **Mailbox**

* GET `/api/mailbox`
* PATCH `/api/mailbox/:id/read`

---

## 🧠 Architecture Summary

### 🔁 Idempotency Handling

* Client sends unique header `Idempotency-Key: uuid`.
* Redis stores responses for 24 hours.
* Duplicate requests return cached result.

### 🔒 Concurrency Safety

* Prisma transaction with row locking ensures atomic seat allocation.
* Prevents oversell under simultaneous registrations.

### 🎯 Worker & Queue

* Redis + BullMQ used for async processing.
* Jobs include: `registration_confirmation`, `reminder_notification`.
* Exponential retry + dead‑letter behavior implemented.

### 🕒 Cron Job

* Runs daily (or every minute in dev).
* Schedules reminder messages for competitions starting within 24 hours.

---

## 🧪 Testing Workflow (Example)

1. Login as participant
2. Choose competition
3. Send registration request using

```
Idempotency-Key: <generated-uuid>
```

4. Check mailbox for confirmation
5. Login as organizer to review participant list

---

## 🎉 Status: Fully Functional

All features work (auth, registration, idempotency, queues, cron, UI integration) and project runs successfully.

---

## License

MIT
