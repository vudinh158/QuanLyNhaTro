const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const { TaiKhoan, VaiTro, ChuTro, KhachThue, VaiTro_Quyen, Quyen } = require('../models');
const AppError = require('../utils/AppError');
const serverConfig = require('../config/serverConfig');
const errorMessages = require('../utils/errorMessages');
const logger = require('../utils/logger'); // Giả sử bạn có thiết lập logger

const catchAsync = fn => (req, res, next) => fn(req, res, next).catch(next);

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ') && authHeader.split(' ')[1].length > 0) {
    token = authHeader.split(' ')[1];
  } else {
    logger.warn(`Xác thực thất bại: Thiếu hoặc token không hợp lệ cho yêu cầu ${req.method} ${req.originalUrl}`);
    return next(new AppError(errorMessages.NOT_LOGGED_IN, 401));
  }

  let decoded;
  try {
    decoded = await promisify(jwt.verify)(token, serverConfig.jwt.secret);
  } catch (err) {
    logger.warn(`Xác thực thất bại: ${err.name} cho yêu cầu ${req.method} ${req.originalUrl}`);
    if (err.name === 'TokenExpiredError') {
      return next(new AppError(errorMessages.EXPIRED_TOKEN, 401));
    }
    return next(new AppError(errorMessages.INVALID_TOKEN, 401));
  }

  const currentUser = await TaiKhoan.findByPk(decoded.MaTK, {
    attributes: { exclude: ['MatKhau'] },
    include: [
      {
        model: VaiTro,
        as: 'vaiTro',
        include: [{ model: VaiTro_Quyen, as: 'quyens', include: [{ model: Quyen, as: 'quyen' }] }]
      },
      { model: ChuTro, as: 'chuTroProfile' },
      { model: KhachThue, as: 'khachThueProfile' }
    ]
  });

  if (!currentUser) {
    logger.warn(`Xác thực thất bại: Không tìm thấy người dùng với MaTK ${decoded.MaTK}`);
    return next(new AppError(errorMessages.USER_NOT_FOUND, 401));
  }

  if (currentUser.TrangThai !== 'Kích hoạt') {
    logger.warn(`Xác thực thất bại: Tài khoản không hoạt động với MaTK ${currentUser.MaTK}`);
    return next(new AppError(errorMessages.INACTIVE_ACCOUNT, 403));
  }

  req.user = {
    MaTK: currentUser.MaTK,
    MaVaiTro: currentUser.vaiTro.MaVaiTro,
    TenVaiTro: currentUser.vaiTro.TenVaiTro,
    MaChuTro: currentUser.chuTroProfile?.MaChuTro || null,
    MaKhachThue: currentUser.khachThueProfile?.MaKhachThue || null,
    permissions: currentUser.vaiTro.quyens.map(q => q.quyen.TenQuyen)
  };

  next();
});

exports.restrictTo = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user || !req.user.permissions || !requiredPermissions.every(perm => req.user.permissions.includes(perm))) {
      logger.warn(`Xác quyền thất bại: Người dùng ${req.user?.MaTK} thiếu quyền ${requiredPermissions.join(', ')} cho yêu cầu ${req.method} ${req.originalUrl}`);
      return next(new AppError(errorMessages.NO_PERMISSION, 403));
    }
    next();
  };
};