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
    dichVuController.createDichVu
  )
  .get(
    // protect,
    restrictTo('service_definition:manage_own_property'),
    dichVuController.getAllDichVu
  );

router
  .route('/:id')
  .get(
    // protect,
    restrictTo('service_definition:manage_own_property'),
    dichVuController.getDichVu
  )
  .patch(
    // protect,
    restrictTo('service_definition:manage_own_property'),
    dichVuController.updateDichVu
  )
  .delete(
    // protect,
    restrictTo('service_definition:manage_own_property'),
    dichVuController.deleteDichVu
  );

module.exports = router;
