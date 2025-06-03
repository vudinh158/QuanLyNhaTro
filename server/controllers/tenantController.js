// apps/server-express/src/controllers/tenantController.js
const tenantService = require('../services/tenantService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getAllTenants = catchAsync(async (req, res, next) => {
  if (!req.user || !req.user.MaChuTro) {
    return next(new AppError('Không tìm thấy thông tin chủ trọ.', 401));
  }
  const maChuTro = req.user.MaChuTro;
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
  if (!req.user || !req.user.MaChuTro) {
    return next(new AppError('Không tìm thấy thông tin chủ trọ.', 401));
  }
  const maChuTro = req.user.MaChuTro;
  const tenant = await tenantService.getTenantByIdForLandlord(maKhachThue, maChuTro);
  res.status(200).json({
    status: 'success',
    data: { tenant },
  });
});

exports.createTenant = catchAsync(async (req, res, next) => {
  // MaChuTro của người tạo có thể lấy từ req.user nếu logic yêu cầu
  // Hiện tại, createTenant chưa dùng landlordMaTK nhưng có thể thêm vào nếu muốn lưu ai tạo
  const newTenant = await tenantService.createTenant(req.body, req.user?.MaTK); // req.user.MaTK của chủ trọ
  res.status(201).json({
    status: 'success',
    data: { tenant: newTenant },
  });
});

exports.updateTenant = catchAsync(async (req, res, next) => {
  const maKhachThue = parseInt(req.params.id, 10);
  if (isNaN(maKhachThue)) {
    return next(new AppError('Mã khách thuê không hợp lệ.', 400));
  }
   if (!req.user || !req.user.MaChuTro) {
    return next(new AppError('Không tìm thấy thông tin chủ trọ.', 401));
  }
  const maChuTro = req.user.MaChuTro;
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
  if (!req.user || !req.user.MaChuTro) {
    return next(new AppError('Không tìm thấy thông tin chủ trọ.', 401));
  }
  const maChuTro = req.user.MaChuTro;
  await tenantService.deleteTenant(maKhachThue, maChuTro);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});