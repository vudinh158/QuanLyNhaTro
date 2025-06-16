const express = require('express');
const router = express.Router();
const lichSuGiaDichVuController = require('../controllers/lichSuGiaDichVuController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router
  .route('/')
  .post(protect, restrictTo('service_definition:manage_own_property'), lichSuGiaDichVuController.createLichSuGiaDichVu)
  .get(protect, restrictTo('service_definition:manage_own_property'), lichSuGiaDichVuController.getAllLichSuGiaDichVu);

router
  .route('/:id')
  .get(protect, restrictTo('service_definition:manage_own_property'), lichSuGiaDichVuController.getLichSuGiaDichVu);

module.exports = router;