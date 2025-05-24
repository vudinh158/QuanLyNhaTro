const { TaiKhoan, VaiTro, ChuTro, KhachThue } = require('../models');
const AppError = require('../utils/AppError');
const { generateToken } = require('../utils/jwtUtils');
// const { Op } = require('sequelize');

const register = async (userData) => {
  const {
    TenDangNhap,
    MatKhau,
    MaVaiTro,
    HoTen,
    CCCD,
    SoDienThoai,
    NgaySinh,
    GioiTinh,
    Email, 
    QueQuan,
  } = userData;

  // Kiểm tra TenDangNhap đã tồn tại chưa
  const existingUserByUsername = await TaiKhoan.findOne({ where: { TenDangNhap } });
  if (existingUserByUsername) {
    throw new AppError('Tên đăng nhập đã tồn tại.', 400);
  }

  // Kiểm tra xem VaiTro có tồn tại không
  const role = await VaiTro.findByPk(MaVaiTro);
  if (!role) {
    throw new AppError('Mã vai trò không hợp lệ.', 400);
  }

  const transaction = await TaiKhoan.sequelize.transaction();

  try {
    const newTaiKhoan = await TaiKhoan.create({
      TenDangNhap,
      MatKhau,
      MaVaiTro,
      TrangThai: 'Kích hoạt',
    }, { transaction });

    if (role.TenVaiTro === 'Chủ trọ') {
      if (!HoTen || !SoDienThoai) {
        await transaction.rollback();
        throw new AppError('Thiếu thông tin Họ tên hoặc Số điện thoại cho Chủ trọ.', 400);
      }
      // Kiểm tra Email duy nhất trong bảng ChuTro
      if (Email) {
        const existingChuTroByEmail = await ChuTro.findOne({ where: { Email } });
        if (existingChuTroByEmail) {
          await transaction.rollback();
          throw new AppError('Email chủ trọ đã tồn tại.', 400);
        }
      }
      // Kiểm tra các trường unique khác của ChuTro
      const existingChuTroByPhone = await ChuTro.findOne({ where: { SoDienThoai } });
      if (existingChuTroByPhone) {
        await transaction.rollback();
        throw new AppError('Số điện thoại chủ trọ đã tồn tại.', 400);
      }
      if (CCCD) {
        const existingChuTroByCCCD = await ChuTro.findOne({ where: { CCCD } });
        if (existingChuTroByCCCD) {
            await transaction.rollback();
            throw new AppError('CCCD chủ trọ đã tồn tại.', 400);
        }
      }

      await ChuTro.create({
        MaTK: newTaiKhoan.MaTK,
        HoTen,
        CCCD,
        SoDienThoai,
        NgaySinh,
        GioiTinh,
        Email,
      }, { transaction });
    } else if (role.TenVaiTro === 'Khách thuê') {
      if (!HoTen || !SoDienThoai) {
        await transaction.rollback();
        throw new AppError('Thiếu thông tin Họ tên hoặc Số điện thoại cho Khách thuê.', 400);
      }
      // Kiểm tra Email duy nhất trong bảng KhachThue
      if (Email) {
        const existingKhachThueByEmail = await KhachThue.findOne({ where: { Email } });
        if (existingKhachThueByEmail) {
          await transaction.rollback();
          throw new AppError('Email khách thuê đã tồn tại.', 400);
        }
      }
      // Kiểm tra các trường unique khác của KhachThue
      const existingKhachThueByPhone = await KhachThue.findOne({ where: { SoDienThoai } });
      if (existingKhachThueByPhone) {
        await transaction.rollback();
        throw new AppError('Số điện thoại khách thuê đã tồn tại.', 400);
      }
       if (CCCD) {
        const existingKhachThueByCCCD = await KhachThue.findOne({ where: { CCCD } });
        if (existingKhachThueByCCCD) {
            await transaction.rollback();
            throw new AppError('CCCD khách thuê đã tồn tại.', 400);
        }
      }

      await KhachThue.create({
        MaTK: newTaiKhoan.MaTK,
        HoTen,
        CCCD,
        SoDienThoai,
        Email,
        NgaySinh,
        GioiTinh,
        QueQuan,
        TrangThai: 'Đang thuê',
      }, { transaction });
    }

    await transaction.commit();
    newTaiKhoan.MatKhau = undefined;
    return newTaiKhoan;

  } catch (error) {
    await transaction.rollback();
    if (error.name === 'SequelizeUniqueConstraintError') {
        const specificError = error.errors && error.errors.length > 0 ? error.errors[0] : {};
        const field = specificError.path;
        if (field === 'TenDangNhap') throw new AppError('Tên đăng nhập đã tồn tại.', 400);
    }
    throw error;
  }
};

const login = async (loginData) => {
  const { tenDangNhapOrEmail, matKhau } = loginData;

  // đăng nhập bằng TenDangNhap
  let user = await TaiKhoan.findOne({
    where: { TenDangNhap: tenDangNhapOrEmail }, // Chỉ tìm theo TenDangNhap
    include: [{ model: VaiTro, as: 'vaiTro' }]
  });

  //  đăng nhập bằng Email
  if (!user && tenDangNhapOrEmail.includes('@')) { // Giả sử email thì có dấu @
    let profile = await ChuTro.findOne({ where: { Email: tenDangNhapOrEmail } });
    if (!profile) {
      profile = await KhachThue.findOne({ where: { Email: tenDangNhapOrEmail } });
    }
    if (profile && profile.MaTK) {
      user = await TaiKhoan.findByPk(profile.MaTK, {
        include: [{ model: VaiTro, as: 'vaiTro' }]
      });
    }
  }


  if (!user || !(await user.comparePassword(matKhau))) {
    throw new AppError('Tên đăng nhập/email hoặc mật khẩu không chính xác.', 401);
  }

  if (user.TrangThai !== 'Kích hoạt') {
    throw new AppError('Tài khoản của bạn đã bị khóa hoặc chưa được kích hoạt.', 403);
  }

  const payload = {
    id: user.MaTK,
    tenVaiTro: user.vaiTro ? user.vaiTro.TenVaiTro : null,
    maVaiTro: user.MaVaiTro,
  };
  const token = generateToken(payload);

  user.MatKhau = undefined;
  return { user, token };
};

module.exports = { register, login };