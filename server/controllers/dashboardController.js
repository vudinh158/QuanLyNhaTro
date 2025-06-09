// file: server/controllers/dashboardController.js
const dashboardService = require('../services/dashboardService');
const catchAsync = require('../utils/catchAsync');

exports.getLandlordSummary = catchAsync(async (req, res, next) => {
    console.log('Fetching landlord dashboard summary for user:', req.user);
    const summary = await dashboardService.getLandlordDashboardSummary(req.user.landlordProfile.MaChuTro);
    res.status(200).json({
        status: 'success',
        data: { summary },
    });
});

exports.getTenantSummary = catchAsync(async (req, res, next) => {
    const summary = await dashboardService.getTenantDashboardSummary(req.user.tenantProfile.MaKhachThue);
    res.status(200).json({
        status: 'success',
        data: { summary },
    });
});