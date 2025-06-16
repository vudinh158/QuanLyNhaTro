const catchAsync = require('../utils/catchAsync');
const roomTypeService = require('../services/roomTypeService');
const AppError = require('../utils/AppError');
const { RoomType, Property, Room } = require('../models');

const getRoomTypesByProperty = catchAsync(async (req, res, next) => {
  const { propertyId } = req.params;
    const maChuTro = req.user.landlordProfile.MaChuTro;

  if (!propertyId) {
    return next(new AppError('Mã nhà trọ là bắt buộc.', 400));
  }

  const roomTypes = await roomTypeService.getRoomTypesByPropertyId(propertyId, maChuTro);
  res.status(200).json({
    status: 'success',
    data: {
      roomTypes,
    },
  });
});

const getRoomType = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const maChuTro = req.user.landlordProfile.MaChuTro;

  const roomType = await roomTypeService.getRoomTypeById(id, maChuTro);

  res.status(200).json({
    status: 'success',
    data: {
      roomType,
    },
  });
});


const createRoomTypeForProperty = catchAsync(async (req, res, next) => {
    // Lấy maChuTro từ người dùng đã được xác thực (qua middleware 'protect')
    const maChuTro = req.user.landlordProfile.MaChuTro;
  
    // Toàn bộ dữ liệu cần thiết đã có trong req.body, bao gồm cả MaNhaTro
    const roomTypeData = req.body;
    
    // Ghi log để kiểm tra nếu cần
    console.log('Received roomTypeData:', roomTypeData); 
    console.log('Landlord ID:', maChuTro);
  
    // Gọi service với đúng thứ tự tham số
    const newRoomType = await roomTypeService.createRoomType(roomTypeData, maChuTro);
  
    res.status(201).json({
      status: 'success',
      data: {
        roomType: newRoomType,
      },
    });
  });

  const updateRoomType = catchAsync(async (req, res, next) => {
    // Lấy 'id' từ trong đối tượng req.params
    const { id } = req.params;
  
    // Lấy mã chủ trọ từ người dùng đã đăng nhập
    const maChuTro = req.user.landlordProfile.MaChuTro;
  
    // req.body chứa dữ liệu từ form gửi lên
    const updateData = req.body;
  
    // Gọi hàm service với các tham số đúng:
    // 1. id (giá trị đơn, không phải object)
    // 2. updateData (object)
    // 3. maChuTro (giá trị đơn)
    const updatedRoomType = await roomTypeService.updateRoomType(id, updateData, maChuTro);
  
    res.status(200).json({
      status: 'success',
      data: {
        roomType: updatedRoomType,
      },
    });
  });
  

const deleteRoomType = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const maChuTro = req.user.landlordProfile.MaChuTro;

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