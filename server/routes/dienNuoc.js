// clone nhatro/server/routes/dienNuoc.js
const express = require('express');
const router = express.Router();
const dienNuocController = require('../controllers/dienNuocController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router
  .route('/')
  .post(protect, restrictTo('electric_water:record_own_property'), dienNuocController.createDienNuoc)
  // Sửa đổi dòng này để cho phép cả hai quyền truy cập vào danh sách
  // electric_water:record_own_property cho Chủ trọ (ghi nhận)
  // electric_water:read-self cho Khách thuê (xem của mình)
  .get(protect, restrictTo('electric_water:record_own_property', 'electric_water:read-self'), dienNuocController.getAllDienNuoc);

router
  .route('/:id')
  // Sửa đổi dòng này để cho phép cả hai quyền truy cập vào chi tiết theo ID
  // electric_water:record_own_property cho Chủ trọ (sửa/xóa một bản ghi cụ thể)
  // electric_water:read-self cho Khách thuê (xem chi tiết một bản ghi của mình)
  .get(protect, restrictTo('electric_water:record_own_property', 'electric_water:read-self'), dienNuocController.getDienNuoc)
  .patch(protect, restrictTo('electric_water:record_own_property'), dienNuocController.updateDienNuoc)
  .delete(protect, restrictTo('electric_water:record_own_property'), dienNuocController.deleteDienNuoc);

module.exports = router;