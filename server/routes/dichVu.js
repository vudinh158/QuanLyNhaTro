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

  router.route('/:id/prices')
    .post(protect, dichVuController.addPriceHistory);

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


module.exports = router;
