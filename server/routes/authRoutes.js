const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ─── Helper: generate a signed JWT token ─────────────────────────────────────
// We only store the user's _id inside the token.
// The middleware will fetch full user details from DB on each request.
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }  // token is valid for 30 days
  );
};

// ─── POST /api/auth/register ──────────────────────────────────────────────────
// Create a new account.
// Body: { name, email, password }
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Basic presence check
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "name, email, and password are all required",
      });
    }

    // 2. Check if email is already registered
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // 3. Create the user — the pre("save") hook in User.js hashes the password
    const user = await User.create({ name, email, password });

    // 4. Generate a token so the user is immediately logged in after registering
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: user.toSafeObject(), // name, email, _id — no password hash
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    console.error("POST /auth/register error:", error.message);
    res.status(500).json({ success: false, message: "Server error during registration" });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
// Log in with email + password.
// Body: { email, password }
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Basic presence check
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "email and password are required",
      });
    }

    // 2. Find user by email
    //    We need the password field here (it's excluded by default via select)
    //    so we explicitly add it back with "+password"
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
      // Use a vague message — don't tell attackers whether the email exists
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 3. Compare the entered password with the stored bcrypt hash
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 4. All good — generate token and return user
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error("POST /auth/login error:", error.message);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
// Returns the currently logged-in user's profile.
// Useful on app startup to restore the session from a saved token.
// Protected — requires a valid JWT in the Authorization header.
const protect = require("../middleware/auth");

router.get("/me", protect, async (req, res) => {
  // req.user is already attached by the protect middleware
  res.json({
    success: true,
    user: req.user.toSafeObject(),
  });
});

module.exports = router;