const express = require('express');
const router = express.Router();
const phuongThucThanhToanController = require('../controllers/phuongThucThanhToanController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router
  .route('/')
  .post(protect, restrictTo('Tạo phương thức thanh toán'), phuongThucThanhToanController.createPhuongThucThanhToan)
  .get(protect, restrictTo('Xem phương thức thanh toán'), phuongThucThanhToanController.getAllPhuongThucThanhToan);

router
  .route('/:id')
  .get(protect, restrictTo('Xem phương thức thanh toán'), phuongThucThanhToanController.getPhuongThucThanhToan)
  .patch(protect, restrictTo('Sửa phương thức thanh toán'), phuongThucThanhToanController.updatePhuongThucThanhToan)
  .delete(protect, restrictTo('Xóa phương thức thanh toán'), phuongThucThanhToanController.deletePhuongThucThanhToan);

module.exports = router;