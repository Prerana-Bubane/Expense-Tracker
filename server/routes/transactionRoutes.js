const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const protect = require("../middleware/auth");

// Apply JWT auth middleware to ALL routes in this file
router.use(protect);

// ─── GET /api/transactions ────────────────────────────────────────────────────
// Fetch all transactions for the logged-in user.
// Supports optional query filters: ?type=income|expense&category=Food&month=4&year=2024
router.get("/", async (req, res) => {
  try {
    const { type, category, month, year } = req.query;

    // Always filter by the logged-in user — users never see each other's data
    const filter = { userId: req.user.id };

    if (type)     filter.type = type;
    if (category) filter.category = category;

    // Filter by month + year if provided (used by the month picker on dashboard)
    if (month && year) {
      const start = new Date(year, month - 1, 1);        // e.g. April 1
      const end   = new Date(year, month, 0, 23, 59, 59); // e.g. April 30
      filter.date = { $gte: start, $lte: end };
    }

    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })   // newest first
      .lean();               // plain JS objects — faster than Mongoose documents

    res.json({ success: true, count: transactions.length, transactions });
  } catch (error) {
    console.error("GET /transactions error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching transactions" });
  }
});

// ─── GET /api/transactions/summary ───────────────────────────────────────────
// Returns { income, expense, balance } for the logged-in user.
// Uses the getSummary() aggregation we defined in Transaction.js.
// NOTE: This route must be defined BEFORE /:id to avoid "summary" being
// treated as an id parameter.
router.get("/summary", async (req, res) => {
  try {
    const summary = await Transaction.getSummary(req.user.id);
    res.json({ success: true, summary });
  } catch (error) {
    console.error("GET /transactions/summary error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching summary" });
  }
});

// ─── GET /api/transactions/monthly ───────────────────────────────────────────
// Returns monthly income vs expense breakdown — fed directly into BarChart.
router.get("/monthly", async (req, res) => {
  try {
    const monthly = await Transaction.getMonthlyData(req.user.id);
    res.json({ success: true, monthly });
  } catch (error) {
    console.error("GET /transactions/monthly error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching monthly data" });
  }
});

// ─── POST /api/transactions ───────────────────────────────────────────────────
// Create a new transaction for the logged-in user.
// Body: { title, amount, type, category, date?, note? }
router.post("/", async (req, res) => {
  try {
    const { title, amount, type, category, date, note } = req.body;

    // Basic validation — Mongoose schema will also validate, but
    // catching this early gives a cleaner error message to the frontend
    if (!title || !amount || !type || !category) {
      return res.status(400).json({
        success: false,
        message: "title, amount, type, and category are required",
      });
    }

    const transaction = await Transaction.create({
      userId: req.user.id,   // always taken from the token, never from the body
      title,
      amount,
      type,
      category,
      date: date || Date.now(),
      note: note || "",
    });

    res.status(201).json({ success: true, transaction });
  } catch (error) {
    // Mongoose validation errors (e.g. invalid category enum)
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    console.error("POST /transactions error:", error.message);
    res.status(500).json({ success: false, message: "Server error creating transaction" });
  }
});

// ─── DELETE /api/transactions/:id ─────────────────────────────────────────────
// Delete a single transaction by its MongoDB _id.
// Verifies the transaction belongs to the logged-in user before deleting.
router.delete("/:id", async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    // Ownership check — prevent user A from deleting user B's transactions
    if (transaction.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await transaction.deleteOne();

    res.json({ success: true, message: "Transaction deleted", id: req.params.id });
  } catch (error) {
    // CastError happens when :id is not a valid MongoDB ObjectId
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid transaction ID" });
    }
    console.error("DELETE /transactions/:id error:", error.message);
    res.status(500).json({ success: false, message: "Server error deleting transaction" });
  }
});

module.exports = router;