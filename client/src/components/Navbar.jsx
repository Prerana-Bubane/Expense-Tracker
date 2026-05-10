import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        .nav {
          font-family: 'DM Sans', sans-serif;
          background: #fff;
          border-bottom: 1px solid #ebebea;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 56px;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .nav-brand {
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .nav-link {
          font-size: 14px;
          font-weight: 500;
          color: #666;
          text-decoration: none;
          padding: 6px 14px;
          border-radius: 8px;
          transition: all 0.13s;
        }
        .nav-link:hover { background: #f4f4f2; color: #1a1a1a; }
        .nav-link.active { background: #f4f4f2; color: #1a1a1a; }
        .nav-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .nav-user {
          font-size: 13px;
          color: #888;
        }
        .nav-user span {
          color: #1a1a1a;
          font-weight: 500;
        }
        .nav-logout {
          font-size: 13px;
          font-weight: 500;
          padding: 6px 14px;
          border-radius: 8px;
          border: 1px solid #e5e5e3;
          background: #fff;
          color: #666;
          cursor: pointer;
          transition: all 0.13s;
          font-family: 'DM Sans', sans-serif;
        }
        .nav-logout:hover { background: #fff0f0; border-color: #f5c0c0; color: #c94040; }
      `}</style>

      <nav className="nav">
        {/* Brand */}
        <a href="/dashboard" className="nav-brand">
          💰 Expense Tracker
        </a>

        {/* Page links */}
        <div className="nav-links">
          <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
          <NavLink to="/transactions" className="nav-link">Transactions</NavLink>
        </div>

        {/* User + logout */}
        <div className="nav-right">
          {user && (
            <span className="nav-user">
              Hi, <span>{user.name.split(" ")[0]}</span>
            </span>
          )}
          <button className="nav-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;