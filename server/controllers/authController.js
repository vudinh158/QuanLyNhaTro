const authService = require('../services/authService');
const AppError = require('../utils/AppError');

// bắt lỗi async cho các hàm controller
const catchAsync = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

exports.register = catchAsync(async (req, res, next) => {
  const {
    TenDangNhap, MatKhau, MaVaiTro, HoTen, SoDienThoai, Email, CCCD, NgaySinh, GioiTinh, QueQuan
  } = req.body;

  if (!TenDangNhap || !MatKhau || !MaVaiTro || !HoTen || !SoDienThoai) {
    return next(new AppError('Vui lòng cung cấp đầy đủ thông tin bắt buộc: Tên đăng nhập, Mật khẩu, Mã vai trò, Họ tên, Số điện thoại.', 400));
  }

  const newUser = await authService.register(req.body);

  const { user, token } = await authService.login({ tenDangNhapOrEmail: newUser.TenDangNhap, matKhau: MatKhau });


  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: user,
    },
    message: 'Đăng ký tài khoản thành công!'
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { tenDangNhapOrEmail, matKhau } = req.body;

  if (!tenDangNhapOrEmail || !matKhau) {
    return next(new AppError('Vui lòng cung cấp tên đăng nhập/email và mật khẩu.', 400));
  }

  const { user, token } = await authService.login({ tenDangNhapOrEmail, matKhau });

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
});


exports.getMe = catchAsync(async (req, res, next) => {
  if (!req.user) {
      return next(new AppError('Không tìm thấy người dùng. Vui lòng đăng nhập lại.', 401));
  }

  const { MaTK, TenDangNhap, Email, MaVaiTro, TrangThai, vaiTro, chuTroProfile, khachThueProfile } = req.user;

  let profile = null;
  if (vaiTro.TenVaiTro === 'Chủ trọ' && chuTroProfile) {
    profile = chuTroProfile;
  } else if (vaiTro.TenVaiTro === 'Khách thuê' && khachThueProfile) {
    profile = khachThueProfile;
  }


  res.status(200).json({
      status: 'success',
      data: {
          user: {
            MaTK,
            TenDangNhap,
            EmailTaiKhoan: Email,
            MaVaiTro,
            TrangThai,
            vaiTro: {
                MaVaiTro: vaiTro.MaVaiTro,
                TenVaiTro: vaiTro.TenVaiTro
            },
            profile 
          }
      }
  });
});