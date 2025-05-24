const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Endpoint đăng ký
router.post("/register", authController.register);

// Endpoint đăng nhập
router.post("/login", authController.login);


module.exports = router;
