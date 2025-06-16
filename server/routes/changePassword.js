const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { UserAccount } = require('../models');

// Đổi mật khẩu
router.put('/', async (req, res) => {
  const userId = req.userId; // Lấy từ middleware requireAuth
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ các trường.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'Mật khẩu mới và xác nhận mật khẩu không khớp.' });
  }

  try {
    const userAccount = await UserAccount.findByPk(userId);
    if (!userAccount) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });
    }

    // So sánh mật khẩu hiện tại với mật khẩu trong DB
    const isMatch = await bcrypt.compare(currentPassword, userAccount.MatKhau);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng.' });
    }
    
    // Băm mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);


    // Cập nhật mật khẩu mới
    userAccount.MatKhau = hashedPassword;
    await userAccount.save();

    res.json({ message: 'Đổi mật khẩu thành công.' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi, vui lòng thử lại.' });
  }
});

module.exports = router;