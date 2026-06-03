# Find House for Rent

A web application that connects university students in Ho Chi Minh City with landlords offering rooms, apartments, and houses for rent. Students can search and filter listings, save favourites, send booking requests, and track rental contracts. Landlords can post and manage listings, review requests, and create contracts. Staff oversee the platform and manage monthly listing fees.

---

## Project Structure

The project is split into two parts that run separately and communicate over HTTP.

```
Find-House-for-Rent/
├── backend/    — Node.js + Express REST API
└── frontend/   — HTML/CSS/JS + Bootstrap pages
```

---

## Backend Setup

### Requirements
- Node.js 18 or higher
- MySQL 8.x (via XAMPP, Laragon, or a standalone install)

### Steps

**1. Create the database**

Open MySQL Workbench or your MySQL client and run:

```sql
CREATE DATABASE find_house_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**2. Install dependencies**

```bash
cd backend
npm install
```

**3. Configure environment**

```bash
cp .env.example .env
```

Open `.env` and fill in at minimum:

```
DATABASE_URL=mysql://root:yourpassword@localhost:3306/find_house_db
JWT_SECRET=a_strong_random_string_at_least_32_chars
GROQ_API_KEY=your_groq_api_key
FRONTEND_URL=http://127.0.0.1:5500
```

**4. Run migrations and seed data**

```bash
npm run setup
```

This runs the Prisma migration, generates the client, and seeds the database with demo accounts and sample listings.

**5. Start the server**

```bash
npm run dev
```

The API runs at `http://localhost:3000`.

---

## Frontend Setup

Open the `frontend/` folder in VS Code and use Live Server to serve the pages. The default Live Server address is `http://127.0.0.1:5500`, which matches the `FRONTEND_URL` already set in `.env.example`.

---

## Demo Accounts

All demo accounts use the password `password123`.

| Role     | Email                             |
|----------|-----------------------------------|
| Staff    | staff@findhousehcmc.vn            |
| Landlord | landlord1@gmail.com               |
| Landlord | landlord2@gmail.com               |
| Landlord | landlord3@gmail.com               |
| Student  | student1@student.hcmut.edu.vn     |
| Student  | student2@student.hcmut.edu.vn     |
| Student  | student3@student.hcmut.edu.vn     |

---

## API Reference

Base URL: `http://localhost:3000/api`

Protected routes require the header: `Authorization: Bearer <token>`

### Auth

| Method | Endpoint               | Auth | Description                    |
|--------|------------------------|------|--------------------------------|
| POST   | /auth/register         | No   | Register as student or landlord|
| POST   | /auth/login            | No   | Log in                         |
| GET    | /auth/me               | Yes  | Get current user profile       |
| PUT    | /auth/me               | Yes  | Update profile                 |
| PUT    | /auth/change-password  | Yes  | Change password                |

### Houses

| Method | Endpoint                | Auth           | Description                    |
|--------|-------------------------|----------------|--------------------------------|
| GET    | /houses                 | No             | Search and filter listings     |
| GET    | /houses/:id             | No             | View listing details           |
| GET    | /houses/landlord/my     | Landlord       | My listings                    |
| GET    | /houses/landlord/stats  | Landlord       | My listing statistics          |
| POST   | /houses                 | Landlord       | Create a listing               |
| PUT    | /houses/:id             | Landlord/Staff | Edit a listing                 |
| DELETE | /houses/:id             | Landlord/Staff | Delete a listing               |
| PATCH  | /houses/:id/status      | Landlord/Staff | Update listing status          |

Query parameters for `GET /houses`: `district`, `ward`, `type`, `interior`, `status`, `minPrice`, `maxPrice`, `minArea`, `maxArea`, `maxTenants`, `amenities`, `keyword`, `page`, `limit`, `sortBy`, `order`

### Bookings

| Method | Endpoint                   | Auth                   | Description                 |
|--------|----------------------------|------------------------|-----------------------------|
| POST   | /bookings                  | Student                | Send a booking request      |
| GET    | /bookings/my               | Student                | My booking requests         |
| GET    | /bookings/house/:houseId   | Landlord/Staff         | Requests for a house        |
| PATCH  | /bookings/:id/status       | Landlord/Student/Staff | Approve, reject, or cancel  |
| GET    | /bookings                  | Staff                  | All bookings                |

### Contracts

| Method | Endpoint                    | Auth           | Description              |
|--------|-----------------------------|----------------|--------------------------|
| POST   | /contracts                  | Landlord/Staff | Create a contract        |
| GET    | /contracts/my               | Student        | My contracts             |
| GET    | /contracts/house/:houseId   | Landlord/Staff | Contracts for a house    |
| GET    | /contracts                  | Staff          | All contracts            |
| PATCH  | /contracts/:id/terminate    | Landlord/Staff | Terminate a contract     |

### Payments

| Method | Endpoint              | Auth     | Description                  |
|--------|-----------------------|----------|------------------------------|
| POST   | /payments/generate    | Staff    | Generate monthly listing fees|
| GET    | /payments/my          | Landlord | My payment history           |
| PATCH  | /payments/:id/pay     | Landlord | Mark a payment as paid       |
| GET    | /payments/stats       | Staff    | Revenue statistics           |
| GET    | /payments             | Staff    | All payments                 |

### Favourites

| Method | Endpoint                    | Auth    | Description                     |
|--------|-----------------------------|---------|---------------------------------|
| GET    | /favorites                  | Student | My saved listings               |
| GET    | /favorites/check/:houseId   | Student | Check if a listing is saved     |
| POST   | /favorites/:houseId         | Student | Toggle save on or off           |

### View History

| Method | Endpoint  | Auth    | Description              |
|--------|-----------|---------|--------------------------|
| GET    | /history  | Student | My recently viewed list  |
| DELETE | /history  | Student | Clear view history       |

### AI Assistant

| Method | Endpoint       | Auth    | Description                             |
|--------|----------------|---------|-----------------------------------------|
| POST   | /ai/chat       | No      | Ask housing questions                   |
| GET    | /ai/recommend  | Student | Get personalised listing recommendations|

### Users (Staff only)

| Method | Endpoint                 | Auth  | Description              |
|--------|--------------------------|-------|--------------------------|
| GET    | /users                   | Staff | List all users           |
| GET    | /users/:id               | Staff | View a user              |
| PATCH  | /users/:id/status        | Staff | Activate or deactivate   |
| POST   | /users/staff             | Staff | Create a staff account   |
| GET    | /users/dashboard/stats   | Staff | Platform statistics      |

---

## Tech Stack

**Backend:** Node.js, Express 5, Prisma ORM, MySQL 8, JWT, bcryptjs, Multer, Nodemailer, Groq SDK

**Frontend:** HTML5, CSS3, Bootstrap 5, JavaScript (Fetch API)

**Tools:** Git, GitHub, VS Code, Thunder Client

---

## Version Control

The project uses Git with separate branches for each part of the codebase. The `backend` branch contains the API and database code. The `frontend` branch contains the pages and client-side logic. Both are merged into `main` for the final submission.

Live URL: https://find-house-project.netlify.app
