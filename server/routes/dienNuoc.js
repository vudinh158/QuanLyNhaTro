const express = require('express');
const router = express.Router();
const dienNuocController = require('../controllers/dienNuocController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router
  .route('/')
  .post(protect, restrictTo('electric_water:record_own_property'), dienNuocController.createDienNuoc)
  .get(protect, restrictTo('electric_water:record_own_property'), dienNuocController.getAllDienNuoc);

router
  .route('/:id')
  .get(protect, restrictTo('electric_water:read-self'), dienNuocController.getDienNuoc)
  .patch(protect, restrictTo('electric_water:record_own_property'), dienNuocController.updateDienNuoc)
  .delete(protect, restrictTo('electric_water:record_own_property'), dienNuocController.deleteDienNuoc);

module.exports = router;