const { RoomType, Property, Room } = require('../models');
const AppError = require('../utils/AppError');

/**
 * Lấy tất cả loại phòng cho một nhà trọ cụ thể
 * @param {number} propertyId - Mã nhà trọ
 * @returns {Promise<Array<RoomType>>}
 */
const getRoomTypesByPropertyId = async (propertyId) => {
  const roomTypes = await RoomType.findAll({
    where: { MaNhaTro: propertyId },
    order: [['TenLoai', 'ASC']],
  });
  return roomTypes;
};

/**
 * Lấy chi tiết một loại phòng
 * @param {number} roomTypeId - Mã loại phòng
 * @param {number} maChuTro - Mã chủ trọ (để kiểm tra quyền)
 * @returns {Promise<RoomType>}
 */
const getRoomTypeByIdAndLandlord = async (roomTypeId, maChuTro) => {
  const roomType = await RoomType.findOne({
    where: { MaLoaiPhong: roomTypeId },
    include: [{
      model: Property,
      as: 'property',
      where: { MaChuTro: maChuTro }, // Đảm bảo loại phòng thuộc nhà trọ của chủ trọ này
    }],
  });

  if (!roomType) {
    throw new AppError('Không tìm thấy loại phòng hoặc bạn không có quyền truy cập.', 404);
  }
  return roomType;
};

/**
 * Tạo loại phòng mới cho một nhà trọ
 * @param {number} maChuTro - Mã chủ trọ
 * @param {object} roomTypeData - Dữ liệu loại phòng (TenLoai, Gia, DienTich, MoTa, MaNhaTro)
 * @returns {Promise<RoomType>}
 */
const createRoomType = async (maChuTro, roomTypeData) => {
  const { MaNhaTro, TenLoai, Gia, DienTich, MoTa } = roomTypeData;

  if (!MaNhaTro || !TenLoai || !Gia) {
    throw new AppError('Mã nhà trọ, tên loại và giá là bắt buộc.', 400);
  }

  // Kiểm tra xem nhà trọ có thuộc về chủ trọ này không
  const property = await Property.findOne({
    where: { MaNhaTro: MaNhaTro, MaChuTro: maChuTro },
  });

  if (!property) {
    throw new AppError('Nhà trọ không tồn tại hoặc bạn không có quyền tạo loại phòng cho nhà trọ này.', 403);
  }

  const newRoomType = await RoomType.create({
    MaNhaTro,
    TenLoai,
    Gia,
    DienTich,
    MoTa,
  });
  return newRoomType;
};

/**
 * Cập nhật loại phòng
 * @param {number} roomTypeId - Mã loại phòng
 * @param {number} maChuTro - Mã chủ trọ (để kiểm tra quyền)
 * @param {object} updateData - Dữ liệu cập nhật (TenLoai, Gia, DienTich, MoTa)
 * @returns {Promise<RoomType>}
 */
const updateRoomType = async (roomTypeId, maChuTro, updateData) => {
  const roomType = await getRoomTypeByIdAndLandlord(roomTypeId, maChuTro); // Sử dụng hàm đã có để kiểm tra quyền

  const allowedUpdates = ['TenLoai', 'Gia', 'DienTich', 'MoTa'];
  const updates = {};
  Object.keys(updateData).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      updates[key] = updateData[key];
    }
  });

  if (Object.keys(updates).length === 0) {
    throw new AppError('Không có thông tin hợp lệ để cập nhật.', 400);
  }

  await roomType.update(updates);
  return roomType;
};

/**
 * Xóa loại phòng
 * @param {number} roomTypeId - Mã loại phòng
 * @param {number} maChuTro - Mã chủ trọ (để kiểm tra quyền)
 * @returns {Promise<void>}
 */
const deleteRoomType = async (roomTypeId, maChuTro) => {
  const roomType = await getRoomTypeByIdAndLandlord(roomTypeId, maChuTro); // Sử dụng hàm đã có để kiểm tra quyền

  // Kiểm tra xem có phòng nào đang sử dụng loại phòng này không
  const roomsUsingType = await Room.count({ where: { MaLoaiPhong: roomTypeId } });
  if (roomsUsingType > 0) {
    throw new AppError('Không thể xóa loại phòng này vì có phòng đang sử dụng.', 400);
  }

  await roomType.destroy();
};

module.exports = {
  getRoomTypesByPropertyId,
  getRoomTypeByIdAndLandlord,
  createRoomType,
  updateRoomType,
  deleteRoomType,
};