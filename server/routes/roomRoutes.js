const express = require('express');
const roomController = require('../controllers/roomController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router({ mergeParams: true });

router.use(protect); 

router.get('/types', restrictTo('room:create', 'room:update_property_own'), roomController.getAllRoomTypes);

router.get('/property/:propertyId', restrictTo('room:read_property_own'), roomController.getRoomsByProperty);

router.route('/:id')
  .get(restrictTo('room:read_property_own'), roomController.getRoomById)
  .patch(restrictTo('room:update_property_own'), roomController.updateRoom)
  .delete(restrictTo('room:delete_property_own'), roomController.deleteRoom);

router.route('/')
  .post(restrictTo('room:create'), roomController.createRoom);


module.exports = router;