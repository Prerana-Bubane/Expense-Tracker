import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]       = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  // Password strength helper
  const strength = (() => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 4) return { label: "Too short", color: "#c94040", width: "20%" };
    if (p.length < 6) return { label: "Weak", color: "#e06b20", width: "40%" };
    if (p.length < 10 && !/[A-Z]/.test(p)) return { label: "Fair", color: "#e0a020", width: "60%" };
    if (p.length >= 10 && /[A-Z]/.test(p) && /[0-9]/.test(p))
      return { label: "Strong", color: "#1d9e75", width: "100%" };
    return { label: "Good", color: "#378ADD", width: "80%" };
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      return setError("Passwords don't match — please check and try again.");
    }
    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    setLoading(true);
    const result = await register(form.name, form.email, form.password);

    if (result?.success) {
      navigate("/dashboard");
    } else {
      setError(result?.message || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .reg-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'DM Sans', sans-serif;
          background: #0f0f0d;
        }

        /* ── Left panel ── */
        .reg-left {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
          position: relative;
          overflow: hidden;
        }
        .reg-left::before {
          content: '';
          position: absolute;
          top: -100px; right: -100px;
          width: 450px; height: 450px;
          background: radial-gradient(circle, rgba(29,158,117,0.15) 0%, transparent 70%);
          pointer-events: none;
        }
        .reg-left::after {
          content: '';
          position: absolute;
          bottom: -60px; left: -60px;
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(55,138,221,0.1) 0%, transparent 70%);
          pointer-events: none;
        }
        .reg-brand {
          display: flex; align-items: center; gap: 10px;
          color: #fff; font-size: 15px; font-weight: 500;
          letter-spacing: 0.02em; position: relative; z-index: 1;
        }
        .reg-brand-icon {
          width: 32px; height: 32px;
          background: linear-gradient(135deg, #378ADD, #1d9e75);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
        }
        .reg-hero { position: relative; z-index: 1; }
        .reg-hero h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(34px, 3.5vw, 48px);
          color: #fff; line-height: 1.2; margin-bottom: 18px;
        }
        .reg-hero h1 em {
          font-style: italic;
          background: linear-gradient(90deg, #1d9e75, #378ADD);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .reg-hero p {
          color: #777; font-size: 14px; line-height: 1.8;
          max-width: 320px; font-weight: 300;
        }

        /* Steps */
        .reg-steps { position: relative; z-index: 1; }
        .reg-steps-title {
          font-size: 11px; text-transform: uppercase;
          letter-spacing: 0.08em; color: #444;
          margin-bottom: 16px; font-weight: 500;
        }
        .reg-step {
          display: flex; align-items: flex-start; gap: 14px;
          margin-bottom: 16px;
        }
        .reg-step-num {
          width: 26px; height: 26px; border-radius: 50%;
          border: 1px solid #333;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 500; color: #555;
          flex-shrink: 0; margin-top: 1px;
        }
        .reg-step-text { font-size: 13px; color: #555; line-height: 1.6; font-weight: 300; }
        .reg-step-text strong { color: #999; font-weight: 500; display: block; }

        /* ── Right panel (form) ── */
        .reg-right {
          background: #fff;
          display: flex; align-items: center; justify-content: center;
          padding: 48px 40px;
          border-radius: 24px 0 0 24px;
        }
        .reg-form-wrap { width: 100%; max-width: 380px; }
        .reg-form-title {
          font-family: 'Playfair Display', serif;
          font-size: 30px; color: #0f0f0d; margin-bottom: 6px;
        }
        .reg-form-sub {
          font-size: 14px; color: #888; margin-bottom: 32px; font-weight: 300;
        }
        .reg-form-sub a { color: #378ADD; text-decoration: none; font-weight: 500; }
        .reg-form-sub a:hover { text-decoration: underline; }

        /* Fields */
        .rfield { margin-bottom: 16px; }
        .rfield label {
          display: block; font-size: 12px; font-weight: 500;
          color: #444; letter-spacing: 0.05em;
          text-transform: uppercase; margin-bottom: 6px;
        }
        .rfield-wrap { position: relative; }
        .rfield input {
          width: 100%;
          padding: 12px 16px;
          border: 1.5px solid #e8e8e5;
          border-radius: 10px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          color: #0f0f0d;
          background: #fafaf9;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .rfield input:focus {
          border-color: #1d9e75;
          box-shadow: 0 0 0 3px rgba(29,158,117,0.1);
          background: #fff;
        }
        .rfield input.has-toggle { padding-right: 44px; }
        .rfield input.mismatch { border-color: #c94040; }
        .toggle-btn {
          position: absolute; right: 13px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #aaa; font-size: 15px; padding: 0;
        }
        .toggle-btn:hover { color: #555; }

        /* Password strength bar */
        .strength-bar-wrap {
          margin-top: 8px;
          height: 3px; background: #f0f0ee; border-radius: 99px; overflow: hidden;
        }
        .strength-bar {
          height: 100%; border-radius: 99px;
          transition: width 0.3s, background 0.3s;
        }
        .strength-label {
          font-size: 11px; margin-top: 4px;
          font-weight: 500;
        }

        /* Error */
        .reg-error {
          background: #fff5f5; border: 1px solid #fcc8c8;
          border-radius: 10px; padding: 11px 14px;
          font-size: 13px; color: #c94040;
          margin-bottom: 16px;
          display: flex; align-items: center; gap: 8px;
        }

        /* Submit */
        .reg-btn {
          width: 100%; padding: 13px;
          background: linear-gradient(135deg, #1d9e75, #378ADD);
          color: #fff; border: none; border-radius: 10px;
          font-size: 14px; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; letter-spacing: 0.02em;
          transition: all 0.15s; margin-top: 6px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .reg-btn:hover:not(:disabled) {
          opacity: 0.9; transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(29,158,117,0.25);
        }
        .reg-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Terms note */
        .reg-terms {
          font-size: 11.5px; color: #bbb; text-align: center;
          margin-top: 16px; line-height: 1.6; font-weight: 300;
        }

        @media (max-width: 700px) {
          .reg-root { grid-template-columns: 1fr; }
          .reg-left { display: none; }
          .reg-right { border-radius: 0; }
        }
      `}</style>

      <div className="reg-root">

        {/* Left — hero */}
        <div className="reg-left">
          <div className="reg-brand">
            <div className="reg-brand-icon">💰</div>
            Expense Tracker
          </div>

          <div className="reg-hero">
            <h1>Start your<br /><em>financial clarity</em><br />journey.</h1>
            <p>Join thousands tracking smarter. Free forever, no credit card required, no surprises.</p>
          </div>

          <div className="reg-steps">
            <div className="reg-steps-title">How it works</div>
            <div className="reg-step">
              <div className="reg-step-num">1</div>
              <div className="reg-step-text">
                <strong>Create your account</strong>
                Takes 30 seconds. Just name, email, password.
              </div>
            </div>
            <div className="reg-step">
              <div className="reg-step-num">2</div>
              <div className="reg-step-text">
                <strong>Add transactions</strong>
                Log income and expenses with category and date.
              </div>
            </div>
            <div className="reg-step">
              <div className="reg-step-num">3</div>
              <div className="reg-step-text">
                <strong>See the big picture</strong>
                Charts and summaries update in real time.
              </div>
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div className="reg-right">
          <div className="reg-form-wrap">
            <h2 className="reg-form-title">Create account</h2>
            <p className="reg-form-sub">
              Already have one? <Link to="/login">Sign in</Link>
            </p>

            {error && (
              <div className="reg-error"><span>⚠️</span> {error}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="rfield">
                <label>Full name</label>
                <input
                  type="text"
                  placeholder="Arjun Sharma"
                  value={form.name}
                  onChange={update("name")}
                  required autoFocus
                />
              </div>

              <div className="rfield">
                <label>Email address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={update("email")}
                  required
                />
              </div>

              <div className="rfield">
                <label>Password</label>
                <div className="rfield-wrap">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    className="has-toggle"
                    value={form.password}
                    onChange={update("password")}
                    required
                  />
                  <button type="button" className="toggle-btn"
                    onClick={() => setShowPass(p => !p)}>
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
                {strength && (
                  <>
                    <div className="strength-bar-wrap">
                      <div className="strength-bar"
                        style={{ width: strength.width, background: strength.color }} />
                    </div>
                    <div className="strength-label" style={{ color: strength.color }}>
                      {strength.label}
                    </div>
                  </>
                )}
              </div>

              <div className="rfield">
                <label>Confirm password</label>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Repeat your password"
                  className={form.confirm && form.confirm !== form.password ? "mismatch" : ""}
                  value={form.confirm}
                  onChange={update("confirm")}
                  required
                />
              </div>

              <button type="submit" className="reg-btn" disabled={loading}>
                {loading
                  ? <><div className="btn-spinner" /> Creating account...</>
                  : "Create my account →"
                }
              </button>
            </form>

            <p className="reg-terms">
              By registering you agree to keep your password safe.<br />
              Your data belongs to you, always.
            </p>
          </div>
        </div>

      </div>
    </>
  );
};

export default RegisterPage;