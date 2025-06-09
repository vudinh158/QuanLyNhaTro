const tenantService = require('../services/tenantService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getAllTenants = catchAsync(async (req, res, next) => {
    if (!req.user || !req.user.landlordProfile.MaChuTro) {
        return next(new AppError('Không tìm thấy thông tin chủ trọ.', 401));
    }
    const maChuTro = req.user.landlordProfile.MaChuTro;
    // Lấy các query params cho tìm kiếm, phân trang, filter (ví dụ)
    const queryParams = {
            search: req.query.search,
            status: req.query.status,
            // page: req.query.page,
            // limit: req.query.limit,
    };

    const tenants = await tenantService.getAllTenantsForLandlord(maChuTro, queryParams);
    res.status(200).json({
        status: 'success',
        results: tenants.length,
        data: { tenants },
    });
});

exports.getTenantById = catchAsync(async (req, res, next) => {
    const maKhachThue = parseInt(req.params.id, 10);
    if (isNaN(maKhachThue)) {
        return next(new AppError('Mã khách thuê không hợp lệ.', 400));
    }
    if (!req.user || !req.user.landlordProfile.MaChuTro) {
        return next(new AppError('Không tìm thấy thông tin chủ trọ.', 401));
    }
    const maChuTro = req.user.landlordProfile.MaChuTro;
    const tenant = await tenantService.getTenantByIdForLandlord(maKhachThue, maChuTro);
    res.status(200).json({
        status: 'success',
        data: { tenant },
    });
});

exports.updateTenant = catchAsync(async (req, res, next) => {
    const maKhachThue = parseInt(req.params.id, 10);
    if (isNaN(maKhachThue)) {
        return next(new AppError('Mã khách thuê không hợp lệ.', 400));
    }
     if (!req.user || !req.user.landlordProfile.MaChuTro) {
        return next(new AppError('Không tìm thấy thông tin chủ trọ.', 401));
    }
    const maChuTro = req.user.landlordProfile.MaChuTro;
    const updatedTenant = await tenantService.updateTenant(maKhachThue, req.body, maChuTro);
    res.status(200).json({
        status: 'success',
        data: { tenant: updatedTenant },
    });
});

exports.deleteTenant = catchAsync(async (req, res, next) => {
    const maKhachThue = parseInt(req.params.id, 10);
    if (isNaN(maKhachThue)) {
        return next(new AppError('Mã khách thuê không hợp lệ.', 400));
    }
    if (!req.user || !req.user.landlordProfile.MaChuTro) {
        return next(new AppError('Không tìm thấy thông tin chủ trọ.', 401));
    }
    const maChuTro = req.user.landlordProfile.MaChuTro;
    await tenantService.deleteTenant(maKhachThue, maChuTro);
    res.status(204).json({
        status: 'success',
        data: null,
    });
});
