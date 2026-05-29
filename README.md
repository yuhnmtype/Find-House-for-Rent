# 🏠 Find House for Rent – Backend API

RESTful API for the student housing platform in Ho Chi Minh City.

Built with **Node.js + Express 5**, **Prisma ORM**, and **MySQL**.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.x running locally (e.g. via XAMPP, Laragon, or Docker)

### 1. Create the MySQL database
```sql
CREATE DATABASE find_house_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Install dependencies
```bash
cd backend
npm install
```

### 3. Set up environment
```bash
cp .env.example .env
# Edit .env — at minimum set DATABASE_URL and JWT_SECRET
```

### 4. Run migrations, generate client, and seed demo data
```bash
npm run setup
# Equivalent to: prisma migrate dev → prisma generate → seed.js
```

### 5. Start the server
```bash
npm run dev     # Development with hot-reload (nodemon)
npm start       # Production
```

Server runs at **http://localhost:3000**

---

## 🌐 Frontend CORS

The frontend (plain HTML/CSS/JS + Bootstrap, served via VS Code Live Server) connects to this API.

Set in `.env`:
```
FRONTEND_URL=http://127.0.0.1:5500
```

Multiple origins are supported (comma-separated):
```
FRONTEND_URL=http://127.0.0.1:5500,http://localhost:5173
```

---

## 👥 Demo Accounts (password: `password123`)

| Role     | Email                           |
|----------|---------------------------------|
| STAFF    | staff@findhousehcmc.vn          |
| LANDLORD | landlord1@gmail.com             |
| LANDLORD | landlord2@gmail.com             |
| STUDENT  | student1@student.hcmut.edu.vn   |
| STUDENT  | student2@student.hcmut.edu.vn   |

---

## 📋 API Reference

Base URL: `http://localhost:3000/api`

All protected routes require: `Authorization: Bearer <token>`

---

### 🔐 Auth

| Method | Endpoint                | Auth | Description               |
|--------|-------------------------|------|---------------------------|
| POST   | `/auth/register`        | ❌   | Register (STUDENT/LANDLORD)|
| POST   | `/auth/login`           | ❌   | Login                     |
| GET    | `/auth/me`              | ✅   | Get my profile            |
| PUT    | `/auth/me`              | ✅   | Update profile            |
| PUT    | `/auth/change-password` | ✅   | Change password           |

---

### 🏡 Houses

| Method | Endpoint                 | Auth           | Description                     |
|--------|--------------------------|----------------|---------------------------------|
| GET    | `/houses`                | ❌             | Search & filter houses (public) |
| GET    | `/houses/:id`            | ❌             | Get house details               |
| GET    | `/houses/landlord/my`    | LANDLORD       | My listings                     |
| POST   | `/houses`                | LANDLORD       | Create listing (multipart/form) |
| PUT    | `/houses/:id`            | LANDLORD/STAFF | Update listing                  |
| DELETE | `/houses/:id`            | LANDLORD/STAFF | Delete listing                  |
| PATCH  | `/houses/:id/status`     | LANDLORD/STAFF | Update status only              |

**Query params for GET /houses:**
`district`, `type`, `interior`, `status`, `minPrice`, `maxPrice`, `minArea`, `maxArea`, `keyword`, `page`, `limit`, `sortBy`, `order`

---

### 📅 Bookings

| Method | Endpoint                    | Auth                    | Description              |
|--------|-----------------------------|-------------------------|--------------------------|
| POST   | `/bookings`                 | STUDENT                 | Pre-order a house        |
| GET    | `/bookings/my`              | STUDENT                 | My bookings              |
| GET    | `/bookings/house/:houseId`  | LANDLORD/STAFF          | Bookings for a house     |
| PATCH  | `/bookings/:id/status`      | LANDLORD/STUDENT/STAFF  | Approve/Reject/Cancel    |
| GET    | `/bookings`                 | STAFF                   | All bookings             |

---

### 📄 Contracts

| Method | Endpoint                       | Auth           | Description            |
|--------|--------------------------------|----------------|------------------------|
| POST   | `/contracts`                   | LANDLORD/STAFF | Create contract        |
| GET    | `/contracts/my`                | STUDENT        | My contracts           |
| GET    | `/contracts/house/:houseId`    | LANDLORD/STAFF | Contracts for a house  |
| GET    | `/contracts`                   | STAFF          | All contracts          |
| PATCH  | `/contracts/:id/terminate`     | LANDLORD/STAFF | Terminate contract     |

---

### 💰 Payments

| Method | Endpoint                | Auth     | Description              |
|--------|-------------------------|----------|--------------------------|
| POST   | `/payments/generate`    | STAFF    | Generate monthly fees    |
| GET    | `/payments/my`          | LANDLORD | My payment history       |
| PATCH  | `/payments/:id/pay`     | LANDLORD | Mark payment as paid     |
| GET    | `/payments/stats`       | STAFF    | Revenue stats            |
| GET    | `/payments`             | STAFF    | All payments (filterable)|

---

### 👤 Users (Staff only)

| Method | Endpoint                   | Auth  | Description         |
|--------|----------------------------|-------|---------------------|
| GET    | `/users`                   | STAFF | List all users      |
| GET    | `/users/:id`               | STAFF | User details        |
| PATCH  | `/users/:id/status`        | STAFF | Activate/deactivate |
| POST   | `/users/staff`             | STAFF | Create staff account|
| GET    | `/users/dashboard/stats`   | STAFF | Dashboard overview  |

---

## 🗃️ Enums

| Model    | Field    | Values                                        |
|----------|----------|-----------------------------------------------|
| User     | role     | `STUDENT` \| `LANDLORD` \| `STAFF`            |
| House    | type     | `ROOM` \| `APARTMENT` \| `HOUSE` \| `DORMITORY`|
| House    | interior | `FURNISHED` \| `SEMI_FURNISHED` \| `UNFURNISHED`|
| House    | status   | `AVAILABLE` \| `PENDING` \| `RENTED` \| `INACTIVE`|
| Booking  | status   | `PENDING` \| `APPROVED` \| `REJECTED` \| `CANCELLED`|
| Contract | status   | `ACTIVE` \| `EXPIRED` \| `TERMINATED`         |
| Payment  | status   | `PENDING` \| `PAID` \| `OVERDUE`              |

---

## 🛠️ Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express 5
- **ORM:** Prisma 7
- **Database:** MySQL 8
- **Auth:** JWT + bcryptjs
- **File Upload:** Multer
- **Email:** Nodemailer (Gmail SMTP)

---

## 📁 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma       # MySQL schema (Prisma)
│   └── seed.js             # Demo data
├── src/
│   ├── controllers/        # Business logic
│   ├── middlewares/        # Auth (JWT) & file upload (Multer)
│   ├── routes/             # Route definitions
│   ├── utils/
│   │   └── prisma.js       # Shared PrismaClient singleton
│   └── app.js              # Express app setup
├── uploads/                # Uploaded house images (git-ignored)
├── .env.example            # Environment variable template
├── server.js               # Entry point
└── package.json
```
