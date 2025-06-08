// file: server/controllers/contractController.js
const contractService = require('../services/contractService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getAllContracts = catchAsync(async (req, res, next) => {
  if (!req.user || !req.user.MaChuTro) {
    return next(new AppError('Chỉ chủ trọ mới có thể xem danh sách hợp đồng.', 403));
  }
  const contracts = await contractService.getAllContractsForLandlord(req.user.MaChuTro, req.query);
  res.status(200).json({
    status: 'success',
    results: contracts.length,
    data: { contracts },
  });
});

exports.getContract = catchAsync(async (req, res, next) => {
    const contract = await contractService.getContractById(Number(req.params.id), req.user);
    res.status(200).json({
        status: 'success',
        data: { contract }
    });
});

exports.createContract = catchAsync(async (req, res, next) => {
  if (!req.user || !req.user.MaChuTro) {
    return next(new AppError('Chỉ chủ trọ mới có thể tạo hợp đồng.', 403));
  }
  const newContract = await contractService.createContract(req.body, req.user.MaChuTro);
  res.status(201).json({
    status: 'success',
    data: { contract: newContract },
  });
});

exports.terminateContract = catchAsync(async (req, res, next) => {
    if (!req.user || !req.user.MaChuTro) {
        return next(new AppError('Chỉ chủ trọ mới có thể thanh lý hợp đồng.', 403));
    }
    const terminatedContract = await contractService.terminateContract(Number(req.params.id), req.user.MaChuTro);
     res.status(200).json({
        status: 'success',
        data: { contract: terminatedContract }
    });
});

// Bạn có thể thêm hàm updateContract nếu cần
exports.updateContract = catchAsync(async (req, res, next) => {
    // Logic tương tự
});