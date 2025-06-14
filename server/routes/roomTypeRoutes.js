const express = require('express');
const roomTypeController = require('../controllers/roomTypeController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware.protect); // Yêu cầu đăng nhập cho tất cả các route bên dưới

// Lấy danh sách loại phòng của một nhà trọ
// POST: api/v1/properties/:propertyId/room-types
// GET: api/v1/room-types/:id (chi tiết 1 loại phòng)
// PATCH: api/v1/room-types/:id (cập nhật 1 loại phòng)
// DELETE: api/v1/room-types/:id (xóa 1 loại phòng)

router
  .route('/')
  .get(roomTypeController.getRoomTypesByProperty)
  .post( roomTypeController.createRoomTypeForProperty);

router
  .route('/:id')
  .get(roomTypeController.getRoomType)
  .patch(roomTypeController.updateRoomType)
  .delete(roomTypeController.deleteRoomType);

module.exports = router;