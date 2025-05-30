const express = require('express');
const router = express.Router();
const dichVuController = require('../controllers/dichVuController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router
  .route('/')
  .post(protect, restrictTo('Tạo dịch vụ'), dichVuController.createDichVu)
  .get(protect, restrictTo('Xem dịch vụ'), dichVuController.getAllDichVu);

router
  .route('/:id')
  .get(protect, restrictTo('Xem dịch vụ'), dichVuController.getDichVu)
  .patch(protect, restrictTo('Sửa dịch vụ'), dichVuController.updateDichVu)
  .delete(protect, restrictTo('Xóa dịch vụ'), dichVuController.deleteDichVu);

module.exports = router;