import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

// ─── Base URL ─────────────────────────────────────────────────────────────────
// All API calls go through this base. Change once here if your backend URL changes.
const API_BASE = "http://localhost:5000/api";

// ─── Axios instance ───────────────────────────────────────────────────────────
// Every request made through `api` automatically gets the right base URL.
// We'll attach the Authorization header dynamically below.
export const api = axios.create({ baseURL: API_BASE });

// ─── Create the context ───────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ─── Provider component ───────────────────────────────────────────────────────
// Wrap your entire app with this so any component can access auth state.
// Usage in index.js:
//   <AuthProvider>
//     <App />
//   </AuthProvider>
export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);    // { _id, name, email, createdAt }
  const [token, setToken]     = useState(null);    // JWT string
  const [loading, setLoading] = useState(true);    // true while restoring session on startup

  // ── Attach token to every axios request automatically ──────────────────────
  // This interceptor runs before every `api` call.
  // When the token changes (login/logout), this always picks up the latest value.
  useEffect(() => {
    const interceptor = api.interceptors.request.use((config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        delete config.headers.Authorization;
      }
      return config;
    });

    // Clean up the old interceptor when token changes — prevents duplicates
    return () => api.interceptors.request.eject(interceptor);
  }, [token]);

  // ── Restore session on app startup ────────────────────────────────────────
  // When the page refreshes, check if a token exists in localStorage.
  // If it does, verify it's still valid by calling GET /api/auth/me.
  // If the token is expired or invalid, we clear it silently.
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem("expense_token");

      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        // Temporarily set the token so the interceptor can attach it
        setToken(savedToken);

        const { data } = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${savedToken}` },
        });

        if (data.success) {
          setUser(data.user);
          setToken(savedToken);
        }
      } catch {
        // Token expired or invalid — clear everything quietly
        localStorage.removeItem("expense_token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ── login() ───────────────────────────────────────────────────────────────
  // Call this from your LoginPage after the user submits the form.
  // Returns { success, message } so the page can show errors.
  //
  // Usage:
  //   const { login } = useAuth();
  //   const result = await login(email, password);
  //   if (!result.success) setError(result.message);
  const login = useCallback(async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });

      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("expense_token", data.token);
        return { success: true };
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Login failed. Please try again.";
      return { success: false, message };
    }
  }, []);

  // ── register() ────────────────────────────────────────────────────────────
  // Call this from your RegisterPage.
  // On success, user is automatically logged in (backend returns a token).
  //
  // Usage:
  //   const result = await register(name, email, password);
  //   if (!result.success) setError(result.message);
  const register = useCallback(async (name, email, password) => {
    try {
      const { data } = await api.post("/auth/register", { name, email, password });

      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("expense_token", data.token);
        return { success: true };
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Registration failed. Please try again.";
      return { success: false, message };
    }
  }, []);

  // ── logout() ──────────────────────────────────────────────────────────────
  // Clears token from memory and localStorage, resets user to null.
  // Call this from your Navbar or a logout button.
  //
  // Usage:
  //   const { logout } = useAuth();
  //   <button onClick={logout}>Log out</button>
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("expense_token");
  }, []);

  // ── Values exposed to all child components ─────────────────────────────────
  const value = {
    user,           // { _id, name, email } or null
    token,          // JWT string or null
    loading,        // true while restoring session — use to show a spinner
    isLoggedIn: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ─── useAuth hook ─────────────────────────────────────────────────────────────
// Import this in any component instead of importing AuthContext directly.
// Throws a helpful error if used outside of AuthProvider.
//
// Usage:
//   import { useAuth } from "../context/AuthContext";
//   const { user, login, logout, isLoggedIn } = useAuth();
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>. Wrap your app in AuthProvider.");
  }
  return context;
};