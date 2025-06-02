// apps/server-express/src/middlewares/authMiddleware.js
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
// Sử dụng tên model tiếng Anh đã được đổi
const {
  UserAccount, // Thay TaiKhoan
  Role,        // Thay VaiTro
  Landlord,    // Thay ChuTro
  Tenant,      // Thay KhachThue
  Permission,  // Thay Quyen
  // RolePermission không cần import trực tiếp ở đây nếu association được thiết lập đúng
} = require('../models');
const AppError = require('../utils/AppError');
const serverConfig = require('../config/serverConfig');
// Giả sử bạn đã có các file này hoặc sẽ tạo chúng:
const errorMessages = require('../utils/errorMessages'); // Ví dụ: errorMessages.NOT_LOGGED_IN
const logger = require('../utils/logger');

const catchAsync = fn => (req, res, next) => fn(req, res, next).catch(next);

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length === 2 && tokenParts[1]) {
      token = tokenParts[1];
    }
  }

  if (!token) {
    logger.warn(`Xác thực thất bại: Thiếu hoặc token không hợp lệ cho yêu cầu ${req.method} ${req.originalUrl}`);
    return next(new AppError(errorMessages.NOT_LOGGED_IN || 'Bạn chưa đăng nhập. Vui lòng đăng nhập để truy cập.', 401));
  }

  let decoded;
  try {
    // Payload JWT của bạn có trường 'id' chứa MaTK
    decoded = await promisify(jwt.verify)(token, serverConfig.jwt.secret);
  } catch (err) {
    logger.warn(`Xác thực thất bại: ${err.name} cho yêu cầu ${req.method} ${req.originalUrl}`);
    if (err.name === 'TokenExpiredError') {
      return next(new AppError(errorMessages.EXPIRED_TOKEN || 'Token đã hết hạn. Vui lòng đăng nhập lại.', 401));
    }
    return next(new AppError(errorMessages.INVALID_TOKEN || 'Token không hợp lệ.', 401));
  }

  // Sử dụng decoded.id (vì payload JWT được tạo với 'id: userAccountInstance.MaTK')
  const currentUser = await UserAccount.findByPk(decoded.id, {
    attributes: { exclude: ['MatKhau'] }, // Giữ nguyên việc loại bỏ MatKhau
    include: [
      {
        model: Role,
        as: 'role', // Alias này phải khớp với định nghĩa trong UserAccount.associate
        include: [{
          model: Permission,
          as: 'permissions', // Alias này phải khớp với định nghĩa trong Role.associate (belongsToMany)
          attributes: ['TenQuyen'], // Chỉ lấy TenQuyen
          through: { attributes: [] } // Không lấy các thuộc tính từ bảng nối RolePermission
        }]
      },
      { model: Landlord, as: 'landlordProfile' }, // Alias này phải khớp với UserAccount.associate
      { model: Tenant, as: 'tenantProfile' }     // Alias này phải khớp với UserAccount.associate
    ]
  });

  if (!currentUser) {
    logger.warn(`Xác thực thất bại: Không tìm thấy người dùng với MaTK ${decoded.id}`);
    return next(new AppError(errorMessages.USER_NOT_FOUND || 'Người dùng liên kết với token này không còn tồn tại.', 401));
  }

  if (currentUser.TrangThai !== 'Kích hoạt') {
    logger.warn(`Xác thực thất bại: Tài khoản không hoạt động với MaTK ${currentUser.MaTK}`);
    return next(new AppError(errorMessages.INACTIVE_ACCOUNT || 'Tài khoản này đã bị vô hiệu hóa hoặc tạm khóa.', 403));
  }

  // Xây dựng object req.user với thông tin cần thiết
  // Tên thuộc tính trong req.user có thể giữ tiếng Việt hoặc đổi sang tiếng Anh tùy bạn chọn
  // Ở đây tôi giữ lại phần lớn tên tiếng Việt từ MaTK, MaVaiTro, TenVaiTro để giảm thiểu thay đổi ở các phần khác
  // nhưng permissions thì lấy TenQuyen (đã là tiếng Việt trong CSDL)
  req.user = {
    MaTK: currentUser.MaTK,
    TenDangNhap: currentUser.TenDangNhap, // Thêm TenDangNhap nếu cần
    MaVaiTro: currentUser.MaVaiTro,
    TenVaiTro: currentUser.role ? currentUser.role.TenVaiTro : null,
    // Lấy thông tin profile một cách an toàn
    MaChuTro: currentUser.landlordProfile?.MaChuTro || null,
    HoTenChuTro: currentUser.landlordProfile?.HoTen || null,
    MaKhachThue: currentUser.tenantProfile?.MaKhachThue || null,
    HoTenKhachThue: currentUser.tenantProfile?.HoTen || null,
    // Lấy danh sách các TenQuyen
    permissions: currentUser.role && currentUser.role.permissions
                 ? currentUser.role.permissions.map(p => p.TenQuyen)
                 : []
  };

  next();
});

exports.restrictTo = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user || !req.user.permissions) {
        logger.warn(`Phân quyền thất bại: Thông tin người dùng hoặc quyền không đầy đủ cho yêu cầu ${req.method} ${req.originalUrl}`);
        return next(new AppError(errorMessages.NO_PERMISSION || 'Bạn không có quyền thực hiện hành động này (thiếu thông tin user/quyền).', 403));
    }
      
    const hasAllPermissions = requiredPermissions.every(perm => req.user.permissions.includes(perm));

    if (!hasAllPermissions) {
      logger.warn(`Phân quyền thất bại: Người dùng ${req.user?.MaTK} thiếu quyền (cần: ${requiredPermissions.join(', ')}; có: ${req.user.permissions.join(', ')}) cho yêu cầu ${req.method} ${req.originalUrl}`);
      return next(new AppError(errorMessages.NO_PERMISSION || 'Bạn không có quyền thực hiện hành động này.', 403));
    }
    next();
  };
};