const express = require('express');
const router = express.Router();
const phuongThucThanhToanController = require('../controllers/phuongThucThanhToanController');
// const { protect, restrictTo } = require('../middlewares/authMiddleware');

router
  .route('/')
  .post( phuongThucThanhToanController.createPhuongThucThanhToan)
  .get( phuongThucThanhToanController.getAllPhuongThucThanhToan);

router
  .route('/:id')
  .get(phuongThucThanhToanController.getPhuongThucThanhToan)
  .patch(phuongThucThanhToanController.updatePhuongThucThanhToan)
  .delete(phuongThucThanhToanController.deletePhuongThucThanhToan);

module.exports = router;