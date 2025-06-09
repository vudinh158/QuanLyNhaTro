// file: server/services/contractService.js
const { Op } = require('sequelize');
const { Contract, Occupant, Room, Tenant, Property, Service, ContractRegisteredService, UserAccount } = require('../models');
const AppError = require('../utils/AppError');
const { sequelize } = require('../models');

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
        KyThanhToan, HanThanhToan, TrangThai, GhiChu,
        occupants, // [{MaKhachThue, LaNguoiDaiDien}]
        registeredServices // [MaDV1, MaDV2]
    } = contractData;

    // --- Validation cơ bản ---
    if (!MaPhong || !NgayBatDau || !NgayKetThuc || !occupants || occupants.length === 0) {
        throw new AppError('Thiếu thông tin Phòng, Thời hạn, hoặc Người ở.', 400);
    }
    if (occupants.filter(o => o.LaNguoiDaiDien).length !== 1) {
        throw new AppError('Mỗi hợp đồng phải có đúng một người đại diện.', 400); //
    }

    const transaction = await sequelize.transaction();
    try {
        // Bước 1: Kiểm tra phòng và quyền sở hữu
        const room = await Room.findByPk(MaPhong, {
            include: [{ model: Property, as: 'property', attributes: ['MaChuTro'] }],
            transaction
        });
        if (!room) throw new AppError('Phòng không tồn tại.', 404);
        if (room.property.MaChuTro !== maChuTro) throw new AppError('Bạn không có quyền tạo hợp đồng cho phòng này.', 403);
        
        // Bước 2: Kiểm tra phòng có trống hoặc sắp trống không
        const overlappingContracts = await Contract.count({
            where: {
                MaPhong: MaPhong,
                TrangThai: { [Op.in]: ['Có hiệu lực', 'Mới tạo'] }, //
                [Op.or]: [
                    { NgayBatDau: { [Op.lt]: NgayKetThuc } },
                    { NgayKetThuc: { [Op.gt]: NgayBatDau } }
                ]
            },
            transaction
        });
        if (overlappingContracts > 0 && room.TrangThai !== 'Còn trống') {
            throw new AppError('Phòng đã có hợp đồng khác trong khoảng thời gian này.', 409);
        }

        // Bước 3: Tạo hợp đồng chính
        const newContract = await Contract.create({
            MaPhong, NgayLap, NgayBatDau, NgayKetThuc, TienCoc, TienThueThoaThuan,
            KyThanhToan, HanThanhToan, TrangThai, GhiChu
        }, { transaction });

        // Bước 4: Thêm người ở cùng
        const occupantData = occupants.map(o => ({ ...o, MaHopDong: newContract.MaHopDong }));
        await Occupant.bulkCreate(occupantData, { transaction });

        // Bước 5: Đăng ký dịch vụ cố định
        if (registeredServices && registeredServices.length > 0) {
            const serviceRegistrationData = registeredServices.map(maDV => ({ MaHopDong: newContract.MaHopDong, MaDV: maDV }));
            await ContractRegisteredService.bulkCreate(serviceRegistrationData, { transaction });
        }

        // Bước 6: Cập nhật trạng thái phòng
        if (TrangThai === 'Có hiệu lực') {
            await room.update({ TrangThai: 'Đang thuê' }, { transaction });
        } else if (TrangThai === 'Mới tạo' && TienCoc > 0) {
            await room.update({ TrangThai: 'Đặt cọc' }, { transaction }); //
        }

        await transaction.commit();
        return getContractById(newContract.MaHopDong, {MaChuTro: maChuTro, TenVaiTro: 'Chủ trọ'});

    } catch (error) {
        await transaction.rollback();
        throw error; // Ném lỗi ra ngoài để controller bắt
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