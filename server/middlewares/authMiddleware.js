const jwtUtils = require('../utils/jwtUtils');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const logger = require('../utils/logger');
const { UserAccount, Role, Landlord, Tenant, Permission } = require('../models');

exports.protect = catchAsync(async (req, res, next) => {
    // 1. Lấy token và kiểm tra
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new AppError('Bạn chưa đăng nhập. Vui lòng đăng nhập để truy cập.', 401));
    }

    // 2. Xác thực token
    const decoded = await jwtUtils.verifyToken(token, process.env.JWT_SECRET);

    // 3. Lấy thông tin người dùng và các thông tin liên quan
    const currentUser = await UserAccount.findByPk(decoded.id, {
        attributes: { exclude: ['MatKhau'] },
        include: [
            {
                model: Role,
                as: 'role',
                attributes: ['MaVaiTro', 'TenVaiTro'],
                include: [{
                    model: Permission,
                    as: 'permissions', // Alias phải khớp với định nghĩa association
                    attributes: ['TenQuyen'],
                    through: { attributes: [] } // Không lấy các thuộc tính của bảng trung gian
                }]
            },
            { model: Landlord, as: 'landlordProfile' },
            { model: Tenant, as: 'tenantProfile' }
        ]
    });

    if (!currentUser) {
        return next(new AppError('Người dùng của token này không còn tồn tại.', 401));
    }

    // ---- BƯỚC CHUẨN HÓA QUAN TRỌNG ----
    // Chuyển mảng object permissions thành mảng string đơn giản
    const permissions = currentUser.role?.permissions?.map(p => p.TenQuyen) || [];

    // Gán đối tượng Sequelize đầy đủ vào req.user
    req.user = currentUser;

    // Gán thêm mảng permissions đã được làm phẳng để restrictTo sử dụng
    req.user.permissions = permissions;
    // ------------------------------------

    next();
});

exports.restrictTo = (...requiredPermissions) => {
    return (req, res, next) => {
        const userPermissions = req.user?.permissions || []; // Ensure req.user and req.user.permissions are not null/undefined

        logger.info(`--- RestrictTo Check ---`);
        logger.info(`Requested URL: ${req.method} ${req.originalUrl}`);
        logger.info(`Required Permissions: [${requiredPermissions.join(', ')}]`);
        logger.info(`User (MaTK): ${req.user?.MaTK}, Role: ${req.user?.role?.TenVaiTro}`);
        logger.info(`User Permissions (from req.user): [${userPermissions.join(', ')}]`);

        const hasAllPermissions = requiredPermissions.every(perm => userPermissions.includes(perm));

        if (!hasAllPermissions) {
            logger.warn(`PERMISSION DENIED: User ${req.user?.TenDangNhap} (ID: ${req.user?.MaTK}) lacks required permissions.`);
            logger.warn(`Missing: [${requiredPermissions.filter(p => !userPermissions.includes(p)).join(', ')}]`);
            return next(new AppError('Bạn không có quyền thực hiện hành động này.', 403));
        }
        logger.info(`PERMISSION GRANTED: User ${req.user?.TenDangNhap} (ID: ${req.user?.MaTK}) has all required permissions.`);
        next();
    };
};