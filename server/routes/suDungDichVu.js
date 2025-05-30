const express = require('express');
const router = express.Router();
const suDungDichVuController = require('../controllers/suDungDichVuController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router
  .route('/')
  .post(protect, restrictTo('Ghi nhận sử dụng dịch vụ'), suDungDichVuController.createSuDungDichVu)
  .get(protect, restrictTo('Xem sử dụng dịch vụ'), suDungDichVuController.getAllSuDungDichVu);

router
  .route('/:id')
  .get(protect, restrictTo('Xem sử dụng dịch vụ'), suDungDichVuController.getSuDungDichVu)
  .patch(protect, restrictTo('Sửa sử dụng dịch vụ'), suDungDichVuController.updateSuDungDichVu)
  .delete(protect, restrictTo('Xóa sử dụng dịch vụ'), suDungDichVuController.deleteSuDungDichVu);

module.exports = router;