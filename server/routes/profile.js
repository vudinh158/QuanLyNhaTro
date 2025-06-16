const express = require('express');
const router = express.Router();
const { Landlord, UserAccount } = require('../models');

// Lấy thông tin cá nhân
router.get('/', async (req, res) => {
  // req.userId = id tài khoản đã đăng nhập (thường có từ middleware xác thực)
  const userId = req.userId;
  const landlord = await Landlord.findOne({
    where: { MaTK: userId },
    include: [{ model: UserAccount, as: 'userAccount' }]
  });
  if (!landlord) return res.status(404).json({ message: "Not found" });
  res.json({
  HoTen: landlord.HoTen,
  CCCD: landlord.CCCD,
  SoDienThoai: landlord.SoDienThoai,
  NgaySinh: landlord.NgaySinh,
  GioiTinh: landlord.GioiTinh,
  Email: landlord.Email,
  createdAt: landlord.userAccount.NgayTao,
  userAccount: landlord.userAccount,
});
});

// Cập nhật thông tin
router.put('/', async (req, res) => {
  const userId = req.userId;
  const { HoTen, CCCD, SoDienThoai, NgaySinh, GioiTinh, Email } = req.body;
  try {
    const landlord = await Landlord.findOne({ where: { MaTK: userId } });
    if (!landlord) return res.status(404).json({ message: "Not found" });
    landlord.HoTen = HoTen;
    landlord.CCCD = CCCD;
    landlord.SoDienThoai = SoDienThoai;
    landlord.NgaySinh = NgaySinh;
    landlord.GioiTinh = GioiTinh;
    landlord.Email = Email;
    await landlord.save();
    res.json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

module.exports = router;
