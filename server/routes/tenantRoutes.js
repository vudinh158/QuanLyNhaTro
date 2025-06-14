// apps/server-express/src/routes/tenantRoutes.js
const express = require('express');
const tenantController = require('../controllers/tenantController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect); // Tất cả các route này yêu cầu đăng nhập

// Ví dụ phân quyền chi tiết
router.route('/')
  .get(restrictTo('tenant_profile:read_own_property'), tenantController.getAllTenants) // Chủ trọ xem khách thuê của mình
//   .post(restrictTo('tenant_profile:create'), tenantController.createTenant); // Chủ trọ tạo khách thuê

router.route('/:id')
  .get(restrictTo('tenant_profile:read_own_property', 'tenant_profile:read_self'), tenantController.getTenantById) // Chủ trọ xem khách của mình, khách thuê xem bản thân
  .patch(restrictTo('tenant_profile:update_own_property', 'tenant_profile:update_self'), tenantController.updateTenant)
  .delete(restrictTo('tenant_profile:delete_own_property'), tenantController.deleteTenant); // Thêm quyền này

module.exports = router;