// apps/server-express/src/services/tenantService.js
const { Tenant, UserAccount, Role, Property, Room, Contract, Occupant } = require('../models');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');
const { sequelize } = require('../models'); // Import sequelize instance for transactions

/**
 * Lấy danh sách tất cả khách thuê (có thể của một chủ trọ cụ thể nếu cần)
 * Backend sẽ cần filter dựa trên MaChuTro của người dùng đang đăng nhập
 * nếu không phải là admin.
 */
const getAllTenantsForLandlord = async (maChuTro, queryParams) => {
  // Logic để chỉ lấy khách thuê liên quan đến các nhà trọ của maChuTro này
  // Điều này đòi hỏi một query phức tạp hơn, join qua nhiều bảng
  // Hoặc một cách tiếp cận đơn giản hơn là lấy tất cả khách thuê và frontend filter (ít bảo mật hơn)
  // Hoặc bạn có thể thêm một trường MaChuTroTao vào bảng KhachThue nếu muốn đơn giản hóa việc này.

  // Cách tiếp cận: Lấy tất cả các phòng thuộc nhà trọ của chủ trọ,
  // sau đó lấy các hợp đồng, rồi lấy người ở cùng (khách thuê)
  const properties = await Property.findAll({
    where: { MaChuTro: maChuTro },
    attributes: ['MaNhaTro']
  });
  const propertyIds = properties.map(p => p.MaNhaTro);

  if (propertyIds.length === 0) {
    return []; // Chủ trọ không có nhà trọ nào thì không có khách thuê nào liên quan trực tiếp
  }

  const rooms = await Room.findAll({
    where: { MaNhaTro: { [Op.in]: propertyIds } },
    attributes: ['MaPhong']
  });
  const roomIds = rooms.map(r => r.MaPhong);

  if (roomIds.length === 0) {
    return [];
  }

  const contracts = await Contract.findAll({
    where: { MaPhong: { [Op.in]: roomIds }, TrangThai: 'Có hiệu lực' }, // Chỉ lấy HĐ có hiệu lực
    attributes: ['MaHopDong']
  });
  const contractIds = contracts.map(c => c.MaHopDong);

  if (contractIds.length === 0) {
    return [];
  }

  const occupants = await Occupant.findAll({
    where: { MaHopDong: { [Op.in]: contractIds } },
    attributes: ['MaKhachThue'],
    group: ['MaKhachThue'] // Lấy MaKhachThue duy nhất
  });
  const tenantIds = occupants.map(o => o.MaKhachThue);

  if (tenantIds.length === 0) {
    return [];
  }

  // Xây dựng điều kiện tìm kiếm và phân trang (ví dụ)
  const whereConditions = { MaKhachThue: { [Op.in]: tenantIds } };
  if (queryParams.search) {
    whereConditions[Op.or] = [
      { HoTen: { [Op.like]: `%${queryParams.search}%` } },
      { SoDienThoai: { [Op.like]: `%${queryParams.search}%` } },
      { Email: { [Op.like]: `%${queryParams.search}%` } },
      { CCCD: { [Op.like]: `%${queryParams.search}%` } },
    ];
  }
   if (queryParams.status && ['Đang thuê', 'Đã rời đi', 'Tiềm năng'].includes(queryParams.status)) {
    whereConditions.TrangThai = queryParams.status;
  }


  const tenants = await Tenant.findAll({
    where: whereConditions,
    include: [{ model: UserAccount, as: 'userAccount', attributes: ['TenDangNhap', 'TrangThai'] }],
    order: [['HoTen', 'ASC']],
    // Thêm limit, offset cho phân trang nếu cần
  });
  return tenants;
};


const getTenantByIdForLandlord = async (maKhachThue, maChuTro) => {
  const tenant = await Tenant.findByPk(maKhachThue, {
    include: [
      { model: UserAccount, as: 'userAccount', attributes: ['TenDangNhap', 'TrangThai', 'MaVaiTro'] },
      // Include thêm thông tin hợp đồng, phòng, nhà trọ mà khách này đang thuê
      {
        model: Occupant,
        as: 'occupancies',
        include: [{
          model: Contract,
          as: 'contract',
          include: [{
            model: Room,
            as: 'room',
            include: [{
              model: Property,
              as: 'property',
              where: { MaChuTro: maChuTro }, // Đảm bảo nhà trọ thuộc chủ trọ này
              required: true
            }]
          }]
        }],
        // Lọc để chỉ lấy các occupancy thuộc nhà trọ của chủ trọ hiện tại
        // (Có thể cần tối ưu query này)
      }
    ]
  });

  if (!tenant) {
    throw new AppError('Không tìm thấy khách thuê.', 404);
  }
  // Kiểm tra sâu hơn xem khách thuê này có thực sự liên quan đến chủ trọ không
  // qua các hợp đồng/phòng (nếu không có Occupancy nào khớp => không thuộc)
  if (tenant.occupancies && tenant.occupancies.length > 0) {
      const relatedToLandlord = tenant.occupancies.some(occ =>
          occ.contract && occ.contract.room && occ.contract.room.property
      );
      if (!relatedToLandlord) {
          throw new AppError('Bạn không có quyền xem thông tin khách thuê này.', 403);
      }
  } else {
      // Nếu khách thuê này không có occupancy nào (ví dụ: khách tiềm năng chưa có hợp đồng)
      // và bạn vẫn muốn chủ trọ quản lý họ (ví dụ: MaChuTroTao trong Tenant),
      // thì cần logic kiểm tra khác. Hiện tại, nếu không có occupancy liên quan,
      // chủ trọ không xem được (trừ khi là admin xem tất cả).
      // Hoặc nếu tenant được tạo bởi chủ trọ đó (cần thêm MaChuTroTao vào Tenant)
      // if(tenant.MaNguoiTao !== maChuTro) throw new AppError('Bạn không có quyền xem thông tin khách thuê này.', 403);
       throw new AppError('Khách thuê này hiện không có hợp đồng nào thuộc quản lý của bạn.', 404);
  }


  return tenant;
};

const createTenant = async (tenantData, landlordMaTK, t) => {
  const {
    HoTen, CCCD, SoDienThoai, Email, NgaySinh, GioiTinh, QueQuan, GhiChu, AnhGiayTo, TrangThai,
    TenDangNhap, MatKhau, // Cho UserAccount
  } = tenantData;

  if (!HoTen || !SoDienThoai) {
    throw new AppError('Họ tên và Số điện thoại là bắt buộc.', 400);
  }

  // Kiểm tra unique cho SoDienThoai, Email, CCCD trong Tenant
  if (SoDienThoai) {
    const existingByPhone = await Tenant.findOne({ where: { SoDienThoai } });
    if (existingByPhone) throw new AppError('Số điện thoại đã được sử dụng.', 400);
  }
  if (Email) {
    const existingByEmail = await Tenant.findOne({ where: { Email } });
    if (existingByEmail) throw new AppError('Email đã được sử dụng.', 400);
  }
  if (CCCD) {
    const existingByCCCD = await Tenant.findOne({ where: { CCCD } });
    if (existingByCCCD) throw new AppError('CCCD đã được sử dụng.', 400);
  }

  const transaction = t || await sequelize.transaction();
  try {
    let newMaTK = null;
    if (TenDangNhap && MatKhau) { // Nếu có tạo tài khoản
      const existingUserAccount = await UserAccount.findOne({ where: { TenDangNhap }, transaction });
      if (existingUserAccount) {
        if (!t) await transaction.rollback();
        throw new AppError('Tên đăng nhập đã tồn tại.', 400);
      }
      const khachThueRole = await Role.findOne({ where: { TenVaiTro: 'Khách thuê' }, transaction });
      if (!khachThueRole) {
        if (!t) await transaction.rollback();
        throw new AppError('Không tìm thấy vai trò "Khách thuê".', 500);
      }
      const newUserAccount = await UserAccount.create({
        TenDangNhap,
        MatKhau, // Sẽ được hash tự động
        MaVaiTro: khachThueRole.MaVaiTro,
        TrangThai: 'Kích hoạt',
      }, { transaction });
      newMaTK = newUserAccount.MaTK;
    }

    const newTenant = await Tenant.create({
      MaTK: newMaTK, // Có thể là null nếu không tạo tài khoản
      HoTen, CCCD, SoDienThoai, Email, NgaySinh, GioiTinh, QueQuan, GhiChu, AnhGiayTo,
      TrangThai: TrangThai || 'Đang thuê',
      // MaNguoiTao: landlordMaTK, // (Tùy chọn) Nếu bạn muốn lưu ai đã tạo khách thuê này
    }, { transaction: transaction });

    if (!t) await transaction.commit();
    return newTenant;
  } catch (error) {
    if (!t) await transaction.commit();
    if (error.name === 'SequelizeUniqueConstraintError') {
        const field = error.errors && error.errors.length > 0 ? error.errors[0].path : 'unknown';
        throw new AppError(`Giá trị cho trường ${field} đã tồn tại. Vui lòng kiểm tra lại.`, 400);
    }
    throw error;
  }
};

const updateTenant = async (maKhachThue, updateData, maChuTro) => {
  // Lấy thông tin khách thuê và kiểm tra xem có thuộc quyền quản lý của chủ trọ không
  const tenant = await getTenantByIdForLandlord(maKhachThue, maChuTro); // Hàm này đã kiểm tra quyền
  if (!tenant) {
      throw new AppError('Không tìm thấy khách thuê hoặc bạn không có quyền chỉnh sửa.', 404);
  }


  // Kiểm tra unique cho các trường nếu chúng được thay đổi
  if (updateData.SoDienThoai && updateData.SoDienThoai !== tenant.SoDienThoai) {
    const existing = await Tenant.findOne({ where: { SoDienThoai: updateData.SoDienThoai, MaKhachThue: { [Op.ne]: maKhachThue } }});
    if (existing) throw new AppError('Số điện thoại mới đã được sử dụng.', 400);
  }
  if (updateData.Email && updateData.Email !== tenant.Email) {
    const existing = await Tenant.findOne({ where: { Email: updateData.Email, MaKhachThue: { [Op.ne]: maKhachThue } }});
    if (existing) throw new AppError('Email mới đã được sử dụng.', 400);
  }
  if (updateData.CCCD && updateData.CCCD !== tenant.CCCD) {
    const existing = await Tenant.findOne({ where: { CCCD: updateData.CCCD, MaKhachThue: { [Op.ne]: maKhachThue } }});
    if (existing) throw new AppError('CCCD mới đã được sử dụng.', 400);
  }


  // Không cho phép cập nhật MaTK trực tiếp ở đây
  const allowedUpdates = ['HoTen', 'CCCD', 'SoDienThoai', 'Email', 'NgaySinh', 'GioiTinh', 'QueQuan', 'GhiChu', 'AnhGiayTo', 'TrangThai'];
  const updatesToApply = {};
  allowedUpdates.forEach(key => {
      if (updateData.hasOwnProperty(key)) {
          updatesToApply[key] = updateData[key];
      }
  });

  if (Object.keys(updatesToApply).length === 0) {
      throw new AppError('Không có thông tin hợp lệ để cập nhật.', 400);
  }


  await tenant.update(updatesToApply);
  return tenant.reload({ // Tải lại để có thông tin mới nhất và các include
      include: [{ model: UserAccount, as: 'userAccount', attributes: ['TenDangNhap', 'TrangThai'] }]
  });
};

const deleteTenant = async (maKhachThue, maChuTro) => {
  const tenant = await getTenantByIdForLandlord(maKhachThue, maChuTro); // Kiểm tra quyền sở hữu
   if (!tenant) {
      throw new AppError('Không tìm thấy khách thuê hoặc bạn không có quyền xóa.', 404);
  }

  // Kiểm tra ràng buộc: khách thuê không có hợp đồng "Có hiệu lực"
  const activeOccupancies = await Occupant.count({
    where: { MaKhachThue: maKhachThue },
    include: [{
        model: Contract,
        as: 'contract',
        where: { TrangThai: 'Có hiệu lực' },
        required: true
    }]
  });

  if (activeOccupancies > 0) {
    throw new AppError('Không thể xóa khách thuê vì họ đang có hợp đồng hiệu lực.', 400);
  }

  const transaction = await sequelize.transaction();
  try {
    // Xóa các liên kết trong NguoiOCung trước (nếu có HĐ đã hết hạn)
    await Occupant.destroy({ where: { MaKhachThue: maKhachThue }, transaction });

    // Nếu khách thuê có tài khoản, có thể cân nhắc vô hiệu hóa thay vì xóa cứng
    if (tenant.MaTK) {
      const userAccount = await UserAccount.findByPk(tenant.MaTK);
      if (userAccount) {
        await userAccount.update({ TrangThai: 'Vô hiệu hóa' }, { transaction });
        // Hoặc xóa hẳn nếu nghiệp vụ cho phép
        // await userAccount.destroy({ transaction });
      }
    }
    // Xóa khách thuê
    await tenant.destroy({ transaction });
    await transaction.commit();
  } catch(error) {
    await transaction.rollback();
    throw error;
  }
};


module.exports = {
  getAllTenantsForLandlord,
  getTenantByIdForLandlord,
  createTenant,
  updateTenant,
  deleteTenant,
};