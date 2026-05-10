import { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { api } from "../context/AuthContext";
import { useAuth } from "../context/AuthContext";

// ── Color palette for pie chart categories ────────────────────────────────────
const CAT_COLORS = {
  Food: "#f97316", Rent: "#3b82f6", Utilities: "#8b5cf6",
  Transport: "#06b6d4", Healthcare: "#ec4899", Shopping: "#f59e0b",
  Entertainment: "#10b981", Education: "#6366f1", Other: "#9ca3af",
  Salary: "#22c55e", Freelance: "#14b8a6", Investment: "#a855f7",
  Business: "#f43f5e", Gift: "#fb923c",
};
const FALLBACK_COLORS = ["#378ADD","#1d9e75","#f97316","#8b5cf6","#ec4899","#06b6d4"];

// ── Custom tooltip for BarChart ───────────────────────────────────────────────
const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const fmt = (n) => "₹" + (n || 0).toLocaleString("en-IN");
  return (
    <div style={{
      background: "#fff", border: "1px solid #ebebea",
      borderRadius: 10, padding: "10px 14px",
      fontFamily: "'DM Sans', sans-serif", fontSize: 13,
      boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
    }}>
      <div style={{ fontWeight: 600, marginBottom: 6, color: "#1a1a1a" }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color, marginBottom: 2 }}>
          {p.name === "income" ? "↑ Income" : "↓ Expense"}: {fmt(p.value)}
        </div>
      ))}
    </div>
  );
};

// ── Custom tooltip for PieChart ───────────────────────────────────────────────
const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const fmt = (n) => "₹" + (n || 0).toLocaleString("en-IN");
  return (
    <div style={{
      background: "#fff", border: "1px solid #ebebea",
      borderRadius: 10, padding: "9px 13px",
      fontFamily: "'DM Sans', sans-serif", fontSize: 13,
      boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
    }}>
      <span style={{ fontWeight: 600, color: "#1a1a1a" }}>{payload[0].name}</span>
      <span style={{ color: "#666", marginLeft: 8 }}>{fmt(payload[0].value)}</span>
    </div>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();

  const [summary, setSummary]   = useState({ income: 0, expense: 0, balance: 0 });
  const [monthly, setMonthly]   = useState([]);
  const [pieData, setPieData]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [sumRes, monthRes, txRes] = await Promise.all([
          api.get("/transactions/summary"),
          api.get("/transactions/monthly"),
          api.get("/transactions?type=expense"),
        ]);

        setSummary(sumRes.data.summary);
        setMonthly(monthRes.data.monthly);

        // Build pie data: group expenses by category
        const catMap = {};
        txRes.data.transactions.forEach(({ category, amount }) => {
          catMap[category] = (catMap[category] || 0) + amount;
        });
        setPieData(
          Object.entries(catMap).map(([name, value]) => ({ name, value }))
        );
      } catch (err) {
        setError("Failed to load dashboard data. Is your server running?");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const fmt = (n) => "₹" + Math.abs(n).toLocaleString("en-IN");
  const firstName = user?.name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  if (loading) return (
    <div style={{ textAlign: "center", padding: "80px 0", color: "#aaa", fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{
        width: 36, height: 36, border: "3px solid #eee",
        borderTop: "3px solid #378ADD", borderRadius: "50%",
        animation: "spin 0.8s linear infinite", margin: "0 auto 14px"
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      Loading your dashboard...
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        .dash { font-family: 'DM Sans', sans-serif; }

        /* ── Greeting ── */
        .dash-greeting { margin-bottom: 28px; }
        .dash-greeting-sub {
          font-size: 13px; color: #999; font-weight: 300; margin-bottom: 4px;
          letter-spacing: 0.03em; text-transform: uppercase;
        }
        .dash-greeting h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(26px, 3vw, 36px);
          color: #0f0f0d; font-weight: 700; margin: 0;
        }
        .dash-greeting h1 span {
          background: linear-gradient(90deg, #378ADD, #1d9e75);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ── Summary cards ── */
        .dash-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-bottom: 28px;
        }
        .dash-card {
          border-radius: 16px;
          padding: 20px 22px;
          position: relative;
          overflow: hidden;
        }
        .dash-card::after {
          content: attr(data-icon);
          position: absolute; right: 16px; bottom: 12px;
          font-size: 36px; opacity: 0.12;
          pointer-events: none;
        }
        .dash-card.balance {
          background: #0f0f0d; color: #fff;
          grid-column: span 1;
        }
        .dash-card.income  { background: #f0faf3; border: 1px solid #b8e8c5; }
        .dash-card.expense { background: #fff5f5; border: 1px solid #fcc8c8; }

        .dash-card-label {
          font-size: 11px; font-weight: 500;
          text-transform: uppercase; letter-spacing: 0.07em;
          margin-bottom: 10px;
        }
        .dash-card.balance .dash-card-label { color: #666; }
        .dash-card.income  .dash-card-label { color: #2d8a4e; }
        .dash-card.expense .dash-card-label { color: #c94040; }

        .dash-card-amount {
          font-family: 'DM Mono', monospace;
          font-size: clamp(20px, 2.5vw, 28px);
          font-weight: 500; line-height: 1;
        }
        .dash-card.balance .dash-card-amount { color: #fff; }
        .dash-card.income  .dash-card-amount { color: #1a6b3a; }
        .dash-card.expense .dash-card-amount { color: #a83232; }

        .dash-card-sub {
          font-size: 12px; margin-top: 6px; font-weight: 300;
        }
        .dash-card.balance .dash-card-sub {
          color: ${summary.balance >= 0 ? "#1d9e75" : "#f87171"};
        }
        .dash-card.income  .dash-card-sub { color: #4aac70; }
        .dash-card.expense .dash-card-sub { color: #e06060; }

        /* ── Charts row ── */
        .dash-charts {
          display: grid;
          grid-template-columns: 1fr 1.8fr;
          gap: 16px;
          margin-bottom: 20px;
        }
        .dash-chart-card {
          background: #fff;
          border: 1px solid #ebebea;
          border-radius: 16px;
          padding: 20px 20px 12px;
        }
        .dash-chart-title {
          font-size: 13px; font-weight: 600;
          color: #1a1a1a; margin-bottom: 4px;
        }
        .dash-chart-sub {
          font-size: 12px; color: #aaa; font-weight: 300;
          margin-bottom: 18px;
        }

        /* Empty state */
        .dash-empty {
          text-align: center; padding: 32px 0 20px;
          color: #bbb; font-size: 13px;
        }
        .dash-empty-icon { font-size: 28px; margin-bottom: 8px; }

        /* Error */
        .dash-error {
          background: #fff5f5; border: 1px solid #fcc8c8;
          border-radius: 12px; padding: 16px 20px;
          color: #c94040; font-size: 14px;
          margin-bottom: 24px;
        }

        /* Quick link */
        .dash-quick {
          display: flex; align-items: center; justify-content: space-between;
          background: linear-gradient(135deg, #f0faf3, #e8f4ff);
          border: 1px solid #d0eaff; border-radius: 14px;
          padding: 16px 20px;
        }
        .dash-quick-text { font-size: 14px; color: #333; }
        .dash-quick-text strong { font-weight: 600; color: #0f0f0d; }
        .dash-quick-link {
          font-size: 13px; font-weight: 500;
          background: #0f0f0d; color: #fff;
          padding: 8px 18px; border-radius: 8px;
          text-decoration: none;
          transition: background 0.13s;
        }
        .dash-quick-link:hover { background: #333; }

        @media (max-width: 680px) {
          .dash-cards { grid-template-columns: 1fr; }
          .dash-charts { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="dash">

        {/* Greeting */}
        <div className="dash-greeting">
          <div className="dash-greeting-sub">{greeting}</div>
          <h1>{greeting}, <span>{firstName}</span> 👋</h1>
        </div>

        {error && <div className="dash-error">⚠️ {error}</div>}

        {/* Summary cards */}
        <div className="dash-cards">
          <div className="dash-card balance" data-icon="⚖️">
            <div className="dash-card-label">Net Balance</div>
            <div className="dash-card-amount">{fmt(summary.balance)}</div>
            <div className="dash-card-sub">
              {summary.balance >= 0 ? "▲ Positive balance" : "▼ Overspent"}
            </div>
          </div>
          <div className="dash-card income" data-icon="💚">
            <div className="dash-card-label">↑ Total Income</div>
            <div className="dash-card-amount">{fmt(summary.income)}</div>
            <div className="dash-card-sub">All time earnings</div>
          </div>
          <div className="dash-card expense" data-icon="🔴">
            <div className="dash-card-label">↓ Total Expenses</div>
            <div className="dash-card-amount">{fmt(summary.expense)}</div>
            <div className="dash-card-sub">
              {summary.income > 0
                ? `${Math.round((summary.expense / summary.income) * 100)}% of income`
                : "No income yet"}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="dash-charts">

          {/* Pie chart */}
          <div className="dash-chart-card">
            <div className="dash-chart-title">Spending by category</div>
            <div className="dash-chart-sub">Expense breakdown</div>
            {pieData.length === 0 ? (
              <div className="dash-empty">
                <div className="dash-empty-icon">🥧</div>
                Add expenses to see breakdown
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={88}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell
                        key={entry.name}
                        fill={CAT_COLORS[entry.name] || FALLBACK_COLORS[i % FALLBACK_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend
                    iconType="circle" iconSize={8}
                    formatter={(v) => (
                      <span style={{ fontSize: 12, color: "#666" }}>{v}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Bar chart */}
          <div className="dash-chart-card">
            <div className="dash-chart-title">Monthly overview</div>
            <div className="dash-chart-sub">Income vs Expenses per month</div>
            {monthly.length === 0 ? (
              <div className="dash-empty">
                <div className="dash-empty-icon">📊</div>
                Add transactions to see monthly trends
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthly} barGap={4} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0ee" vertical={false} />
                  <XAxis
                    dataKey="month" tick={{ fontSize: 11, fill: "#aaa" }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#aaa" }}
                    axisLine={false} tickLine={false}
                    tickFormatter={(v) => "₹" + (v / 1000).toFixed(0) + "k"}
                  />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: "#f9f9f8" }} />
                  <Bar dataKey="income"  fill="#1d9e75" radius={[4,4,0,0]} name="income" />
                  <Bar dataKey="expense" fill="#f87171" radius={[4,4,0,0]} name="expense" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

        </div>

        {/* Quick link to transactions */}
        <div className="dash-quick">
          <div className="dash-quick-text">
            <strong>Ready to log a transaction?</strong><br />
            <span style={{ fontWeight: 300, fontSize: 13, color: "#666" }}>
              Add income or expenses and watch your charts update.
            </span>
          </div>
          <a href="/transactions" className="dash-quick-link">
            Add transaction →
          </a>
        </div>

      </div>
    </>
  );
};

export default DashboardPage;