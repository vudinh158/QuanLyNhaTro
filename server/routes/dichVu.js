const express = require('express');
const router = express.Router();
const dichVuController = require('../controllers/dichVuController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router.use(protect);

router
  .route('/')
  .post(
    // protect,
    restrictTo('service_definition:manage_own_property'),
    dichVuController.createService
  )
  .get(
    // protect,
    restrictTo('service_definition:manage_own_property'),
    dichVuController.getAllServices
  );

router
  .route('/:id')
  .get(
    // protect,
    restrictTo('service_definition:manage_own_property'),
    dichVuController.getService
  )
  .patch(
    // protect,
    restrictTo('service_definition:manage_own_property'),
    dichVuController.updateService
  )
  .delete(
    // protect,
    restrictTo('service_definition:manage_own_property'),
    dichVuController.deleteService
  );

  router.patch(
    '/:id/update-price', // Endpoint mới
    restrictTo('service_definition:manage_own_property'), //
    dichVuController.updateGiaDichVu // Ánh xạ tới hàm updateGiaDichVu trong controller
  );

module.exports = router;
