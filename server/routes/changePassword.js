const express = require('express');
const bcrypt = require('bcryptjs');
const { UserAccount } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const requireAuth = require('../middlewares/requireAuth');

const router = express.Router();

// Tất cả các request tới đây đều đã được xác thực, gán req.userId
router.use(requireAuth);

/**
 * PUT /api/change-password
 * body: { currentPassword, newPassword }
 */
router.put(
  '/',
  catchAsync(async (req, res, next) => {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    // 1) Kiểm tra đầu vào
    if (!currentPassword || !newPassword) {
      throw new AppError('Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới.', 400);
    }

    // 2) Tìm User và so sánh mật khẩu hiện tại
    const user = await UserAccount.findByPk(userId);
    if (!user) {
      throw new AppError('Không tìm thấy người dùng.', 404);
    }
    const isMatch = await bcrypt.compare(currentPassword, user.MatKhau);
    if (!isMatch) {
      throw new AppError('Mật khẩu hiện tại không chính xác.', 400);
    }

    // 3) Cập nhật mật khẩu mới (hash tự động nếu model đã cài hook)
    user.MatKhau = newPassword;
    await user.save();

    // 4) Trả về kết quả
    res.status(200).json({
      status: 'success',
      message: 'Đổi mật khẩu thành công.',
    });
  })
);

module.exports = router;