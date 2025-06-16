const express = require('express');
const router = express.Router();
const chiTietHoaDonController = require('../controllers/chiTietHoaDonController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

// Routes for Landlord
router
  .route('/')
  .post(
    protect,
    // restrictTo('Tạo chi tiết hóa đơn'),
    chiTietHoaDonController.createChiTietHoaDon
  )
  .get(
    protect,
    // restrictTo('Xem chi tiết hóa đơn'),
    chiTietHoaDonController.getAllChiTietHoaDon
  );

router
  .route('/:id')
  .get(
    protect,
    // restrictTo('Xem chi tiết hóa đơn'),
    chiTietHoaDonController.getChiTietHoaDon
  )
  .patch(
    protect,
    // restrictTo('Sửa chi tiết hóa đơn'),
    chiTietHoaDonController.updateChiTietHoaDon
  )
  .delete(
    protect,
    // restrictTo('Xóa chi tiết hóa đơn'),
    chiTietHoaDonController.deleteChiTietHoaDon
  );

module.exports = router;