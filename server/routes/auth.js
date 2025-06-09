const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");


// Endpoint đăng ký
router.post("/register", authController.register);

// Endpoint đăng nhập
router.post("/login", authController.login);

router.get("/me", protect, authController.getMe);

module.exports = router;
