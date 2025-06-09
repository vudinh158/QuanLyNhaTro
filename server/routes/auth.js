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

const { protect } = require("../middlewares/authMiddleware");

// --- OTP endpoints ---
router.post("/send-otp", async (req, res, next) => {
  try {
    const result = await sendOtp(req.body.email);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/verify-otp", async (req, res, next) => {
  try {
    const result = await verifyOtp(req.body.email, req.body.code);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// --- Registration endpoints ---
router.post("/register-landlord", async (req, res, next) => {
  try {
    // Chỉ dành cho chủ trọ, client phải verify OTP trước khi gọi
    const user = await registerLandlord(req.body);
    res.json({ message: "Tạo tài khoản chủ trọ thành công", user });
  } catch (err) {
    next(err);
  }
});

// --- Authentication endpoints ---
router.post("/login", async (req, res, next) => {
  try {
    const data = await login(req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get("/me", protect, async (req, res, next) => {
  try {
    const profile = await getMe(req.user.id);
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
