const express = require('express');
const router = express.Router();
const suDungDichVuController = require('../controllers/suDungDichVuController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router
  .route('/')
  .post(protect, restrictTo('service_usage:create'), suDungDichVuController.createSuDungDichVu)
  .get(protect, restrictTo('service_usage:read_own_property'), suDungDichVuController.getAllSuDungDichVu);

router.get('/my-usages', protect, restrictTo('service_usage:read_self'), suDungDichVuController.getTenantServiceUsages);

router
  .route('/:id')
  .get(protect, restrictTo('service_usage:read_own_property'), suDungDichVuController.getSuDungDichVu)
  .patch(protect, restrictTo('service_usage:update'), suDungDichVuController.updateSuDungDichVu)
  .delete(protect, restrictTo('service_usage:delete'), suDungDichVuController.deleteSuDungDichVu);

module.exports = router;