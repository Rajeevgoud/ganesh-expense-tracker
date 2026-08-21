# Ganesh Festival Expense Tracker

A full-stack expense tracker for Ganesh Festival money management.

## Features

- Public dashboard: anyone can view:
  - Total money collected
  - Total money spent
  - Remaining balance
  - Complete transaction history
- Four admin accounts
- Only logged-in admins can add income or expenses
- Every transaction stores:
  - Transaction type
  - Purpose
  - Amount
  - Description
  - Admin who added it
  - Date and time
- Dashboard refreshes automatically every 5 seconds while open
- MongoDB permanently stores transactions

---

# Project Structure

```text
ganesh-expense-tracker/
├── client/
│   ├── src/
│   ├── .env.example
│   └── package.json
├── server/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── .env.example
│   ├── seedAdmins.js
│   ├── server.js
│   └── package.json
└── README.md
```

# Prerequisites

Install:

- Node.js
- npm
- A MongoDB Atlas account/database

---

# Exact Setup Commands

## 1. Extract and enter the project

After extracting the ZIP:

```bash
cd ganesh-expense-tracker
```

## 2. Configure the backend

```bash
cd server
cp .env.example .env
```

Open the `.env` file:

```bash
nano .env
```

Replace these values:

```env
MONGO_URI=YOUR_MONGODB_CONNECTION_STRING
JWT_SECRET=CHANGE_THIS_TO_A_LONG_RANDOM_SECRET
```

Then configure all four admins:

```env
ADMIN1_NAME=Your First Admin Name
ADMIN1_EMAIL=admin1@example.com
ADMIN1_PASSWORD=YourStrongPassword1

ADMIN2_NAME=Your Second Admin Name
ADMIN2_EMAIL=admin2@example.com
ADMIN2_PASSWORD=YourStrongPassword2

ADMIN3_NAME=Your Third Admin Name
ADMIN3_EMAIL=admin3@example.com
ADMIN3_PASSWORD=YourStrongPassword3

ADMIN4_NAME=Your Fourth Admin Name
ADMIN4_EMAIL=admin4@example.com
ADMIN4_PASSWORD=YourStrongPassword4
```

Save and exit Nano:

```text
Control + O
Enter
Control + X
```

Install backend packages:

```bash
npm install
```

Create the four admin accounts:

```bash
npm run seed-admins
```

Start the backend:

```bash
npm run dev
```

The backend should run at:

```text
http://localhost:5000
```

Leave this Terminal running.

---

# 3. Configure the Frontend

Open a second Terminal window.

Go to the project:

```bash
cd ganesh-expense-tracker/client
```

Create the frontend environment file:

```bash
cp .env.example .env
```

The local API URL should be:

```env
VITE_API_URL=http://localhost:5000/api
```

Install packages:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Vite will display a URL, usually:

```text
http://localhost:5173
```

Open that URL in your browser.

---

# How to Use

## Public Users

Open:

```text
http://localhost:5173
```

Everyone can view:

- Total Collected
- Total Spent
- Remaining Balance
- All transactions
- Admin who added each transaction
- Date and time

## Admins

Go to:

```text
http://localhost:5173/login
```

Log in using one of the four admin email/password combinations configured in `server/.env`.

After login, go to the Admin Panel and add:

- Money Added / Collected
- Money Spent
- Purpose
- Amount
- Optional description

The transaction is saved in MongoDB.

---

# Important Security Notes

- Do not share `server/.env`.
- Do not upload `.env` to GitHub.
- The admin passwords are loaded from environment variables and are not hardcoded in `seedAdmins.js`.
- Change the example passwords to strong unique passwords.
- Admin registration is disabled after setup, so random users cannot create new admin accounts.
- `npm run seed-admins` can safely be run again; existing admin emails are skipped.

---

# Production Deployment

Recommended setup:

- Frontend: Vercel or Netlify
- Backend: Render, Railway, or another Node.js host
- Database: MongoDB Atlas

When deploying:

1. Add all backend environment variables in the hosting provider's Environment Variables section:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `CLIENT_URL`
   - `ADMIN1_NAME` through `ADMIN4_PASSWORD`
2. Set `CLIENT_URL` to your deployed frontend URL.
3. Set `VITE_API_URL` to your deployed backend URL followed by `/api`.
4. Run the admin seed command once from a secure environment connected to the production database.

Never expose the `.env` file in the frontend or public repository.
