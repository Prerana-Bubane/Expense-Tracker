const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ─── protect middleware ───────────────────────────────────────────────────────
// Add this to any route you want to lock behind login.
// It reads the JWT from the Authorization header, verifies it,
// fetches the user from DB, and attaches them to req.user.
//
// Usage in a route file:
//   const protect = require("../middleware/auth");
//   router.get("/secret", protect, (req, res) => { ... })
//
// Or protect ALL routes in a file at once:
//   router.use(protect);

const protect = async (req, res, next) => {
  try {
    // 1. Check the Authorization header exists and starts with "Bearer"
    //    Frontend must send: Authorization: Bearer <token>
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized — no token provided",
      });
    }

    // 2. Extract the token (everything after "Bearer ")
    const token = authHeader.split(" ")[1];

    // 3. Verify the token using our secret key
    //    If the token is fake, expired, or tampered — this throws an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded looks like: { id: "64abc...", iat: 1712000000, exp: 1714592000 }

    // 4. Fetch the user from DB to make sure they still exist
    //    .select("-password") means: get everything EXCEPT the password hash
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized — user no longer exists",
      });
    }

    // 5. Attach user to the request object
    //    Now every protected route can access req.user._id, req.user.email, etc.
    req.user = user;

    next(); // hand control to the actual route handler
  } catch (error) {
    // jwt.verify throws specific errors we can give helpful messages for
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Not authorized — invalid token",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Not authorized — token has expired, please log in again",
      });
    }
    console.error("Auth middleware error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = protect;