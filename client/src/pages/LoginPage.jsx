import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);

    if (result?.success) {
      navigate("/dashboard");
    } else {
      setError(result?.message || "Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'DM Sans', sans-serif;
          background: #0f0f0d;
        }

        /* ── Left panel ── */
        .login-left {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
          background: #0f0f0d;
          position: relative;
          overflow: hidden;
        }
        .login-left::before {
          content: '';
          position: absolute;
          top: -120px; left: -120px;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(55,138,221,0.15) 0%, transparent 70%);
          pointer-events: none;
        }
        .login-left::after {
          content: '';
          position: absolute;
          bottom: -80px; right: -80px;
          width: 350px; height: 350px;
          background: radial-gradient(circle, rgba(29,158,117,0.1) 0%, transparent 70%);
          pointer-events: none;
        }
        .login-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #fff;
          font-size: 15px;
          font-weight: 500;
          letter-spacing: 0.02em;
          position: relative;
          z-index: 1;
        }
        .login-brand-icon {
          width: 32px; height: 32px;
          background: linear-gradient(135deg, #378ADD, #1d9e75);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
        }
        .login-hero {
          position: relative;
          z-index: 1;
        }
        .login-hero h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(36px, 4vw, 52px);
          color: #fff;
          line-height: 1.15;
          margin-bottom: 20px;
        }
        .login-hero h1 em {
          font-style: italic;
          background: linear-gradient(90deg, #378ADD, #1d9e75);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .login-hero p {
          color: #888;
          font-size: 15px;
          line-height: 1.7;
          max-width: 340px;
          font-weight: 300;
        }
        .login-stats {
          display: flex;
          gap: 32px;
          position: relative;
          z-index: 1;
        }
        .login-stat-val {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          color: #fff;
        }
        .login-stat-label {
          font-size: 12px;
          color: #555;
          margin-top: 2px;
          font-weight: 300;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        /* ── Right panel (form) ── */
        .login-right {
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 40px;
          border-radius: 24px 0 0 24px;
        }
        .login-form-wrap {
          width: 100%;
          max-width: 380px;
        }
        .login-form-title {
          font-family: 'Playfair Display', serif;
          font-size: 30px;
          color: #0f0f0d;
          margin-bottom: 6px;
        }
        .login-form-sub {
          font-size: 14px;
          color: #888;
          margin-bottom: 36px;
          font-weight: 300;
        }
        .login-form-sub a {
          color: #378ADD;
          text-decoration: none;
          font-weight: 500;
        }
        .login-form-sub a:hover { text-decoration: underline; }

        /* Fields */
        .field { margin-bottom: 18px; }
        .field label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: #444;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 7px;
        }
        .field-wrap { position: relative; }
        .field input {
          width: 100%;
          padding: 13px 16px;
          border: 1.5px solid #e8e8e5;
          border-radius: 10px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          color: #0f0f0d;
          background: #fafaf9;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          font-weight: 400;
        }
        .field input:focus {
          border-color: #378ADD;
          box-shadow: 0 0 0 3px rgba(55,138,221,0.1);
          background: #fff;
        }
        .field input.has-toggle { padding-right: 44px; }
        .toggle-btn {
          position: absolute;
          right: 14px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          cursor: pointer; color: #aaa;
          font-size: 15px; padding: 0;
          line-height: 1;
        }
        .toggle-btn:hover { color: #555; }

        /* Error */
        .login-error {
          background: #fff5f5;
          border: 1px solid #fcc8c8;
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 13px;
          color: #c94040;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Submit */
        .login-btn {
          width: 100%;
          padding: 14px;
          background: #0f0f0d;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          letter-spacing: 0.02em;
          transition: all 0.15s;
          margin-top: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          position: relative;
          overflow: hidden;
        }
        .login-btn:hover:not(:disabled) {
          background: #222;
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }
        .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Spinner */
        .btn-spinner {
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Divider */
        .login-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0 20px;
        }
        .login-divider hr {
          flex: 1; border: none;
          border-top: 1px solid #eee;
        }
        .login-divider span { font-size: 12px; color: #bbb; font-weight: 300; }

        /* Demo hint */
        .demo-hint {
          background: #f5f9ff;
          border: 1px solid #dbeafe;
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 12.5px;
          color: #4a7fc1;
          line-height: 1.6;
        }
        .demo-hint strong { font-weight: 500; display: block; margin-bottom: 2px; color: #2a5ca8; }

        /* Mobile */
        @media (max-width: 700px) {
          .login-root { grid-template-columns: 1fr; }
          .login-left { display: none; }
          .login-right { border-radius: 0; }
        }
      `}</style>

      <div className="login-root">

        {/* Left — hero panel */}
        <div className="login-left">
          <div className="login-brand">
            <div className="login-brand-icon">💰</div>
            Expense Tracker
          </div>

          <div className="login-hero">
            <h1>Know where your<br /><em>money goes.</em></h1>
            <p>Track income and expenses, visualize spending patterns, and take control of your financial story — one transaction at a time.</p>
          </div>

          <div className="login-stats">
            <div>
              <div className="login-stat-val">₹0</div>
              <div className="login-stat-label">Hidden expenses</div>
            </div>
            <div>
              <div className="login-stat-val">100%</div>
              <div className="login-stat-label">Clarity</div>
            </div>
            <div>
              <div className="login-stat-val">∞</div>
              <div className="login-stat-label">Control</div>
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div className="login-right">
          <div className="login-form-wrap">
            <h2 className="login-form-title">Welcome back</h2>
            <p className="login-form-sub">
              No account yet?{" "}
              <Link to="/register">Create one free</Link>
            </p>

            {error && (
              <div className="login-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Email address</label>
                <div className="field-wrap">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="field">
                <label>Password</label>
                <div className="field-wrap">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    className="has-toggle"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-btn"
                    onClick={() => setShowPass((p) => !p)}
                    aria-label="Toggle password visibility"
                  >
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="login-btn"
                disabled={loading}
              >
                {loading ? (
                  <><div className="btn-spinner" /> Signing in...</>
                ) : (
                  "Sign in →"
                )}
              </button>
            </form>

            <div className="login-divider">
              <hr /><span>testing locally?</span><hr />
            </div>

            <div className="demo-hint">
              <strong>💡 Quick tip</strong>
              Register an account first, then come back here to log in. Your data is private to your account.
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default LoginPage;