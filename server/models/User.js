// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//   name: String,
//   email: { type: String, required: true, unique: true },
//   password: String,
// });

// export default mongoose.model("User", userSchema);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// ─── Hash password before saving ────────────────────────────────────────────
// This runs automatically every time a user is created or their password changes.
// We skip hashing if the password field wasn't modified (e.g. updating name only).
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Instance method: compare password at login ──────────────────────────────
// Usage: const isMatch = await user.matchPassword(enteredPassword)
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ─── Instance method: return user without password ───────────────────────────
// Usage: res.json(user.toSafeObject())  — never send the hash to the client
userSchema.methods.toSafeObject = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model("User", userSchema);

module.exports = User;
