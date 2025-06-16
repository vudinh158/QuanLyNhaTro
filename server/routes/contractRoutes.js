// file: server/routes/contractRoutes.js
const express = require('express');
const contractController = require('../controllers/contractController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();


// Tất cả các route bên dưới đều yêu cầu đăng nhập
router.use(protect);

router.get('/current', protect, restrictTo('contract:read_self'), contractController.getCurrentUserContract);

// API để lấy danh sách và tạo mới hợp đồng
router.route('/')
    .get(contractController.getAllContracts)
    .post(restrictTo('contract:create'), upload.fields([
        { name: 'AnhGiayTo', maxCount: 10 },    // Cho khách thuê
        { name: 'FileHopDong', maxCount: 1 }      // Cho hợp đồng
    ]), contractController.createContract);

// API để xem chi tiết, cập nhật và thanh lý
router.route('/:id')
  .get(contractController.getContract) // Quyền được kiểm tra trong service
  .patch(restrictTo('contract:update_own_property'), contractController.updateContract);

router.route('/:id/terminate')
  .patch(restrictTo('contract:terminate_own_property'), contractController.terminateContract);


module.exports = router;