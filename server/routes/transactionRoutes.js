const express = require("express");
const router  = express.Router();
const Transaction = require("../models/Transaction");
const protect = require("../middleware/auth");

router.use(protect);

// ── GET /api/transactions ─────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { type, category, month, year } = req.query;
    const filter = { userId: req.user.id };
    if (type)     filter.type = type;
    if (category) filter.category = category;
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end   = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    } else if (year) {
      const start = new Date(year, 0, 1);
      const end   = new Date(year, 11, 31, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }
    const transactions = await Transaction.find(filter).sort({ date: -1 }).lean();
    res.json({ success: true, count: transactions.length, transactions });
  } catch (error) {
    console.error("GET /transactions error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching transactions" });
  }
});

// ── GET /api/transactions/summary ─────────────────────────────────────────────
// Supports ?month=4&year=2024 for filtered summary
router.get("/summary", async (req, res) => {
  try {
    const { month, year } = req.query;
    const mongoose = require("mongoose");
    const matchStage = { userId: new mongoose.Types.ObjectId(req.user.id) };

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end   = new Date(year, month, 0, 23, 59, 59);
      matchStage.date = { $gte: start, $lte: end };
    } else if (year) {
      const start = new Date(year, 0, 1);
      const end   = new Date(year, 11, 31, 23, 59, 59);
      matchStage.date = { $gte: start, $lte: end };
    }

    const result = await Transaction.aggregate([
      { $match: matchStage },
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]);

    const summary = { income: 0, expense: 0, balance: 0 };
    result.forEach(({ _id, total }) => { summary[_id] = total; });
    summary.balance = summary.income - summary.expense;

    res.json({ success: true, summary });
  } catch (error) {
    console.error("GET /transactions/summary error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching summary" });
  }
});

// ── GET /api/transactions/monthly ─────────────────────────────────────────────
router.get("/monthly", async (req, res) => {
  try {
    const monthly = await Transaction.getMonthlyData(req.user.id);
    res.json({ success: true, monthly });
  } catch (error) {
    console.error("GET /transactions/monthly error:", error.message);
    res.status(500).json({ success: false, message: "Server error fetching monthly data" });
  }
});

// ── POST /api/transactions ─────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { title, amount, type, category, date, note } = req.body;
    if (!title || !amount || !type || !category) {
      return res.status(400).json({ success: false, message: "title, amount, type, and category are required" });
    }
    const transaction = await Transaction.create({
      userId: req.user.id, title, amount, type, category,
      date: date || Date.now(), note: note || "",
    });
    res.status(201).json({ success: true, transaction });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    console.error("POST /transactions error:", error.message);
    res.status(500).json({ success: false, message: "Server error creating transaction" });
  }
});

// ── DELETE /api/transactions/:id ──────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }
    if (transaction.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    await transaction.deleteOne();
    res.json({ success: true, message: "Transaction deleted", id: req.params.id });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid transaction ID" });
    }
    console.error("DELETE /transactions/:id error:", error.message);
    res.status(500).json({ success: false, message: "Server error deleting transaction" });
  }
});

module.exports = router;