// file: server/routes/dashboardRoutes.js
const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();
router.use(protect);

// Route cho chủ trọ
router.get('/landlord-summary', restrictTo('dashboard:read'), dashboardController.getLandlordSummary);

router.get('/tenant-summary', restrictTo('dashboard:read_self'), dashboardController.getTenantSummary);

module.exports = router;