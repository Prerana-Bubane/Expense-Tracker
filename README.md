# 💰 Expense Tracker

A full stack expense tracking web app built with **React** and **Node.js**. Track income and expenses, visualize spending with charts, and manage your finances — all in one place.

---

## ✨ Features

- 🔐 User authentication (register, login, JWT)
- ➕ Add income & expense transactions with category, date, and notes
- 📊 Dashboard with pie chart (spending by category) and bar chart (monthly overview)
- 🔍 Search transactions by title
- 🗂️ Filter by type (income / expense) and by month & year
- 📥 Export transactions to CSV
- 📱 Responsive design

---

## 🛠 Tech Stack

**Frontend** — React, React Router, Axios, Recharts  
**Backend** — Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs

---

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas account

### 1. Clone the repo
```bash
git clone https://github.com/your-username/expense-tracker.git
cd expense-tracker
```

### 2. Set up the backend
```bash
cd server
npm install
```

Create a `.env` file inside `server/`:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/expense-tracker
JWT_SECRET=your_secret_key_here
```

Start the server:
```bash
npx nodemon server.js
```

### 3. Set up the frontend
```bash
cd client
npm install
npm start
```

App runs at **http://localhost:3000**  
API runs at **http://localhost:5000**

---

## 📁 Project Structure

```
expense-tracker/
├── client/                 # React frontend
│   └── src/
│       ├── context/        # AuthContext (JWT + global auth)
│       ├── components/     # Navbar, ProtectedRoute, TransactionList
│       └── pages/          # Login, Register, Dashboard, Transactions
└── server/                 # Node.js backend
    ├── models/             # User, Transaction (Mongoose)
    ├── routes/             # authRoutes, transactionRoutes
    ├── middleware/         # JWT auth middleware
    └── server.js           # Entry point
```


## 🙌 Author

Built by **Prerana Bubane** — beginner full stack project using React + Node.js.
