const bcrypt = require('bcryptjs'); // Thêm thư viện bcrypt
const { UserAccount, Role, Landlord, Tenant, Permission, sequelize } = require('../models');
const AppError = require('../utils/AppError');
// Đảm bảo đường dẫn đến jwtUtils là chính xác, dựa theo code cũ của bạn là generateToken
const { generateToken } = require('../utils/jwtUtils'); 

const register = async (userData) => {
    // Giữ nguyên toàn bộ hàm register của bạn, vì logic đã khá hoàn chỉnh
    const {
      TenDangNhap, MatKhau, MaVaiTro, HoTen, CCCD,
      SoDienThoai, NgaySinh, GioiTinh, Email, QueQuan,
    } = userData;
  
    const existingUserByUsername = await UserAccount.findOne({ where: { TenDangNhap } });
    if (existingUserByUsername) {
      throw new AppError('Tên đăng nhập đã tồn tại.', 400);
    }
  
    const roleInstance = await Role.findByPk(MaVaiTro);
    if (!roleInstance) {
      throw new AppError('Mã vai trò không hợp lệ.', 400);
    }
  
    const transaction = await sequelize.transaction(); // Sử dụng sequelize từ models
  
    try {
      const newUserAccount = await UserAccount.create({
        TenDangNhap,
        MatKhau, // Giả định model UserAccount có hook để hash mật khẩu
        MaVaiTro: roleInstance.MaVaiTro,
        TrangThai: 'Kích hoạt',
      }, { transaction });
  
      if (roleInstance.TenVaiTro === 'Chủ trọ') {
        if (!HoTen || !SoDienThoai) {
          await transaction.rollback();
          throw new AppError('Thiếu thông tin Họ tên hoặc Số điện thoại cho Chủ trọ.', 400);
        }
        if (Email) {
          const existingLandlordByEmail = await Landlord.findOne({ where: { Email } });
          if (existingLandlordByEmail) {
            await transaction.rollback();
            throw new AppError('Email chủ trọ đã tồn tại.', 400);
          }
        }
        // ... (các phần kiểm tra khác của bạn giữ nguyên) ...
  
        await Landlord.create({
          MaTK: newUserAccount.MaTK, HoTen, CCCD, SoDienThoai, NgaySinh, GioiTinh, Email,
        }, { transaction });
      } else if (roleInstance.TenVaiTro === 'Khách thuê') {
         // ... (logic tạo Khách thuê của bạn giữ nguyên) ...
         if (!HoTen || !SoDienThoai) {
            await transaction.rollback();
            throw new AppError('Thiếu thông tin Họ tên hoặc Số điện thoại cho Khách thuê.', 400);
          }
          if (Email) {
            const existingTenantByEmail = await Tenant.findOne({ where: { Email } });
            if (existingTenantByEmail) {
              await transaction.rollback();
              throw new AppError('Email khách thuê đã tồn tại.', 400);
            }
          }
          // ...
        await Tenant.create({
          MaTK: newUserAccount.MaTK, HoTen, CCCD, SoDienThoai, Email, NgaySinh, GioiTinh, QueQuan, TrangThai: 'Đang thuê',
        }, { transaction });
      }
  
      await transaction.commit();
      newUserAccount.MatKhau = undefined;
      return newUserAccount;
  
    } catch (error) {
      await transaction.rollback();
      if (error.name === 'SequelizeUniqueConstraintError') {
        const specificError = error.errors && error.errors.length > 0 ? error.errors[0] : {};
        const field = specificError.path;
        if (field === 'TenDangNhap') throw new AppError('Tên đăng nhập đã tồn tại.', 400);
      }
      console.error("Lỗi trong service register:", error);
      throw error;
    }
};

const login = async (loginData) => {
    const { tenDangNhapOrEmail, matKhau } = loginData;

    // --- Bước 1: Tìm tài khoản người dùng (chỉ lấy dữ liệu cần để xác thực) ---
    let userFromDb;
    if (tenDangNhapOrEmail.includes('@')) {
        let profile = await Landlord.findOne({ where: { Email: tenDangNhapOrEmail } });
        if (!profile) {
            profile = await Tenant.findOne({ where: { Email: tenDangNhapOrEmail } });
        }
        if (profile) {
            userFromDb = await UserAccount.findByPk(profile.MaTK);
        }
    } else {
        userFromDb = await UserAccount.findOne({ where: { TenDangNhap: tenDangNhapOrEmail } });
    }

    // --- Bước 2: So sánh mật khẩu trực tiếp bằng bcrypt ---
    if (!userFromDb || !(await bcrypt.compare(matKhau, userFromDb.MatKhau))) {
        throw new AppError('Tên đăng nhập/email hoặc mật khẩu không chính xác.', 401);
    }
    
    // --- Bước 3: Kiểm tra trạng thái tài khoản ---
    if (userFromDb.TrangThai !== 'Kích hoạt') {
        throw new AppError('Tài khoản của bạn đã bị khóa hoặc chưa được kích hoạt.', 403);
    }

    // --- Bước 4: Lấy thông tin chi tiết và đầy đủ của người dùng để trả về ---
    const fullUser = await UserAccount.findByPk(userFromDb.MaTK, {
        attributes: { exclude: ['MatKhau'] }, // Loại bỏ mật khẩu khỏi kết quả cuối cùng
        include: [
            {
                model: Role,
                as: 'role',
            },
            { model: Landlord, as: 'landlordProfile' },
            { model: Tenant, as: 'tenantProfile' }
        ]
    });
    
    if (!fullUser) {
        throw new AppError('Không thể lấy thông tin chi tiết người dùng.', 500);
    }
    
    // --- Bước 5: Tạo token ---
    const payload = {
        id: fullUser.MaTK,
        tenVaiTro: fullUser.role ? fullUser.role.TenVaiTro : null,
        maVaiTro: fullUser.MaVaiTro,
    };
    const token = generateToken(payload);

    // Trả về đối tượng user đầy đủ và token
    return { user: fullUser, token };
};
  
module.exports = { register, login };