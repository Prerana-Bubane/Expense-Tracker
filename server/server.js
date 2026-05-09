const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config(); // load .env variables first, before anything else

const authRoutes        = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: "http://localhost:3000" })); // allow React dev server
app.use(express.json());                            // parse JSON request bodies

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth",         authRoutes);
app.use("/api/transactions", transactionRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ message: "Expense Tracker API is running" }));

// ─── Connect to MongoDB, then start server ────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });