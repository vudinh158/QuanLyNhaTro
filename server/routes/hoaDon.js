const express = require('express');
const router = express.Router();
const hoaDonController = require('../controllers/hoaDonController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router
  .route('/')
  .post(protect, restrictTo('invoice:create'), hoaDonController.createHoaDon) // Cập nhật cả quyền tạo hóa đơn
  // Sửa 'Xem hóa đơn' thành 'invoice:read_own_property'
  .get(protect, restrictTo('invoice:read_own_property'), hoaDonController.getAllHoaDon);

router
  .route('/:id')
  // Sửa 'Xem hóa đơn' thành 'invoice:read_own_property' (nếu áp dụng cho cả xem chi tiết)
  .get(protect, restrictTo('invoice:read_own_property'), hoaDonController.getHoaDon);

module.exports = router;