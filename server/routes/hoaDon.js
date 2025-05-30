const express = require('express');
const router = express.Router();
const hoaDonController = require('../controllers/hoaDonController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router
  .route('/')
  .post(protect, restrictTo('Tạo hóa đơn'), hoaDonController.createHoaDon)
  .get(protect, restrictTo('Xem hóa đơn'), hoaDonController.getAllHoaDon);

router
  .route('/:id')
  .get(protect, restrictTo('Xem hóa đơn'), hoaDonController.getHoaDon);

module.exports = router;