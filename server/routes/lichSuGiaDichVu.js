const express = require('express');
const router = express.Router();
const lichSuGiaDichVuController = require('../controllers/lichSuGiaDichVuController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router
  .route('/')
  .post(protect, restrictTo('Sửa giá dịch vụ'), lichSuGiaDichVuController.createLichSuGiaDichVu)
  .get(protect, restrictTo('Xem lịch sử giá dịch vụ'), lichSuGiaDichVuController.getAllLichSuGiaDichVu);

router
  .route('/:id')
  .get(protect, restrictTo('Xem lịch sử giá dịch vụ'), lichSuGiaDichVuController.getLichSuGiaDichVu);

module.exports = router;