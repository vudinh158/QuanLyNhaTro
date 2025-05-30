const express = require('express');
const router = express.Router();
const dienNuocController = require('../controllers/dienNuocController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router
  .route('/')
  .post(protect, restrictTo('Ghi chỉ số điện nước'), dienNuocController.createDienNuoc)
  .get(protect, restrictTo('Xem chỉ số điện nước'), dienNuocController.getAllDienNuoc);

router
  .route('/:id')
  .get(protect, restrictTo('Xem chỉ số điện nước'), dienNuocController.getDienNuoc)
  .patch(protect, restrictTo('Sửa chỉ số điện nước'), dienNuocController.updateDienNuoc)
  .delete(protect, restrictTo('Xóa chỉ số điện nước'), dienNuocController.deleteDienNuoc);

module.exports = router;