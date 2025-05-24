const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const { TaiKhoan, VaiTro, ChuTro, KhachThue } = require('../models');
const AppError = require('../utils/AppError');
const serverConfig = require('../config/serverConfig');

const catchAsync = fn => (req, res, next) => fn(req, res, next).catch(next);

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Bạn chưa đăng nhập. Vui lòng đăng nhập để truy cập.', 401));
  }

  const decoded = await promisify(jwt.verify)(token, serverConfig.jwt.secret);

  const currentUser = await TaiKhoan.findByPk(decoded.id, {
    include: [
        { model: VaiTro, as: 'vaiTro' },
        { model: ChuTro, as: 'chuTroProfile' },
        { model: KhachThue, as: 'khachThueProfile' } 
    ]
  });

  if (!currentUser) {
    return next(new AppError('Người dùng sở hữu token này không còn tồn tại.', 401));
  }

  if (currentUser.TrangThai !== 'Kích hoạt') {
      return next(new AppError('Tài khoản này đã bị vô hiệu hóa hoặc tạm khóa.', 403));
  }


  req.user = currentUser;
  next();
});

exports.restrictTo = (...tenVaiTros) => {
  return (req, res, next) => {
    if (!req.user || !req.user.vaiTro || !tenVaiTros.includes(req.user.vaiTro.TenVaiTro)) {
      return next(new AppError('Bạn không có quyền thực hiện hành động này.', 403));
    }
    next();
  };
};
