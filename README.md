# Personal Finance — Expense Tracker

A full-stack personal finance application for tracking income, expenses, categories, and budgets. The app uses a Next.js frontend, an Express REST API, and PostgreSQL accessed through Prisma ORM.

## Dashboard preview

![Expense Tracker dashboard](./image.png)

## Features

- User registration and login.
- JWT-based authentication and protected API routes.
- Personal finance dashboard with income and expense summaries.
- Create, view, update, and delete transactions.
- Categorize income and expenses.
- Create budgets and track budget limits.
- User-specific data relationships in the database.
- Responsive interface for desktop and mobile screens.

## Tech stack

**Frontend**
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Lucide React

**Backend**
- Node.js
- Express 5
- JavaScript (ES modules)
- Prisma ORM 7

**Database and security**
- PostgreSQL
- Prisma Client
- JWT
- bcryptjs
- Helmet and express-rate-limit

## Architecture

```text
Next.js + React UI
       |
       | HTTP requests
       v
Express REST API
       |
       v
Prisma ORM
       |
       v
PostgreSQL
```

## Project structure

```text
PERSONAL_FINANCE/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── auth/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   └── package.json
├── image.png
└── README.md
```

## Database models

The Prisma schema defines these main models:

- **User:** account information and relationships to financial records.
- **Category:** user-owned income or expense categories.
- **Transaction:** amount, type, description, date, owner, and category.
- **Budget:** user-defined budget amount, month, year, and category.

## Run locally

### Requirements
- Node.js
- npm
- PostgreSQL
- Git

### 1. Clone the repository

```bash
git clone https://github.com/cabdalle8180/PERSONAL_FINANCE.git
cd PERSONAL_FINANCE
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/expense_tracker"
JWT_SECRET="replace_with_a_long_random_secret"
```

Use your own PostgreSQL username, password, database name, and JWT secret.

### 3. Apply database migrations

The repository includes a Prisma 7 configuration file named `prisma7.config.ts`. From the `backend` directory, run:

```bash
npx prisma migrate dev --config prisma7.config.ts
npx prisma generate --config prisma7.config.ts
```

### 4. Start the backend

```bash
npm run dev
```

### 5. Configure and start the frontend

Open a second terminal:

```bash
cd PERSONAL_FINANCE/frontend
npm install
```

Create `frontend/.env.local` and set the API base URL expected by the frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start Next.js:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API route groups

The backend mounts route groups for:

- Authentication
- Transactions
- Categories
- Budgets
- Dashboard data

Check the backend route files for the current HTTP methods and endpoint paths.

## Security notes

- Keep database credentials and JWT secrets in backend environment variables.
- Never commit `.env` or `.env.local` files containing real credentials.
- Enforce authentication and user ownership checks on protected endpoints.
- Use HTTPS and secure cookie/token handling in production.

## Future improvements

- Monthly and yearly financial reports.
- CSV and PDF exports.
- Recurring transactions.
- Advanced transaction filters.
- Financial insights and spending analysis.

## Author

Developed by **Abdullahi Mohamud Ahmed**  
GitHub: [@cabdalle8180](https://github.com/cabdalle8180)
