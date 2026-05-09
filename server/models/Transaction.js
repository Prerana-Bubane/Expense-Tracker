const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },

    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },

    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },

    type: {
      type: String,
      required: [true, "Type is required"],
      enum: {
        values: ["income", "expense"],
        message: "Type must be either 'income' or 'expense'",
      },
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: [
          // Income categories
          "Salary",
          "Freelance",
          "Investment",
          "Business",
          "Gift",
          // Expense categories
          "Food",
          "Rent",
          "Utilities",
          "Transport",
          "Healthcare",
          "Shopping",
          "Entertainment",
          "Education",
          // Fallback
          "Other",
        ],
        message: "Please select a valid category",
      },
    },

    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },

    note: {
      type: String,
      trim: true,
      maxlength: [300, "Note cannot exceed 300 characters"],
      default: "",
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// ─── Indexes for faster queries ───────────────────────────────────────────────
// When you fetch "all transactions for user X", MongoDB uses the userId index.
// The compound index speeds up filtered queries like "user X, expense only".
transactionSchema.index({ userId: 1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ userId: 1, date: -1 }); // -1 = newest first

// ─── Static method: get summary (total income, expense, balance) ──────────────
// Usage: const summary = await Transaction.getSummary(userId)
// This runs the aggregation inside the model — keeps your route files clean.
transactionSchema.statics.getSummary = async function (userId) {
  const result = await this.aggregate([
    {
      $match: { userId: new mongoose.Types.ObjectId(userId) },
    },
    {
      $group: {
        _id: "$type",          // group by "income" or "expense"
        total: { $sum: "$amount" },
      },
    },
  ]);

  // result looks like: [{ _id: "income", total: 85000 }, { _id: "expense", total: 22000 }]
  // We reshape it into a clean object:
  const summary = { income: 0, expense: 0, balance: 0 };
  result.forEach(({ _id, total }) => {
    summary[_id] = total;
  });
  summary.balance = summary.income - summary.expense;

  return summary;
};

// ─── Static method: get monthly breakdown ─────────────────────────────────────
// Usage: const monthly = await Transaction.getMonthlyData(userId)
// Returns array of { month: "Apr 2024", income: X, expense: Y } — used in BarChart
transactionSchema.statics.getMonthlyData = async function (userId) {
  const result = await this.aggregate([
    {
      $match: { userId: new mongoose.Types.ObjectId(userId) },
    },
    {
      $group: {
        _id: {
          year:  { $year: "$date" },
          month: { $month: "$date" },
          type:  "$type",
        },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // Reshape into { "Apr 2024": { income: X, expense: Y } }
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const map = {};
  result.forEach(({ _id, total }) => {
    const label = `${monthNames[_id.month - 1]} ${_id.year}`;
    if (!map[label]) map[label] = { month: label, income: 0, expense: 0 };
    map[label][_id.type] = total;
  });

  return Object.values(map); // array, ready to pass directly into Recharts BarChart
};

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;