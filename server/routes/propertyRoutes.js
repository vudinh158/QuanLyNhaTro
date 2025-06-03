// apps/server-express/src/routes/propertyRoutes.js
const express = require('express');
const propertyController = require('../controllers/propertyController');
const { protect, restrictToRole, restrictTo } = require('../middlewares/authMiddleware'); // Chọn 1 trong 2 cách phân quyền

const router = express.Router();

router.use(protect);

// // Nếu dùng phân quyền dựa trên vai trò đơn giản:
// router.use(restrictToRole('Chủ trọ')); // Tất cả các API Nhà Trọ chỉ dành cho "Chủ trọ"

// Nếu dùng phân quyền chi tiết dựa trên Permission:
// (Bạn cần đảm bảo đã seed dữ liệu cho Quyen và VaiTro_Quyen,
// và middleware protect đã load đúng req.user.permissions)
// Ví dụ:
router.route('/')
  .get(restrictTo('property:read_own'), propertyController.getMyProperties)
  .post(restrictTo('property:create'), propertyController.createProperty);
router.route('/:id')
  .get(restrictTo('property:read_own'), propertyController.getPropertyById)
  .patch(restrictTo('property:update_own'), propertyController.updateProperty)
  .delete(restrictTo('property:delete_own'), propertyController.deleteProperty);


// // Sử dụng cách phân quyền theo vai trò cho đơn giản trước:
// router.route('/')
//   .get(propertyController.getMyProperties)
//   .post(propertyController.createProperty);

// router.route('/:id')
//   .get(propertyController.getPropertyById)
//   .patch(propertyController.updateProperty)
//   .delete(propertyController.deleteProperty);

module.exports = router;