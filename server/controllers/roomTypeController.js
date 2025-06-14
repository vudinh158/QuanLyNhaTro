const catchAsync = require('../utils/catchAsync');
const roomTypeService = require('../services/roomTypeService');
const AppError = require('../utils/AppError');

const getRoomTypesByProperty = catchAsync(async (req, res, next) => {
  const { propertyId } = req.params;
  const maChuTro = req.user.MaTaiKhoan; // Lấy mã chủ trọ từ token

  if (!propertyId) {
    return next(new AppError('Mã nhà trọ là bắt buộc.', 400));
  }

  const roomTypes = await roomTypeService.getRoomTypesByPropertyId(propertyId);
  res.status(200).json({
    status: 'success',
    data: {
      roomTypes,
    },
  });
});

const getRoomType = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const maChuTro = req.user.MaTaiKhoan;

  const roomType = await roomTypeService.getRoomTypeByIdAndLandlord(id, maChuTro);
  res.status(200).json({
    status: 'success',
    data: {
      roomType,
    },
  });
});

const createRoomTypeForProperty = catchAsync(async (req, res, next) => {
  const { propertyId } = req.params; // Lấy propertyId từ URL
  const maChuTro = req.user.MaTaiKhoan;
  const roomTypeData = { ...req.body, MaNhaTro: propertyId }; // Gán MaNhaTro từ URL vào data

  const newRoomType = await roomTypeService.createRoomType(maChuTro, roomTypeData);
  res.status(201).json({
    status: 'success',
    data: {
      roomType: newRoomType,
    },
  });
});

const updateRoomType = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const maChuTro = req.user.MaTaiKhoan;
  const updateData = req.body;

  const updatedRoomType = await roomTypeService.updateRoomType(id, maChuTro, updateData);
  res.status(200).json({
    status: 'success',
    data: {
      roomType: updatedRoomType,
    },
  });
});

const deleteRoomType = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const maChuTro = req.user.MaTaiKhoan;

  await roomTypeService.deleteRoomType(id, maChuTro);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

module.exports = {
  getRoomTypesByProperty,
  getRoomType,
  createRoomTypeForProperty,
  updateRoomType,
  deleteRoomType,
};