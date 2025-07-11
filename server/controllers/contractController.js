// file: server/controllers/contractController.js
const contractService = require('../services/contractService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { Contract, Occupant, Room, Property, Tenant, UserAccount, Service } = require('../models'); 

// exports.getAllContracts = catchAsync(async (req, res, next) => {
//   if (!req.user || !req.user.MaChuTro) {
//     return next(new AppError('Chỉ chủ trọ mới có thể xem danh sách hợp đồng.', 403));
//   }
//   const contracts = await contractService.getAllContractsForLandlord(req.user.MaChuTro, req.query);
//   res.status(200).json({
//     status: 'success',
//     results: contracts.length,
//     data: { contracts },
//   });
// });

exports.getContract = catchAsync(async (req, res, next) => {
    const contract = await contractService.getContractById(Number(req.params.id), req.user);
    res.status(200).json({
        status: 'success',
        data: { contract }
    });
});

exports.createContract = catchAsync(async (req, res, next) => {

    console.log('--- Bắt đầu xử lý createContract ---');
    console.log('Request Body:', req.body);
    console.log('Request Files:', req.files);
    console.log('------------------------------------');
    if (!req.user || !req.user.landlordProfile || !req.user.landlordProfile.MaChuTro) {
      return next(new AppError('Chỉ chủ trọ mới có thể tạo hợp đồng.', 403));
    }
  
    const contractData = JSON.parse(req.body.contractData);
    
    // Lấy file từ req.files
    const tenantFiles = req.files?.AnhGiayTo || [];
    const contractFile = req.files.FileHopDong ? req.files.FileHopDong[0] : null;
  
    const newContract = await contractService.createContract(
      contractData,
      req.user.landlordProfile.MaChuTro,
      tenantFiles, // Truyền mảng file ảnh giấy tờ
      contractFile  // Truyền file hợp đồng
    );
    
    res.status(201).json({
      status: 'success',
      data: { contract: newContract },
    });
  });
  

exports.terminateContract = catchAsync(async (req, res, next) => {
    if (!req.user || !req.user.MaChuTro) {
        return next(new AppError('Chỉ chủ trọ mới có thể thanh lý hợp đồng.', 403));
    }
    const terminatedContract = await contractService.terminateContract(Number(req.params.id), req.user.landlordProfile.MaChuTro);
     res.status(200).json({
        status: 'success',
        data: { contract: terminatedContract }
    });
});

// Bạn có thể thêm hàm updateContract nếu cần
exports.updateContract = catchAsync(async (req, res, next) => {
    // Logic tương tự
});

exports.getAllContracts = catchAsync(async (req, res, next) => {
    const { user } = req;
    let contracts;

    console.log('User Info:', user);

    // Phân luồng dựa trên vai trò của người dùng
    if (user.role.TenVaiTro === 'Chủ trọ') {
        contracts = await contractService.getAllContractsForLandlord(user.landlordProfile.MaChuTro, req.query);
    } else if (user.role.TenVaiTro === 'Khách thuê') {
        contracts = await contractService.getAllContractsForTenant(user.tenantProfile.MaKhachThue);
    } else {
        return next(new AppError('Vai trò không được hỗ trợ.', 403));
    }

    res.status(200).json({
        status: 'success',
        results: contracts.length,
        data: {
            contracts,
        },
    });
});

exports.getCurrentUserContract = catchAsync(async (req, res, next) => {
    // Đảm bảo rằng req.user có tenantProfile và MaKhachThue đã được load bởi authMiddleware
    if (!req.user || !req.user.tenantProfile || !req.user.tenantProfile.MaKhachThue) {
      console.warn("Server-side: Attempted to get current contract without valid tenantProfile in req.user.");
      return next(new AppError('Thông tin khách thuê không hợp lệ hoặc không tìm thấy. Vui lòng đăng nhập lại.', 400));
    }
  
    const tenantId = req.user.tenantProfile.MaKhachThue;
    console.log(`Server-side: Attempting to find active contract for tenant ID: ${tenantId}`);
  
    const contract = await Contract.findOne({
      where: {
        TrangThai: 'Có hiệu lực', // Chỉ lấy hợp đồng đang có hiệu lực
      },
      include: [
        {
          model: Occupant,
          as: 'occupants',
          required: true, // INNER JOIN để đảm bảo chỉ lấy hợp đồng CÓ khách thuê này
          where: {
            MaKhachThue: tenantId // Lọc occupants theo tenantId
          },
          attributes: ['MaNOC'], // Chỉ cần một thuộc tính để satisfy Sequelize's include for where clause
          include: [{
            model: Tenant,
            as: 'tenant',
            attributes: ['MaKhachThue', 'HoTen']
          }]
        },
        {
          model: Room,
          as: 'room',
          include: [{
              model: Property,
              as: 'property'
          }]
          },
          {
            model: Service,
            as: 'registeredServices', // Đảm bảo alias này khớp với association trong Contract model
            attributes: ['MaDV', 'TenDV', 'DonViTinh'], // Lấy các thuộc tính cần thiết của Service
            through: { attributes: [] } // Bỏ qua các thuộc tính của bảng trung gian HopDong_DichVuDangKy
          }
      ]
    });
  
    if (!contract) {
      console.warn(`Server-side: No active contract found for tenant ID ${tenantId}. Returning 404.`);
      // Trả về 404 với thông báo rõ ràng
      return next(new AppError('Không tìm thấy hợp đồng đang hoạt động cho khách thuê này.', 404));
    }
  
    console.log(`Server-side: Successfully found contract ${contract.MaHopDong} for tenant ${tenantId}.`);
    res.status(200).json({
      status: 'success',
      data: { contract }
    });
  });