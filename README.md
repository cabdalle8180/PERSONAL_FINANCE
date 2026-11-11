# Expense Tracker

A full-stack personal finance management application built to help users track income, expenses, manage budgets, and monitor their financial activities through a clean and responsive dashboard.

## Overview

Expense Tracker is a web-based application that allows users to manage their personal finances in one place. Users can securely authenticate, record transactions, organize expenses by category, and monitor their budgets.

The application follows a client-server architecture, with a Next.js frontend communicating with an Express.js REST API and a PostgreSQL database managed through Prisma ORM.
## System Dashboard
![alt text](image.png)
## Features

### Authentication
- User registration and login.
- JWT-based authentication.
- Protected dashboard routes.
- User profile information.
- Logout functionality.

### Dashboard
- Financial overview.
- Income and expense summaries.
- Dashboard statistics.
- Recent transactions.
- Budget progress overview.

### Transactions
- Create transactions.
- View transaction history.
- Update existing transactions.
- Delete transactions.
- Filter and organize transactions.

### Categories
- Organize transactions into categories.
- Manage expense categories.
- Associate transactions with categories.

### Budgets
- Create and manage budgets.
- Monitor spending against budget limits.
- View budget progress.

### Settings
- View account information.
- View registered email and account ID.
- View account creation date.
- Manage the current login session.
- Log out securely.

### User Interface
- Responsive dashboard layout.
- Mobile, tablet, and desktop support.
- Reusable React components.
- Clean and modern interface.

## Technology Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Lucide React

### Backend
- Node.js
- Express.js
- TypeScript / JavaScript

### Database
- PostgreSQL
- Prisma ORM

### Authentication
- JSON Web Tokens (JWT)
- Password hashing

### Development Tools
- Visual Studio Code
- Postman
- Git and GitHub
- pgAdmin

## Application Architecture

```text
                 EXPENSE TRACKER
                        |
          +-------------+-------------+
          |                           |
       Frontend                    Backend
          |                           |
       Next.js                    Express.js
          |                           |
       React UI                   REST API
          |                           |
          +------ HTTP Requests ------+
                                      |
                                  Prisma ORM
                                      |
                                  PostgreSQL
```

## Project Structure

The project is organized into separate frontend and backend applications.

```text
expense-tracker/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   ├── prisma/
│   ├── package.json
│   └── .env
│
└── README.md
```

*Note: Adjust the folder names above to match your actual repository structure.*

## Getting Started

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
```

```bash
cd expense-tracker
```

### 2. Install Dependencies

Install frontend dependencies:

```bash
cd frontend
npm install
```

Install backend dependencies:

```bash
cd ../backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the backend directory.

```env
PORT=5000
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/expense_tracker"
JWT_SECRET="YOUR_SECURE_SECRET"
```

Create a `.env.local` file inside the frontend directory.

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Replace the example values with your actual configuration.

Never commit environment files or expose secret keys in your public repository.

### 4. Configure Prisma

Run database migrations:

```bash
npx prisma migrate dev
```

Generate Prisma Client if required by your Prisma setup:

```bash
npx prisma generate
```

### 5. Run the Backend

```bash
npm run dev
```

### 6. Run the Frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

Open your browser:

```text
http://localhost:3000
```

*Note: The commands above assume your package scripts and project structure are configured accordingly.*

## API Overview

The backend exposes REST API endpoints for authentication and financial management.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a user |
| POST | `/auth/login` | Authenticate a user |
| GET | `/auth/me` | Get current user profile |
| GET | `/transactions` | Get transactions |
| POST | `/transactions` | Create transaction |
| PUT | `/transactions/:id` | Update transaction |
| DELETE | `/transactions/:id` | Delete transaction |
| GET | `/categories` | Get categories |
| GET | `/budgets` | Get budgets |

*Endpoint availability and HTTP methods should be verified against the actual backend implementation.*

## Security Considerations

- Authentication is handled using JWT.
- Protected API endpoints require authentication.
- Passwords should be securely hashed.
- Environment variables are used for sensitive configuration.
- Backend authorization should ensure users can only access their own financial data.
- Production deployments should use HTTPS and secure authentication practices.

## Future Improvements

- Financial charts and analytics.
- Monthly and yearly reports.
- Export transactions to CSV and PDF.
- Advanced transaction filtering.
- Recurring transactions.
- Email notifications.
- Improved authentication using secure HttpOnly cookies.
- Financial insights powered by AI.

## Contributing

Contributions, suggestions, and improvements are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push your branch.
5. Open a Pull Request.

## License

This project is currently available for personal and educational use. Add a suitable open-source license before publishing if you intend to allow reuse and redistribution.

---

**Expense Tracker** — Take control of your personal finances.