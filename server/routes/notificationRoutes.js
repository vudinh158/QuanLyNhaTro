// file: server/routes/notificationRoutes.js
const express = require('express');
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(notificationController.createNotification)
  .get(notificationController.getMyNotifications);

router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;