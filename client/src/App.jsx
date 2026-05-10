import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import ProtectedRoute  from "./components/ProtectedRoute";
import Navbar          from "./components/Navbar";
import LoginPage       from "./pages/LoginPage";
import RegisterPage    from "./pages/RegisterPage";
import DashboardPage   from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";

// ─── GuestRoute ───────────────────────────────────────────────────────────────
// Opposite of ProtectedRoute — redirects logged-in users away from /login and
// /register (no point showing the login form to someone already logged in).
const GuestRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return null; // wait silently — ProtectedRoute handles the spinner
  if (isLoggedIn) return <Navigate to="/dashboard" replace />;
  return children;
};

// ─── Layout ───────────────────────────────────────────────────────────────────
// Wraps protected pages with the Navbar.
// Guest pages (login, register) don't get the Navbar.
const AppLayout = ({ children }) => (
  <>
    <Navbar />
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
      {children}
    </main>
  </>
);

// ─── App ──────────────────────────────────────────────────────────────────────
const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Guest-only routes (redirect to /dashboard if already logged in) ── */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />

        {/* ── Protected routes (redirect to /login if not logged in) ── */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <DashboardPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <AppLayout>
                <TransactionsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* ── Default redirect ── */}
        {/* Anyone hitting "/" goes to /dashboard (ProtectedRoute handles the rest) */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* ── 404 fallback ── */}
        <Route
          path="*"
          element={
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              height: "100vh", fontFamily: "DM Sans, sans-serif", gap: 12
            }}>
              <span style={{ fontSize: 48 }}>🧭</span>
              <h2 style={{ margin: 0, color: "#1a1a1a" }}>Page not found</h2>
              <a href="/dashboard" style={{ color: "#378ADD", fontSize: 14 }}>
                ← Back to Dashboard
              </a>
            </div>
          }
        />

      </Routes>
    </BrowserRouter>
  );
};

export default App;