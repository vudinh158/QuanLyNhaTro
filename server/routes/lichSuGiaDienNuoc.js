const express = require('express');
const router = express.Router();
const lichSuGiaDienNuocController = require('../controllers/lichSuGiaDienNuocController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router
  .route('/')
  // Sửa 'Sửa giá điện nước' thành tên quyền đúng trong DB
  .post(protect, restrictTo('electric_water_price:manage_own_property'), lichSuGiaDienNuocController.createLichSuGiaDienNuoc) 
  // Sửa 'Xem lịch sử giá điện nước' thành tên quyền đúng trong DB
  .get(protect, restrictTo('electric_water_price:manage_own_property'), lichSuGiaDienNuocController.getAllLichSuGiaDienNuoc);

router
  .route('/:id')
  // Sửa 'Xem lịch sử giá điện nước' thành tên quyền đúng trong DB
  .get(protect, restrictTo('electric_water_price:manage_own_property'), lichSuGiaDienNuocController.getLichSuGiaDienNuoc);


  router.route('/:id')
      .delete(protect, restrictTo('electric_water_price:manage_own_property'), lichSuGiaDienNuocController.deleteElectricWaterPrice);
    
module.exports = router;