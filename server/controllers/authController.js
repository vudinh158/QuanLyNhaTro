const authService = require('../services/authService');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { UserAccount, Role, Permission, Landlord, Tenant } = require('../models');
const { validationResult } = require('express-validator');
const { generateToken } = require('../utils/jwtUtils');
const bcrypt = require('bcryptjs');

/**
 * Chuyển Sequelize object thành JSON trả về client,
 * loại bỏ mật khẩu, permissions, và chỉ giữ đúng profile tương ứng
 */
const formatUserResponse = (userObject) => {
  if (!userObject) return null;
  const userJson = typeof userObject.toJSON === 'function'
    ? userObject.toJSON()
    : { ...userObject };

  // Xoá mật khẩu
  delete userJson.MatKhau;
  // Xoá mảng permissions
  if (userJson.role) {
    delete userJson.role.permissions;
  }

  // Nếu có tenantProfile thực sự (có MaKhachThue) thì gán vào khachThueProfile
  if (userJson.tenantProfile && userJson.tenantProfile.MaKhachThue) {
    userJson.khachThueProfile = userJson.tenantProfile;
  }
  delete userJson.tenantProfile;

  // Nếu có landlordProfile thực sự (có MaChuTro) thì gán vào chuTroProfile
  if (userJson.landlordProfile && userJson.landlordProfile.MaChuTro) {
    userJson.chuTroProfile = userJson.landlordProfile;
  }
  delete userJson.landlordProfile;

  // Xoá bất kỳ trường permissions thừa
  delete userJson.permissions;

  return userJson;
};

/**
 * POST /api/register
 * Đăng ký tài khoản mới (Khách thuê hoặc Chủ trọ)
 */
exports.register = catchAsync(async (req, res, next) => {
  // Nếu có validation trên route, kiểm tra lỗi
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Gọi service để tạo user (đã hash pass, gán role, tạo profile,...)
  await authService.register(req.body);

  res.status(201).json({
    status: 'success',
    message: 'Đăng ký tài khoản thành công! Vui lòng đăng nhập.'
  });
});

/**
 * POST /api/login
 * Đăng nhập với tên đăng nhập hoặc email + mật khẩu
 */
exports.login = catchAsync(async (req, res, next) => {
  const { tenDangNhapOrEmail, matKhau } = req.body;
  if (!tenDangNhapOrEmail || !matKhau) {
    return next(new AppError('Vui lòng cung cấp tên đăng nhập/email và mật khẩu.', 400));
  }

  // Service trả về { user, token }
  const { user, token } = await authService.login({ tenDangNhapOrEmail, matKhau });

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: formatUserResponse(user)
    }
  });
});

/**
 * GET /api/me
 * Lấy thông tin người dùng hiện tại
 * - Nếu dùng authMiddleware.protect, req.user đã đầy đủ
 * - Nếu dùng requireAuth, phải fetch thêm từ DB theo req.userId
 */
exports.getMe = catchAsync(async (req, res, next) => {
  let user = req.user;

  // Nếu req.user chưa có (dùng requireAuth), fetch bằng userId
  if (!user && req.userId) {
    user = await UserAccount.findByPk(req.userId, {
      attributes: { exclude: ['MatKhau'] },
      include: [
        { model: Role, as: 'role', include: [{ model: Permission, as: 'permissions' }] },
        { model: Landlord, as: 'landlordProfile' },
        { model: Tenant, as: 'tenantProfile' }
      ]
    });
  }

  if (!user) {
    return next(new AppError('Không tìm thấy người dùng. Vui lòng đăng nhập lại.', 401));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: formatUserResponse(user)
    }
  });
});

/**
 * POST /api/send-otp
 * Gửi mã OTP về email (dùng express-validator nếu có)
 */
exports.sendOtp = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;
  const { otpToken } = await authService.sendOtp(email);

  res.status(200).json({
    status: 'success',
    message: 'Mã OTP đã được gửi về email của bạn.',
    otpToken
  });
});

/**
 * POST /api/verify-otp
 * Xác thực mã OTP và đăng nhập lần đầu
 */
exports.verifyOtp = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { code, otpToken } = req.body;
  // Service xác thực OTP và trả về user
  const user = await authService.verifyOtp(code, otpToken);

  // Sau khi verify, issue token mới
  const token = generateToken({ id: user.id });

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: formatUserResponse(user)
    }
  });
});

/**
 * PUT /api/change-password
 * Đổi mật khẩu (áp dụng chung cho landlord & tenant)
 */
exports.changePassword = catchAsync(async (req, res, next) => {
  // req.userId từ requireAuth hoặc req.user.MaTK từ authMiddleware.protect
  const userId = req.userId || (req.user && req.user.MaTK);
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new AppError('Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới.', 400));
  }

  const user = await UserAccount.findByPk(userId);
  if (!user) {
    return next(new AppError('Không tìm thấy người dùng.', 404));
  }

  // So sánh mật khẩu hiện tại
  const isMatch = await bcrypt.compare(currentPassword, user.MatKhau);
  if (!isMatch) {
    return next(new AppError('Mật khẩu hiện tại không chính xác.', 400));
  }

  // Gán mật khẩu mới (model UserAccount cần hook hash trước khi save)
  user.MatKhau = newPassword;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Đổi mật khẩu thành công.'
  });
});