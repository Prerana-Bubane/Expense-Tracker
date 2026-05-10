import { useState, useEffect } from "react";
import { api } from "../context/AuthContext";

const CATEGORIES = {
  income:  ["Salary", "Freelance", "Investment", "Business", "Gift", "Other"],
  expense: ["Food", "Rent", "Utilities", "Transport", "Healthcare", "Shopping", "Entertainment", "Education", "Other"],
};

const CATEGORY_ICONS = {
  Salary:"💼", Freelance:"💻", Investment:"📈", Business:"🏢", Gift:"🎁",
  Food:"🍽️", Rent:"🏠", Utilities:"⚡", Transport:"🚌", Healthcare:"🏥",
  Shopping:"🛍️", Entertainment:"🎬", Education:"📚", Other:"📦",
};

const EMPTY_FORM = { title: "", amount: "", type: "expense", category: "Food", date: "", note: "" };

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter]   = useState("All");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);

  // ── Fetch all transactions ────────────────────────────────────────────────
  const fetchTransactions = async () => {
    try {
      const { data } = await api.get("/transactions");
      setTransactions(data.transactions);
    } catch {
      // silently fail — user sees empty list
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  // ── Form helpers ──────────────────────────────────────────────────────────
  const update = (field) => (e) => {
    const val = e.target.value;
    setForm((f) => {
      const next = { ...f, [field]: val };
      // Reset category when type changes so it stays valid
      if (field === "type") {
        next.category = CATEGORIES[val][0];
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!form.title.trim()) return setFormError("Title is required.");
    if (!form.amount || Number(form.amount) <= 0) return setFormError("Enter a valid amount greater than 0.");

    setSubmitting(true);
    try {
      const { data } = await api.post("/transactions", {
        ...form,
        amount: Number(form.amount),
        date: form.date || new Date().toISOString(),
      });
      setTransactions((prev) => [data.transaction, ...prev]);
      setForm(EMPTY_FORM);
      setFormSuccess("Transaction added successfully!");
      setTimeout(() => setFormSuccess(""), 3000);
      setShowForm(false);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to add transaction.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions((prev) => prev.filter((t) => t._id !== id));
    } catch {
      // restore if delete fails
    } finally {
      setDeletingId(null);
    }
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const filtered = transactions.filter((t) => {
    if (filter === "Income")  return t.type === "income";
    if (filter === "Expense") return t.type === "expense";
    return true;
  });

  const totalIncome  = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const fmt     = (n) => "₹" + Math.abs(n).toLocaleString("en-IN");
  const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@500&display=swap');

        .tx { font-family: 'DM Sans', sans-serif; }

        /* ── Page header ── */
        .tx-header {
          display: flex; align-items: flex-start;
          justify-content: space-between; margin-bottom: 24px;
          flex-wrap: wrap; gap: 12px;
        }
        .tx-header h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(24px, 3vw, 32px);
          color: #0f0f0d; margin: 0 0 3px;
        }
        .tx-header-sub { font-size: 13px; color: #aaa; font-weight: 300; }

        .tx-add-btn {
          padding: 10px 20px;
          background: #0f0f0d; color: #fff;
          border: none; border-radius: 10px;
          font-size: 13px; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.13s;
          white-space: nowrap;
        }
        .tx-add-btn:hover { background: #333; transform: translateY(-1px); }
        .tx-add-btn.open  { background: #f4f4f2; color: #333; }

        /* ── Summary strip ── */
        .tx-summary {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 12px; margin-bottom: 20px;
        }
        .tx-sum {
          border-radius: 14px; padding: 16px 18px;
        }
        .tx-sum.inc { background: #f0faf3; border: 1px solid #b8e8c5; }
        .tx-sum.exp { background: #fff5f5; border: 1px solid #fcc8c8; }
        .tx-sum-label {
          font-size: 11px; font-weight: 500;
          text-transform: uppercase; letter-spacing: 0.06em;
          margin-bottom: 5px;
        }
        .tx-sum.inc .tx-sum-label { color: #2d8a4e; }
        .tx-sum.exp .tx-sum-label { color: #c94040; }
        .tx-sum-val {
          font-family: 'DM Mono', monospace;
          font-size: 22px; font-weight: 500;
        }
        .tx-sum.inc .tx-sum-val { color: #1a6b3a; }
        .tx-sum.exp .tx-sum-val { color: #a83232; }

        /* ── Add form ── */
        .tx-form-wrap {
          background: #fafaf9; border: 1px solid #ebebea;
          border-radius: 16px; padding: 22px;
          margin-bottom: 22px;
          animation: slideDown 0.2s ease;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tx-form-title {
          font-size: 14px; font-weight: 600;
          color: #0f0f0d; margin-bottom: 16px;
        }

        /* Type toggle */
        .type-toggle {
          display: flex; background: #f0f0ee;
          border-radius: 10px; padding: 3px; margin-bottom: 16px;
        }
        .type-btn {
          flex: 1; padding: 8px;
          border: none; background: transparent;
          border-radius: 8px; font-size: 13px;
          font-weight: 500; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s; color: #888;
        }
        .type-btn.active-inc { background: #fff; color: #1a6b3a; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
        .type-btn.active-exp { background: #fff; color: #a83232; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px; margin-bottom: 12px;
        }
        .form-field label {
          display: block; font-size: 11px; font-weight: 500;
          color: #555; text-transform: uppercase;
          letter-spacing: 0.05em; margin-bottom: 6px;
        }
        .form-field input,
        .form-field select {
          width: 100%; padding: 10px 13px;
          border: 1.5px solid #e8e8e5;
          border-radius: 9px; font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          color: #0f0f0d; background: #fff;
          outline: none; transition: border-color 0.13s;
        }
        .form-field input:focus,
        .form-field select:focus {
          border-color: #378ADD;
          box-shadow: 0 0 0 3px rgba(55,138,221,0.1);
        }
        .form-field.full { grid-column: span 2; }

        .form-actions { display: flex; gap: 10px; margin-top: 4px; }
        .form-submit {
          padding: 10px 24px;
          background: linear-gradient(135deg, #378ADD, #1d9e75);
          color: #fff; border: none; border-radius: 9px;
          font-size: 13px; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: opacity 0.13s;
          display: flex; align-items: center; gap: 7px;
        }
        .form-submit:hover:not(:disabled) { opacity: 0.88; }
        .form-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .form-cancel {
          padding: 10px 18px;
          background: none; border: 1.5px solid #e8e8e5;
          border-radius: 9px; font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          color: #888; cursor: pointer; transition: all 0.13s;
        }
        .form-cancel:hover { background: #f4f4f2; color: #333; }

        /* Form feedback */
        .form-feedback {
          border-radius: 9px; padding: 9px 13px;
          font-size: 13px; margin-bottom: 12px;
          display: flex; align-items: center; gap: 7px;
        }
        .form-feedback.err { background: #fff5f5; border: 1px solid #fcc8c8; color: #c94040; }
        .form-feedback.ok  { background: #f0faf3; border: 1px solid #b8e8c5; color: #1a6b3a; }

        /* Spinner */
        .spin { width: 13px; height: 13px; border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%;
          animation: s 0.7s linear infinite; }
        @keyframes s { to { transform: rotate(360deg); } }

        /* ── Filter pills ── */
        .tx-filters { display: flex; gap: 6px; margin-bottom: 14px; }
        .tx-pill {
          padding: 6px 16px; border-radius: 99px;
          font-size: 13px; font-weight: 500;
          border: 1.5px solid transparent;
          cursor: pointer; transition: all 0.13s;
          background: #f4f4f2; color: #666;
          font-family: 'DM Sans', sans-serif;
        }
        .tx-pill:hover { background: #ebebea; color: #333; }
        .tx-pill.f-all { background: #0f0f0d; color: #fff; }
        .tx-pill.f-inc { background: #f0faf3; color: #1a6b3a; border-color: #2d8a4e; }
        .tx-pill.f-exp { background: #fff5f5; color: #a83232; border-color: #c94040; }

        /* ── Transaction list ── */
        .tx-list { display: flex; flex-direction: column; gap: 6px; }
        .tx-row {
          display: flex; align-items: center; gap: 12px;
          padding: 13px 14px;
          border-radius: 12px; border: 1px solid #ebebea;
          background: #fafaf9; transition: all 0.2s;
        }
        .tx-row:hover { border-color: #d8d8d5; background: #f5f5f3; }
        .tx-row.deleting { opacity: 0; transform: translateX(14px); }

        .tx-icon {
          width: 38px; height: 38px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 17px; flex-shrink: 0;
        }
        .tx-icon.inc { background: #e8f9ee; }
        .tx-icon.exp { background: #fff0f0; }

        .tx-info { flex: 1; min-width: 0; }
        .tx-title {
          font-size: 14px; font-weight: 500; color: #1a1a1a;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .tx-meta { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
        .tx-cat {
          font-size: 11px; font-weight: 500;
          padding: 2px 7px; border-radius: 99px;
        }
        .inc .tx-cat { background: #d8f4e3; color: #256c3e; }
        .exp .tx-cat { background: #ffe2e2; color: #b03030; }
        .tx-date { font-size: 11px; color: #bbb; }
        .tx-note { font-size: 11px; color: #bbb; font-style: italic; }

        .tx-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .tx-amount {
          font-family: 'DM Mono', monospace;
          font-size: 15px; font-weight: 500;
          min-width: 90px; text-align: right;
        }
        .tx-amount.inc { color: #1a6b3a; }
        .tx-amount.exp { color: #a83232; }

        .tx-del {
          width: 28px; height: 28px; border-radius: 8px;
          border: 1px solid #e5e5e3; background: #f9f9f8;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.13s; color: #ccc;
        }
        .tx-del:hover { background: #fff0f0; border-color: #f5c0c0; color: #c94040; }

        /* Empty state */
        .tx-empty {
          text-align: center; padding: 48px 0 24px;
          color: #bbb; font-size: 14px;
        }
        .tx-empty-icon { font-size: 36px; margin-bottom: 12px; }

        /* Loading */
        .tx-loading {
          text-align: center; padding: 60px 0;
          color: #aaa; font-size: 13px;
        }

        @media (max-width: 600px) {
          .form-grid { grid-template-columns: 1fr; }
          .form-field.full { grid-column: span 1; }
          .tx-summary { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="tx">

        {/* Header */}
        <div className="tx-header">
          <div>
            <h1>Transactions</h1>
            <div className="tx-header-sub">
              {transactions.length} transaction{transactions.length !== 1 ? "s" : ""} recorded
            </div>
          </div>
          <button
            className={`tx-add-btn ${showForm ? "open" : ""}`}
            onClick={() => { setShowForm(f => !f); setFormError(""); setFormSuccess(""); }}
          >
            {showForm ? "✕ Cancel" : "+ Add transaction"}
          </button>
        </div>

        {/* Summary */}
        <div className="tx-summary">
          <div className="tx-sum inc">
            <div className="tx-sum-label">↑ Total Income</div>
            <div className="tx-sum-val">{fmt(totalIncome)}</div>
          </div>
          <div className="tx-sum exp">
            <div className="tx-sum-label">↓ Total Expenses</div>
            <div className="tx-sum-val">{fmt(totalExpense)}</div>
          </div>
        </div>

        {/* Global success toast */}
        {formSuccess && !showForm && (
          <div className="form-feedback ok">✅ {formSuccess}</div>
        )}

        {/* ── Add form ── */}
        {showForm && (
          <div className="tx-form-wrap">
            <div className="tx-form-title">New transaction</div>

            {/* Type toggle */}
            <div className="type-toggle">
              <button
                type="button"
                className={`type-btn ${form.type === "income" ? "active-inc" : ""}`}
                onClick={() => setForm(f => ({ ...f, type: "income", category: "Salary" }))}
              >
                ↑ Income
              </button>
              <button
                type="button"
                className={`type-btn ${form.type === "expense" ? "active-exp" : ""}`}
                onClick={() => setForm(f => ({ ...f, type: "expense", category: "Food" }))}
              >
                ↓ Expense
              </button>
            </div>

            {formError   && <div className="form-feedback err">⚠️ {formError}</div>}
            {formSuccess && <div className="form-feedback ok">✅ {formSuccess}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-field full">
                  <label>Title</label>
                  <input
                    type="text" placeholder="e.g. Monthly salary, Grocery run"
                    value={form.title} onChange={update("title")} required autoFocus
                  />
                </div>

                <div className="form-field">
                  <label>Amount (₹)</label>
                  <input
                    type="number" placeholder="0.00" min="0.01" step="0.01"
                    value={form.amount} onChange={update("amount")} required
                  />
                </div>

                <div className="form-field">
                  <label>Category</label>
                  <select value={form.category} onChange={update("category")}>
                    {CATEGORIES[form.type].map(c => (
                      <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Date</label>
                  <input
                    type="date" value={form.date} onChange={update("date")}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="form-field">
                  <label>Note (optional)</label>
                  <input
                    type="text" placeholder="Any extra detail..."
                    value={form.note} onChange={update("note")}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="form-submit" disabled={submitting}>
                  {submitting
                    ? <><div className="spin" /> Saving...</>
                    : `Add ${form.type}`
                  }
                </button>
                <button
                  type="button" className="form-cancel"
                  onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setFormError(""); }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter pills */}
        <div className="tx-filters">
          {["All", "Income", "Expense"].map(f => (
            <button
              key={f}
              className={`tx-pill ${filter === f ? f === "All" ? "f-all" : f === "Income" ? "f-inc" : "f-exp" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "Income" ? "↑ " : f === "Expense" ? "↓ " : ""}{f}
              {f !== "All" && (
                <span style={{ marginLeft: 5, opacity: 0.6, fontWeight: 400 }}>
                  ({transactions.filter(t => t.type === f.toLowerCase()).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Transaction rows */}
        {loading ? (
          <div className="tx-loading">
            <div style={{
              width: 28, height: 28, border: "2px solid #eee",
              borderTop: "2px solid #378ADD", borderRadius: "50%",
              animation: "s 0.8s linear infinite", margin: "0 auto 10px"
            }} />
            Loading transactions...
          </div>
        ) : (
          <div className="tx-list">
            {filtered.length === 0 ? (
              <div className="tx-empty">
                <div className="tx-empty-icon">🗒️</div>
                {filter === "All"
                  ? "No transactions yet — add your first one above"
                  : `No ${filter.toLowerCase()} transactions found`}
              </div>
            ) : (
              filtered.map(tx => {
                const isInc = tx.type === "income";
                const tc = isInc ? "inc" : "exp";
                return (
                  <div
                    key={tx._id}
                    className={`tx-row ${tc} ${deletingId === tx._id ? "deleting" : ""}`}
                  >
                    <div className={`tx-icon ${tc}`}>
                      {CATEGORY_ICONS[tx.category] || "📦"}
                    </div>
                    <div className="tx-info">
                      <div className="tx-title">{tx.title}</div>
                      <div className="tx-meta">
                        <span className="tx-cat">{tx.category}</span>
                        <span className="tx-date">{fmtDate(tx.date)}</span>
                        {tx.note && <span className="tx-note">· {tx.note}</span>}
                      </div>
                    </div>
                    <div className="tx-right">
                      <span className={`tx-amount ${tc}`}>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>
                          {isInc ? "+" : "−"}
                        </span>
                        {fmt(tx.amount)}
                      </span>
                      <button
                        className="tx-del"
                        onClick={() => handleDelete(tx._id)}
                        disabled={deletingId === tx._id}
                        title="Delete"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M1.5 1.5l9 9M10.5 1.5l-9 9"
                            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default TransactionsPage;