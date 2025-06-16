const jwtUtils = require('../utils/jwtUtils');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const logger = require('../utils/logger');
const { UserAccount, Role, Landlord, Tenant, Permission } = require('../models');

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Lấy token từ header
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('Bạn chưa đăng nhập. Vui lòng đăng nhập để truy cập.', 401));
  }

  // 2) Giải mã và verify token
  const decoded = await jwtUtils.verifyToken(token, process.env.JWT_SECRET);

  // 3) Lấy user kèm vai trò, profile landlord và tenant
  const currentUser = await UserAccount.findByPk(decoded.id, {
    attributes: { exclude: ['MatKhau'] },
    include: [
      {
        model: Role,
        as: 'role',
        attributes: ['MaVaiTro', 'TenVaiTro'],
        include: [{
          model: Permission,
          as: 'permissions',
          attributes: ['TenQuyen'],
          through: { attributes: [] }
        }]
      },
      { model: Landlord, as: 'landlordProfile' },
      { model: Tenant, as: 'tenantProfile' }
    ]
  });

  if (!currentUser) {
    return next(new AppError('Người dùng của token này không còn tồn tại.', 401));
  }

  // 4) Chuẩn hóa mảng permissions
  const permissions = currentUser.role?.permissions?.map(p => p.TenQuyen) || [];

  // 5) Gán user và permissions vào req
  req.user = currentUser;
  req.user.permissions = permissions;

  next();
});

exports.restrictTo = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role || !req.user.role.permissions) {
      return next(new AppError('Bạn không có quyền thực hiện hành động này.', 403));
    }

    const userPermissions = req.user.role.permissions.map(p => p.TenQuyen);
    // Dùng OR thay vì AND: chỉ cần có một trong các quyền
    const hasPermission = requiredPermissions.some(rp => userPermissions.includes(rp));

    if (!hasPermission) {
      return next(new AppError(
        `PERMISSION DENIED: User ${req.user.TenDangNhap} (ID: ${req.user.MaTK}) thiếu quyền: ` +
        `[${requiredPermissions.filter(rp => !userPermissions.includes(rp)).join(', ')}]`,
        403
      ));
    }

    next();
  };
};