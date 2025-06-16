const express = require('express');
const router = express.Router();
const roomTypeController = require('../controllers/roomTypeController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router.use(protect);

router.get(
    '/property/:propertyId',
    restrictTo('property:read_own'),
    roomTypeController.getRoomTypesByProperty
);

// Route để tạo loại phòng mới
router.post(
    '/',
    restrictTo('property:create'),
    roomTypeController.createRoomTypeForProperty
);

router
  .route('/:id')
  .get(restrictTo('property:read_own'), roomTypeController.getRoomType)
  .patch(restrictTo('property:update_own'), roomTypeController.updateRoomType)
  .delete(restrictTo('property:delete_own'), roomTypeController.deleteRoomType);

module.exports = router;