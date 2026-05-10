import { useState } from "react";

const SAMPLE_TRANSACTIONS = [
  { _id: "1", title: "Salary", amount: 85000, type: "income", category: "Salary", date: "2024-04-01" },
  { _id: "2", title: "House Rent", amount: 15000, type: "expense", category: "Rent", date: "2024-04-02" },
  { _id: "3", title: "Grocery Shopping", amount: 3200, type: "expense", category: "Food", date: "2024-04-03" },
  { _id: "4", title: "Freelance Project", amount: 12000, type: "income", category: "Freelance", date: "2024-04-05" },
  { _id: "5", title: "Electricity Bill", amount: 1800, type: "expense", category: "Utilities", date: "2024-04-07" },
  { _id: "6", title: "Restaurant Dinner", amount: 2400, type: "expense", category: "Food", date: "2024-04-09" },
  { _id: "7", title: "Transport Pass", amount: 900, type: "expense", category: "Transport", date: "2024-04-10" },
  { _id: "8", title: "Dividend Income", amount: 5500, type: "income", category: "Investment", date: "2024-04-12" },
];

const CATEGORY_ICONS = {
  Salary: "💼", Freelance: "💻", Investment: "📈", Food: "🍽️",
  Rent: "🏠", Utilities: "⚡", Transport: "🚌", Other: "📦",
};

const FILTERS = ["All", "Income", "Expense"];

export default function TransactionList({
  transactions = SAMPLE_TRANSACTIONS,
  onDelete,
}) {
  const [filter, setFilter] = useState("All");
  const [deletingId, setDeletingId] = useState(null);
  const [localTx, setLocalTx] = useState(transactions);

  const filtered = localTx.filter((tx) => {
    if (filter === "Income") return tx.type === "income";
    if (filter === "Expense") return tx.type === "expense";
    return true;
  });

  const totalIncome = localTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = localTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const handleDelete = (id) => {
    setDeletingId(id);
    setTimeout(() => {
      setLocalTx((prev) => prev.filter((t) => t._id !== id));
      setDeletingId(null);
      if (onDelete) onDelete(id);
    }, 320);
  };

  const fmt = (n) => "₹" + n.toLocaleString("en-IN");
  const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        .tl-wrap {
          font-family: 'DM Sans', sans-serif;
          max-width: 680px;
          margin: 0 auto;
          padding: 0;
          color: #1a1a1a;
          background: transparent;
        }

        /* Summary strip */
        .tl-summary {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 18px;
        }
        .tl-sum-card {
          border-radius: 14px;
          padding: 14px 18px;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .tl-sum-card.inc { background: #f0faf3; border: 1px solid #b8e8c5; }
        .tl-sum-card.exp { background: #fff5f5; border: 1px solid #fcc8c8; }
        .tl-sum-label { font-size: 11px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; }
        .tl-sum-card.inc .tl-sum-label { color: #2d8a4e; }
        .tl-sum-card.exp .tl-sum-label { color: #c94040; }
        .tl-sum-amount { font-family: 'DM Mono', monospace; font-size: 20px; font-weight: 500; }
        .tl-sum-card.inc .tl-sum-amount { color: #1a6b3a; }
        .tl-sum-card.exp .tl-sum-amount { color: #a83232; }

        /* Filter pills */
        .tl-filters {
          display: flex;
          gap: 6px;
          margin-bottom: 14px;
        }
        .tl-pill {
          padding: 6px 16px;
          border-radius: 99px;
          font-size: 13px;
          font-weight: 500;
          border: 1.5px solid transparent;
          cursor: pointer;
          transition: all 0.15s;
          background: #f4f4f2;
          color: #666;
        }
        .tl-pill:hover { background: #ebebea; color: #333; }
        .tl-pill.active-all   { background: #1a1a1a; color: #fff; border-color: #1a1a1a; }
        .tl-pill.active-inc   { background: #f0faf3; color: #1a6b3a; border-color: #2d8a4e; }
        .tl-pill.active-exp   { background: #fff5f5; color: #a83232; border-color: #c94040; }

        /* List */
        .tl-list { display: flex; flex-direction: column; gap: 6px; }

        .tl-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid #ebebea;
          background: #fafaf9;
          transition: opacity 0.32s, transform 0.32s;
        }
        .tl-row:hover { border-color: #d8d8d5; background: #f5f5f3; }
        .tl-row.deleting { opacity: 0; transform: translateX(18px); }

        /* Left: icon bubble */
        .tl-icon {
          width: 38px; height: 38px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 17px;
          flex-shrink: 0;
        }
        .tl-icon.inc { background: #e8f9ee; }
        .tl-icon.exp { background: #fff0f0; }

        /* Middle: title + meta */
        .tl-info { flex: 1; min-width: 0; }
        .tl-title {
          font-size: 14px; font-weight: 500;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          color: #1a1a1a;
        }
        .tl-meta { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
        .tl-cat {
          font-size: 11px; font-weight: 500;
          padding: 2px 7px; border-radius: 99px;
          letter-spacing: 0.02em;
        }
        .inc .tl-cat { background: #d8f4e3; color: #256c3e; }
        .exp .tl-cat { background: #ffe2e2; color: #b03030; }
        .tl-date { font-size: 11px; color: #999; }

        /* Right: amount + delete */
        .tl-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .tl-amount {
          font-family: 'DM Mono', monospace;
          font-size: 15px; font-weight: 500;
          min-width: 84px; text-align: right;
        }
        .tl-amount.inc { color: #1a6b3a; }
        .tl-amount.exp { color: #a83232; }

        .tl-del {
          width: 28px; height: 28px;
          border-radius: 8px;
          border: 1px solid #e5e5e3;
          background: #f9f9f8;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.13s;
          color: #bbb;
          flex-shrink: 0;
        }
        .tl-del:hover { background: #fff0f0; border-color: #f5c0c0; color: #c94040; }

        /* Empty state */
        .tl-empty {
          text-align: center;
          padding: 40px 0 20px;
          color: #aaa;
          font-size: 14px;
        }
        .tl-empty-icon { font-size: 32px; margin-bottom: 10px; }

        /* Type prefix */
        .tl-prefix { font-size: 13px; font-weight: 600; }
        .tl-prefix.inc { color: #2d8a4e; }
        .tl-prefix.exp { color: #c94040; }
      `}</style>

      <div className="tl-wrap">

        {/* Summary */}
        <div className="tl-summary">
          <div className="tl-sum-card inc">
            <span className="tl-sum-label">↑ Total Income</span>
            <span className="tl-sum-amount">{fmt(totalIncome)}</span>
          </div>
          <div className="tl-sum-card exp">
            <span className="tl-sum-label">↓ Total Expenses</span>
            <span className="tl-sum-amount">{fmt(totalExpense)}</span>
          </div>
        </div>

        {/* Filter pills */}
        <div className="tl-filters">
          {FILTERS.map((f) => {
            const activeClass =
              filter === f
                ? f === "All" ? "active-all" : f === "Income" ? "active-inc" : "active-exp"
                : "";
            return (
              <button key={f} className={`tl-pill ${activeClass}`} onClick={() => setFilter(f)}>
                {f === "Income" ? "↑ Income" : f === "Expense" ? "↓ Expense" : "All"}
                {f !== "All" && (
                  <span style={{ marginLeft: 5, opacity: 0.6, fontWeight: 400 }}>
                    ({localTx.filter(t => t.type === f.toLowerCase()).length})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Rows */}
        <div className="tl-list">
          {filtered.length === 0 ? (
            <div className="tl-empty">
              <div className="tl-empty-icon">🗒️</div>
              No {filter !== "All" ? filter.toLowerCase() : ""} transactions yet
            </div>
          ) : (
            filtered.map((tx) => {
              const isInc = tx.type === "income";
              const typeClass = isInc ? "inc" : "exp";
              const icon = CATEGORY_ICONS[tx.category] || "📦";
              return (
                <div
                  key={tx._id}
                  className={`tl-row ${typeClass} ${deletingId === tx._id ? "deleting" : ""}`}
                >
                  {/* Icon */}
                  <div className={`tl-icon ${typeClass}`}>{icon}</div>

                  {/* Info */}
                  <div className="tl-info">
                    <div className="tl-title">{tx.title}</div>
                    <div className="tl-meta">
                      <span className="tl-cat">{tx.category}</span>
                      <span className="tl-date">{fmtDate(tx.date)}</span>
                    </div>
                  </div>

                  {/* Amount + Delete */}
                  <div className="tl-right">
                    <span className={`tl-amount ${typeClass}`}>
                      <span className={`tl-prefix ${typeClass}`}>{isInc ? "+" : "−"}</span>
                      {fmt(tx.amount)}
                    </span>
                    <button
                      className="tl-del"
                      onClick={() => handleDelete(tx._id)}
                      title="Delete transaction"
                    >
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M2 2l9 9M11 2L2 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </>
  );
}