const express = require('express');
const router = express.Router();
const chiTietThanhToanController = require('../controllers/chiTietThanhToanController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router
  .route('/')
  .post(
    protect,
    // restrictTo('Ghi nhận thanh toán'),
    chiTietThanhToanController.createChiTietThanhToan
  )
  .get(
    protect,
    // restrictTo('Xem lịch sử thanh toán'),
    chiTietThanhToanController.getAllChiTietThanhToan
  );

router
  .route('/:id')
  .get(
    protect,
    // restrictTo('Xem lịch sử thanh toán'),
    chiTietThanhToanController.getChiTietThanhToan
  );

module.exports = router;