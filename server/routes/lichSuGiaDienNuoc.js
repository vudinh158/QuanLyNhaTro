const express = require('express');
const router = express.Router();
const lichSuGiaDienNuocController = require('../controllers/lichSuGiaDienNuocController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router
  .route('/')
  .post(protect, restrictTo('Sửa giá điện nước'), lichSuGiaDienNuocController.createLichSuGiaDienNuoc)
  .get(protect, restrictTo('Xem lịch sử giá điện nước'), lichSuGiaDienNuocController.getAllLichSuGiaDienNuoc);

router
  .route('/:id')
  .get(protect, restrictTo('Xem lịch sử giá điện nước'), lichSuGiaDienNuocController.getLichSuGiaDienNuoc);

module.exports = router;