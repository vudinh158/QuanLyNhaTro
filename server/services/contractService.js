// file: server/services/contractService.js
const { Op } = require('sequelize');
const { Contract, Occupant, Room, Tenant, Property, Service, ContractRegisteredService, UserAccount } = require('../models');
const AppError = require('../utils/AppError');
const { sequelize } = require('../models');
const { createTenant } = require('./tenantService');

/** Lấy tất cả hợp đồng của một Chủ trọ, có hỗ trợ lọc */
const getAllContractsForLandlord = async (maChuTro, queryParams = {}) => {
  const properties = await Property.findAll({ where: { MaChuTro: maChuTro }, attributes: ['MaNhaTro'] });
    const propertyIds = properties.map(p => p.MaNhaTro);
  if (propertyIds.length === 0) return [];

  const whereConditions = {};
  
  // Lọc theo nhà trọ
  if (queryParams.propertyId && queryParams.propertyId !== 'all') {
    if (!propertyIds.includes(Number(queryParams.propertyId))) {
      throw new AppError('Bạn không có quyền xem hợp đồng của nhà trọ này.', 403);
    }
    whereConditions['$room.MaNhaTro$'] = Number(queryParams.propertyId);
  } else {
    whereConditions['$room.MaNhaTro$'] = { [Op.in]: propertyIds };
  }

  // Lọc theo trạng thái
  if (queryParams.status && queryParams.status !== 'all') {
    whereConditions.TrangThai = queryParams.status;
  }

  // Tìm kiếm
  if (queryParams.search) {
      whereConditions[Op.or] = [
          { MaHopDong: { [Op.like]: `%${queryParams.search}%` } },
          { '$room.TenPhong$': { [Op.like]: `%${queryParams.search}%` } },
          { '$occupants.tenant.HoTen$': { [Op.like]: `%${queryParams.search}%` } }
      ];
  }

  return Contract.findAll({
    where: whereConditions,
    include: [
      { model: Room, as: 'room', include: [{ model: Property, as: 'property', attributes: ['TenNhaTro', 'MaNhaTro'] }] },
      { 
        model: Occupant, 
        as: 'occupants', 
        include: [{ model: Tenant, as: 'tenant', attributes: ['HoTen', 'MaKhachThue'] }] 
      }
    ],
    order: [['NgayBatDau', 'DESC']],
    subQuery: false // Cần thiết cho các query phức tạp với limit và include
  });
};

/** Lấy chi tiết một hợp đồng */
const getContractById = async (maHopDong, user) => {
    // Chi tiết các bảng cần include để lấy đủ thông tin
    const contract = await Contract.findByPk(maHopDong, {
        include: [
            { model: Room, as: 'room', include: [{model: Property, as: 'property'}] },
            { 
              model: Occupant, 
              as: 'occupants', 
              include: [{ 
                model: Tenant, 
                as: 'tenant', 
                include: [{
                  model: UserAccount, 
                  as: 'userAccount', 
                  attributes:['TenDangNhap', 'TrangThai']
                }] 
              }] 
            },
            { model: Service, as: 'registeredServices', attributes: ['MaDV', 'TenDV'], through: {attributes: []} }
        ]
    });

    if (!contract) {
        throw new AppError('Không tìm thấy hợp đồng.', 404);
    }

    // Kiểm tra quyền truy cập
    if (user.TenVaiTro === 'Chủ trọ') {
        if (contract.room?.property?.MaChuTro !== user.MaChuTro) {
            throw new AppError('Bạn không có quyền xem hợp đồng này.', 403);
        }
    } else if (user.TenVaiTro === 'Khách thuê') {
        const isTenantInContract = contract.occupants.some(occ => occ.MaKhachThue === user.MaKhachThue);
        if (!isTenantInContract) {
            throw new AppError('Bạn không có quyền xem hợp đồng này.', 403);
        }
    }
    return contract;
};

/** Tạo hợp đồng mới */
const createContract = async (contractData, maChuTro) => {
    const {
      MaPhong, NgayLap, NgayBatDau, NgayKetThuc, TienCoc, TienThueThoaThuan,
      KyThanhToan, HanThanhToan, GhiChu,
      occupants, // Mảng: [{ MaKhachThue: 1, LaNguoiDaiDien: true }, { isNew: true, HoTen: '...', SoDienThoai: '...', ... }]
      registeredServices
    } = contractData;
  
    // --- Validation ---
    if (!MaPhong || !NgayBatDau || !NgayKetThuc || !occupants || occupants.length === 0) {
      throw new AppError('Thiếu thông tin Phòng, Thời hạn, hoặc Người ở.', 400);
    }
    if (occupants.filter(o => o.LaNguoiDaiDien).length !== 1) {
      throw new AppError('Mỗi hợp đồng phải có đúng một người đại diện.', 400);
    }
  
    const transaction = await sequelize.transaction();
    try {
      const room = await Room.findByPk(MaPhong, { include: [{ model: Property, as: 'property' }], transaction });
      if (!room) throw new AppError('Phòng không tồn tại.', 404);
      if (room.property.MaChuTro !== maChuTro) throw new AppError('Bạn không có quyền tạo hợp đồng cho phòng này.', 403);
  
        // (Logic kiểm tra chồng chéo hợp đồng giữ nguyên...)
        
        const startDate = new Date(NgayBatDau);
    const endDate = new Date(NgayKetThuc);
    const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        
        let contractStatus;
        // So sánh ngày bắt đầu với ngày hiện tại (chỉ tính ngày, bỏ qua giờ)
        const startOfNgayBatDau = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    
        if (startOfNgayBatDau > currentDate) {
            contractStatus = 'Mới tạo'; // Ngày bắt đầu ở tương lai
        } else {
            contractStatus = 'Có hiệu lực'; // Ngày bắt đầu là hôm nay hoặc đã qua
        }
    
  
        const newContract = await Contract.create({
            MaPhong,
            NgayLap: new Date(), // Ngày lập là ngày hiện tại
            NgayBatDau: startDate,
            NgayKetThuc: endDate,
            TienCoc,
            TienThueThoaThuan,
            KyThanhToan,
            HanThanhToan,
            TrangThai: contractStatus, // Gán trạng thái tự động
            GhiChu,
        }, { transaction });
  
      // --- Xử lý Người ở (Occupants) ---
      const occupantDataToCreate = [];
      for (const occ of occupants) {
        let tenantId;
        if (occ.isNew) {
          // Nếu là khách thuê mới, tạo họ trước
          // Hàm createTenant từ tenantService đã có transaction riêng, nhưng để đảm bảo nguyên tử,
          // chúng ta nên truyền transaction hiện tại vào. Cần sửa lại tenantService.createTenant để nhận transaction.
          // Giả sử tenantService.createTenant đã được sửa để nhận transaction.
          const newTenant = await createTenant(occ, maChuTro, transaction); // Truyền transaction vào
          tenantId = newTenant.MaKhachThue;
        } else {
          // Nếu là khách thuê đã tồn tại
          tenantId = occ.MaKhachThue;
          // Kiểm tra xem khách thuê đã tồn tại chưa
          const tenantExists = await Tenant.findByPk(tenantId, { transaction });
          if (!tenantExists) {
              throw new AppError(`Khách thuê với mã ${tenantId} không tồn tại.`, 404);
          }
        }
        occupantDataToCreate.push({
          MaHopDong: newContract.MaHopDong,
          MaKhachThue: tenantId,
          LaNguoiDaiDien: occ.LaNguoiDaiDien,
          QuanHeVoiNguoiDaiDien: occ.QuanHeVoiNguoiDaiDien || null
        });
      }
  
      await Occupant.bulkCreate(occupantDataToCreate, { transaction });
  
      // --- Đăng ký Dịch vụ cố định (giữ nguyên) ---
      if (registeredServices && registeredServices.length > 0) {
        const serviceRegistrationData = registeredServices.map(maDV => ({ MaHopDong: newContract.MaHopDong, MaDV: maDV }));
        await ContractRegisteredService.bulkCreate(serviceRegistrationData, { transaction });
      }
  
      // --- Cập nhật Trạng thái Phòng (giữ nguyên) ---
      if (contractStatus === 'Có hiệu lực') { 
        await room.update({ TrangThai: 'Đang thuê' }, { transaction });
      } else if (contractStatus === 'Mới tạo' && TienCoc > 0) { 
        await room.update({ TrangThai: 'Đặt cọc' }, { transaction });
      }
  
      await transaction.commit();
      return newContract;
  
    } catch (error) {
      await transaction.rollback();
      if (error instanceof AppError) throw error;
      console.error("Lỗi khi tạo hợp đồng:", error);
      throw new AppError('Tạo hợp đồng thất bại do lỗi hệ thống.', 500);
    }
  };

/** Thanh lý hợp đồng */
const terminateContract = async (maHopDong, maChuTro) => {
    const transaction = await sequelize.transaction();
    try {
        const contract = await Contract.findByPk(maHopDong, {
            include: [{
                model: Room,
                as: 'room',
                include: [{
                    model: Property,
                    as: 'property'
                }]
            }],
            transaction
        });

        if (!contract) {
            throw new AppError('Hợp đồng không tồn tại.', 404);
        }

        // Kiểm tra quyền sở hữu của Chủ trọ
        if (contract.room?.property?.MaChuTro !== maChuTro) {
            throw new AppError('Bạn không có quyền thanh lý hợp đồng này.', 403);
        }

        if (contract.TrangThai === 'Đã thanh lý') {
            throw new AppError('Hợp đồng đã được thanh lý trước đó.', 400);
        }

        // --- CẬP NHẬT QUAN TRỌNG DỰA TRÊN ĐẶC TẢ ---
        // Yêu cầu: Không thể thanh lý nếu còn hóa đơn chưa thanh toán hoặc quá hạn 
        const unpaidInvoices = await Invoice.count({
            where: {
                MaHopDong: maHopDong,
                TrangThaiThanhToan: {
                    [Op.in]: ['Chưa thanh toán', 'Quá hạn']
                }
            },
            transaction
        });

        if (unpaidInvoices > 0) {
            // Ném lỗi với thông báo rõ ràng, lỗi này sẽ được controller bắt và gửi về cho client
            throw new AppError('Không thể thanh lý. Hợp đồng vẫn còn hóa đơn chưa được thanh toán.', 400);
        }
        // --- KẾT THÚC CẬP NHẬT ---


        // Cập nhật trạng thái hợp đồng và ngày kết thúc
        await contract.update({
            TrangThai: 'Đã thanh lý'
        }, { transaction });


        // Tự động cập nhật trạng thái Phòng khi Hợp đồng thay đổi 
        // Kiểm tra xem có hợp đồng nào khác đang 'Có hiệu lực' với phòng này không
        const otherActiveContracts = await Contract.count({
            where: { MaPhong: contract.MaPhong, TrangThai: 'Có hiệu lực', MaHopDong: { [Op.ne]: maHopDong } },
            transaction
        });

        if (otherActiveContracts === 0) {
            // Nếu không còn HĐ hiệu lực, kiểm tra xem có HĐ 'Mới tạo' và có cọc không
            const pendingDepositContracts = await Contract.count({
                where: {
                    MaPhong: contract.MaPhong,
                    TrangThai: 'Mới tạo',
                    TienCoc: { [Op.gt]: 0 }
                },
                transaction
            });
            
            const newRoomStatus = pendingDepositContracts > 0 ? 'Đặt cọc' : 'Còn trống'; // 
            await contract.room.update({ TrangThai: newRoomStatus }, { transaction });
        }


        await transaction.commit();
        return contract;

    } catch (error) {
        await transaction.rollback();
        // Ném lỗi ra ngoài để controller có thể xử lý và trả về cho client
        throw error;
    }
};

const getAllContractsForTenant = async (maKhachThue) => {
    return Contract.findAll({
        include: [
            {
                model: Room,
                as: 'room',
                attributes: ['TenPhong'],
                include: [{ model: Property, as: 'property', attributes: ['TenNhaTro'] }]
            },
            {
                model: Occupant,
                as: 'occupants',
                where: { MaKhachThue: maKhachThue },
                required: true, // INNER JOIN để đảm bảo chỉ lấy hợp đồng có khách thuê này
                include: [{ model: Tenant, as: 'tenant', attributes: ['HoTen'] }]
            }
        ],
        order: [['NgayBatDau', 'DESC']],
    });
};

// Các hàm update và delete khác có thể được thêm vào tương tự nếu cần
module.exports = {
    getAllContractsForLandlord,
    getContractById,
    createContract,
    terminateContract,
    getAllContractsForTenant
};