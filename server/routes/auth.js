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

/**
 * 1) Gửi OTP
 * - Chỉ nhận email hợp lệ
 */
router.post(
  "/send-otp",
  body("email").isEmail().withMessage("Email không hợp lệ"),
  async (req, res, next) => {
    // Kiểm tra validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const result = await sendOtp(req.body.email);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * 2) Xác thực OTP
 * - Email phải hợp lệ
 * - Code phải là 6 chữ số
 */
router.post(
  "/verify-otp",
  [
    body("email").isEmail().withMessage("Email không hợp lệ"),
    body("code")
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP phải gồm 6 chữ số")
      .isNumeric()
      .withMessage("OTP chỉ chứa số"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const result = await verifyOtp(req.body.email, req.body.code);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * 3) Đăng ký Chủ Trọ (sau khi OTP đã xác thực)
 * - Ràng buộc tất cả các trường quan trọng
 */
router.post(
  "/register-landlord",
  [
    body("TenDangNhap")
      .isLength({ min: 4 })
      .withMessage("Tên đăng nhập tối thiểu 4 ký tự"),
    body("HoTen").notEmpty().withMessage("Họ và tên không được để trống"),
    body("MatKhau")
      .isLength({ min: 6 })
      .withMessage("Mật khẩu tối thiểu 6 ký tự"),
    body("SoDienThoai")
      .matches(/^0\d{9}$/)
      .withMessage("Số điện thoại không hợp lệ (10 chữ số, bắt đầu 0)"),
    body("Email").isEmail().withMessage("Email không hợp lệ"),
    body("CCCD")
      .optional()
      .isLength({ min: 12, max: 12 })
      .withMessage("CCCD phải gồm 12 chữ số"),
    body("NgaySinh")
      .optional()
      .isISO8601()
      .withMessage("Ngày sinh không đúng định dạng YYYY-MM-DD"),
    body("GioiTinh")
      .isIn(["Nam", "Nữ", "Khác"])
      .withMessage("Giới tính không hợp lệ"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Trả về mảng errors để frontend hiển thị
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      // Gọi service đã verify OTP từ trước
      const user = await registerLandlord(req.body);
      res.json({ message: "Tạo chủ trọ thành công", user });
    } catch (err) {
      next(err);
    }
  }
);

// Các route còn lại
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);

module.exports = router;
