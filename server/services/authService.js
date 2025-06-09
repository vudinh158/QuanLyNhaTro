const bcrypt = require("bcryptjs"); //
const jwt = require("jsonwebtoken");
const {
  UserAccount,
  Role,
  Landlord,
  Tenant,
  Permission,
  sequelize,
} = require("../models");
const AppError = require("../utils/AppError");
const { generateToken } = require("../utils/jwtUtils");
const transporter = require("../config/mail");
const { Otp } = require("../models");
const { Op } = require("sequelize");

function randomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Hàm gửi OTP vào email, lưu vào DB
async function sendOtp(email) {
    if (!email) throw new AppError('Email là bắt buộc.', 400);
  
    const code = randomCode();
    const expiresAt = '10m'; // Thời gian hết hạn của token
  
    // Gửi email chứa mã OTP gốc
    await transporter.sendMail({
      to: email,
      subject: 'Mã OTP xác thực tài khoản',
      text: `Mã xác thực của bạn là ${code}. Mã này sẽ hết hạn sau 10 phút.`,
    });
  
    // Băm mã OTP trước khi đưa vào token
    const hashedCode = await bcrypt.hash(code, 10);
  
    // Tạo JWT chứa email và mã OTP đã băm
    const otpToken = jwt.sign(
      { email, hashedCode },
      process.env.JWT_SECRET, // Đảm bảo bạn có JWT_SECRET trong file .env
      { expiresIn: expiresAt }
    );
  
    return { otpToken };
  }

// Hàm verify OTP, xóa bản ghi khi thành công
async function verifyOtp(code, otpToken) {
    if (!code || !otpToken) {
      throw new AppError('Mã OTP và token là bắt buộc.', 400);
    }
  
    try {
      // Xác thực và giải mã token
      const decoded = jwt.verify(otpToken, process.env.JWT_SECRET);
  
      // So sánh mã người dùng nhập với hash trong token
      const isMatch = await bcrypt.compare(code, decoded.hashedCode);
  
      if (!isMatch) {
        throw new AppError('Mã OTP không chính xác.', 401);
      }
  
      // Nếu muốn, bạn có thể kiểm tra email trong token
      // if (decoded.email !== emailFromSomewhere) { ... }
  
      return { message: 'Xác thực OTP thành công.' };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Mã OTP đã hết hạn.', 401);
      }
      if (error instanceof jwt.JsonWebTokenError) {
          throw new AppError('Token OTP không hợp lệ.', 401);
      }
      // Ném lại các lỗi khác (ví dụ từ bcrypt hoặc AppError đã ném ở trên)
      throw error;
    }
  }

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

  const existingUserByUsername = await UserAccount.findOne({
    where: { TenDangNhap },
  });
  if (existingUserByUsername) {
    throw new AppError("Tên đăng nhập đã tồn tại.", 400);
  }

  const roleInstance = await Role.findByPk(MaVaiTro);
  if (!roleInstance) {
    throw new AppError("Mã vai trò không hợp lệ.", 400);
  }

  const transaction = await sequelize.transaction();

  try {
    const newUserAccount = await UserAccount.create(
      {
        TenDangNhap,
        MatKhau,
        MaVaiTro: roleInstance.MaVaiTro,
        TrangThai: "Kích hoạt",
      },
      { transaction }
    );

    if (roleInstance.TenVaiTro === "Chủ trọ") {
      if (!HoTen || !SoDienThoai) {
        await transaction.rollback();
        throw new AppError(
          "Thiếu thông tin Họ tên hoặc Số điện thoại cho Chủ trọ.",
          400
        );
      }
      if (Email) {
        const existingLandlordByEmail = await Landlord.findOne({
          where: { Email },
        });
        if (existingLandlordByEmail) {
          await transaction.rollback();
          throw new AppError("Email chủ trọ đã tồn tại.", 400);
        }
      }
      // ... (các phần kiểm tra khác của bạn giữ nguyên) ...

      await Landlord.create(
        {
          MaTK: newUserAccount.MaTK,
          HoTen,
          CCCD,
          SoDienThoai,
          NgaySinh,
          GioiTinh,
          Email,
        },
        { transaction }
      );
    } else if (roleInstance.TenVaiTro === "Khách thuê") {
      // ... (logic tạo Khách thuê của bạn giữ nguyên) ...
      if (!HoTen || !SoDienThoai) {
        await transaction.rollback();
        throw new AppError(
          "Thiếu thông tin Họ tên hoặc Số điện thoại cho Khách thuê.",
          400
        );
      }
      if (Email) {
        const existingTenantByEmail = await Tenant.findOne({
          where: { Email },
        });
        if (existingTenantByEmail) {
          await transaction.rollback();
          throw new AppError("Email khách thuê đã tồn tại.", 400);
        }
      }
      // ...
      await Tenant.create(
        {
          MaTK: newUserAccount.MaTK,
          HoTen,
          CCCD,
          SoDienThoai,
          Email,
          NgaySinh,
          GioiTinh,
          QueQuan,
          TrangThai: "Đang thuê",
        },
        { transaction }
      );
    }

    await transaction.commit();
    newUserAccount.MatKhau = undefined;
    return newUserAccount;
  } catch (error) {
    await transaction.rollback();
    if (error.name === "SequelizeUniqueConstraintError") {
      const specificError =
        error.errors && error.errors.length > 0 ? error.errors[0] : {};
      const field = specificError.path;
      if (field === "TenDangNhap")
        throw new AppError("Tên đăng nhập đã tồn tại.", 400);
    }
    console.error("Lỗi trong service register:", error);
    throw error;
  }
};

const login = async (loginData) => {
  const { tenDangNhapOrEmail, matKhau } = loginData;

  // --- Bước 1: Tìm tài khoản người dùng (chỉ lấy dữ liệu cần để xác thực) ---
  let userFromDb;
  if (tenDangNhapOrEmail.includes("@")) {
    let profile = await Landlord.findOne({
      where: { Email: tenDangNhapOrEmail },
    });
    if (!profile) {
      profile = await Tenant.findOne({ where: { Email: tenDangNhapOrEmail } });
    }
    if (profile) {
      userFromDb = await UserAccount.findByPk(profile.MaTK);
    }
  } else {
    userFromDb = await UserAccount.findOne({
      where: { TenDangNhap: tenDangNhapOrEmail },
    });
  }

  // --- Bước 2: So sánh mật khẩu trực tiếp bằng bcrypt ---
  if (!userFromDb || !(await bcrypt.compare(matKhau, userFromDb.MatKhau))) {
    throw new AppError(
      "Tên đăng nhập/email hoặc mật khẩu không chính xác.",
      401
    );
  }

  // --- Bước 3: Kiểm tra trạng thái tài khoản ---
  if (userFromDb.TrangThai !== "Kích hoạt") {
    throw new AppError(
      "Tài khoản của bạn đã bị khóa hoặc chưa được kích hoạt.",
      403
    );
  }

  // --- Bước 4: Lấy thông tin chi tiết và đầy đủ của người dùng để trả về ---
  const fullUser = await UserAccount.findByPk(userFromDb.MaTK, {
    attributes: { exclude: ["MatKhau"] }, // Loại bỏ mật khẩu khỏi kết quả cuối cùng
    include: [
      {
        model: Role,
        as: "role",
      },
      { model: Landlord, as: "landlordProfile" },
      { model: Tenant, as: "tenantProfile" },
    ],
  });

  if (!fullUser) {
    throw new AppError("Không thể lấy thông tin chi tiết người dùng.", 500);
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

module.exports = {
  sendOtp,
  verifyOtp,
  register,
  login,
};
