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
        // Bây giờ req.user.permissions là một mảng string ['dashboard:read', '...']
        // nên logic kiểm tra sẽ hoạt động chính xác.
        const userPermissions = req.user.permissions || [];

        const hasAllPermissions = requiredPermissions.every(perm => userPermissions.includes(perm));

        if (!hasAllPermissions) {
            logger.warn(`Phân quyền thất bại: Người dùng ${req.user?.MaTK} thiếu quyền (cần: ${requiredPermissions.join(', ')}; có: ${userPermissions.join(', ')}) cho yêu cầu ${req.method} ${req.originalUrl}`);
            return next(new AppError('Bạn không có quyền thực hiện hành động này.', 403));
        }
        next();
    };
};