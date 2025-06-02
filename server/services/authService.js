const {
    UserAccount, 
    Role,        
    Landlord,    
    Tenant       
  } = require('../models'); 
  const AppError = require('../utils/AppError');
  const { generateToken } = require('../utils/jwtUtils');
  
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
  
    const existingUserByUsername = await UserAccount.findOne({ where: { TenDangNhap } });
    if (existingUserByUsername) {
      throw new AppError('Tên đăng nhập đã tồn tại.', 400);
    }
  
    const roleInstance = await Role.findByPk(MaVaiTro); 
    if (!roleInstance) {
      throw new AppError('Mã vai trò không hợp lệ.', 400);
    }
  
    const transaction = await UserAccount.sequelize.transaction(); 
  
    try {
      const newUserAccount = await UserAccount.create({ 
        TenDangNhap,
        MatKhau,
        MaVaiTro: roleInstance.MaVaiTro, 
        TrangThai: 'Kích hoạt',
      }, { transaction });
  
      if (roleInstance.TenVaiTro === 'Chủ trọ') {
        if (!HoTen || !SoDienThoai) {
          await transaction.rollback();
          throw new AppError('Thiếu thông tin Họ tên hoặc Số điện thoại cho Chủ trọ.', 400);
        }
        if (Email) {
          const existingLandlordByEmail = await Landlord.findOne({ where: { Email } }); // Sử dụng Landlord
          if (existingLandlordByEmail) {
            await transaction.rollback();
            throw new AppError('Email chủ trọ đã tồn tại.', 400);
          }
        }
        const existingLandlordByPhone = await Landlord.findOne({ where: { SoDienThoai } }); // Sử dụng Landlord
        if (existingLandlordByPhone) {
          await transaction.rollback();
          throw new AppError('Số điện thoại chủ trọ đã tồn tại.', 400);
        }
        if (CCCD) {
          const existingLandlordByCCCD = await Landlord.findOne({ where: { CCCD } }); // Sử dụng Landlord
          if (existingLandlordByCCCD) {
            await transaction.rollback();
            throw new AppError('CCCD chủ trọ đã tồn tại.', 400);
          }
        }
  
        await Landlord.create({
          MaTK: newUserAccount.MaTK,
          HoTen,
          CCCD,
          SoDienThoai,
          NgaySinh,
          GioiTinh,
          Email,
        }, { transaction });
      } else if (roleInstance.TenVaiTro === 'Khách thuê') {
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
        const existingTenantByPhone = await Tenant.findOne({ where: { SoDienThoai } }); 
        if (existingTenantByPhone) {
          await transaction.rollback();
          throw new AppError('Số điện thoại khách thuê đã tồn tại.', 400);
        }
        if (CCCD) {
          const existingTenantByCCCD = await Tenant.findOne({ where: { CCCD } }); 
          if (existingTenantByCCCD) {
            await transaction.rollback();
            throw new AppError('CCCD khách thuê đã tồn tại.', 400);
          }
        }
  
        await Tenant.create({ 
          MaTK: newUserAccount.MaTK,
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
  
    let userAccountInstance = await UserAccount.findOne({ 
      where: { TenDangNhap: tenDangNhapOrEmail },
      include: [{ model: Role, as: 'role' }] 
    });
  
    if (!userAccountInstance && tenDangNhapOrEmail.includes('@')) {
      let profile = await Landlord.findOne({ where: { Email: tenDangNhapOrEmail } }); 
      if (!profile) {
        profile = await Tenant.findOne({ where: { Email: tenDangNhapOrEmail } }); 
      }
      if (profile && profile.MaTK) {
        userAccountInstance = await UserAccount.findByPk(profile.MaTK, { 
          include: [{ model: Role, as: 'role' }]
        });
      }
    }
  
    if (!userAccountInstance || !(await userAccountInstance.comparePassword(matKhau))) {
      throw new AppError('Tên đăng nhập/email hoặc mật khẩu không chính xác.', 401);
    }
  
    if (userAccountInstance.TrangThai !== 'Kích hoạt') {
      throw new AppError('Tài khoản của bạn đã bị khóa hoặc chưa được kích hoạt.', 403);
    }
  
    const payload = {
      id: userAccountInstance.MaTK,
      tenVaiTro: userAccountInstance.role ? userAccountInstance.role.TenVaiTro : null,
      maVaiTro: userAccountInstance.MaVaiTro,
    };
    const token = generateToken(payload);
  
    userAccountInstance.MatKhau = undefined;
    return { user: userAccountInstance, token };
  };
  
  module.exports = { register, login };