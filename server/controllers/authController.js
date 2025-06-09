const authService = require('../services/authService');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { UserAccount, Role, Permission, Landlord, Tenant } = require('../models');

// Hàm này đã đúng, giữ nguyên
const formatUserResponse = (userObject) => {
    if (!userObject) return null;
    const userJson = typeof userObject.toJSON === 'function' ? userObject.toJSON() : { ...userObject };
    delete userJson.MatKhau;
    if (userJson.role) {
        delete userJson.role.permissions;
    }
    if (userJson.tenantProfile) {
        userJson.khachThueProfile = userJson.tenantProfile;
        delete userJson.tenantProfile;
    }
    if (userJson.landlordProfile) {
        userJson.chuTroProfile = userJson.landlordProfile;
        delete userJson.landlordProfile;
    }
    delete userJson.permissions;
    return userJson;
};

// Cập nhật hàm register
exports.register = catchAsync(async (req, res, next) => {
    // Service đã xử lý tất cả logic, ta chỉ cần gọi
    await authService.register(req.body);
    res.status(201).json({
        status: 'success',
        message: 'Đăng ký tài khoản thành công! Vui lòng đăng nhập.'
    });
});

// ---- CẬP NHẬT CHÍNH Ở ĐÂY ----
// Cập nhật hàm login để nó đơn giản hơn
exports.login = catchAsync(async (req, res, next) => {
    const { tenDangNhapOrEmail, matKhau } = req.body;
    if (!tenDangNhapOrEmail || !matKhau) {
        return next(new AppError('Vui lòng cung cấp tên đăng nhập/email và mật khẩu.', 400));
    }
    
    // authService.login giờ đã trả về đầy đủ { user, token }
    const { user, token } = await authService.login({ tenDangNhapOrEmail, matKhau });

    // Controller chỉ cần format và gửi response đi
    res.status(200).json({
        status: 'success',
        token,
        data: {
            user: formatUserResponse(user),
        },
    });
});

// Hàm này đã đúng, giữ nguyên
exports.getMe = catchAsync(async (req, res, next) => {
    if (!req.user) {
        return next(new AppError('Không tìm thấy người dùng. Vui lòng đăng nhập lại.', 401));
    }
    res.status(200).json({
        status: 'success',
        data: {
            user: formatUserResponse(req.user),
        }
    });
});