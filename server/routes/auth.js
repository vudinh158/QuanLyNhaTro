const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getMe,
  sendOtp,
  verifyOtp,
  registerLandlord,
} = require("../controllers/authController");

const authController = require("../controllers/authController");

const { protect } = require("../middlewares/authMiddleware");

// --- OTP endpoints ---
router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);

// --- Registration endpoints ---
router.post("/register-landlord", authController.register);

// --- Authentication endpoints ---
router.post("/login", authController.login);

router.get("/me", protect, authController.getMe);

module.exports = router;
