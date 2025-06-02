const { Property, Landlord, Room } = require('../models');
const AppError = require('../utils/AppError');

/**
 * @param {number} maChuTro
 * @returns {Promise<Array<Property>>}
 */
const getPropertiesByLandlordId = async (maChuTro) => {
  if (!maChuTro) {
    throw new AppError('Không tìm thấy thông tin chủ trọ.', 400);
  }
  const properties = await Property.findAll({
    where: { MaChuTro: maChuTro },
    include: [
      { model: Room, as: 'rooms', attributes: ['MaPhong', 'TenPhong', 'TrangThai'] }
    ],
    order: [['MaNhaTro', 'DESC']],
  });
  return properties;
};

/**
 * @param {number} propertyId
 * @param {number} maChuTro 
 * @returns {Promise<Property|null>}
 */
const getPropertyByIdAndLandlord = async (propertyId, maChuTro) => {
  const property = await Property.findOne({
    where: {
      MaNhaTro: propertyId,
      MaChuTro: maChuTro,
    },
    // include: [ /* các model liên quan nếu cần */ ]
  });
  if (!property) {
    throw new AppError('Không tìm thấy nhà trọ hoặc bạn không có quyền truy cập.', 404);
  }
  return property;
};

/**
 * Tạo nhà trọ mới
 * @param {number} maChuTro - MaChuTro của người tạo
 * @param {object} propertyData - Dữ liệu nhà trọ (TenNhaTro, DiaChi, GhiChu)
 * @returns {Promise<Property>}
 */
const createProperty = async (maChuTro, propertyData) => {
  const { TenNhaTro, DiaChi, GhiChu } = propertyData;

  if (!TenNhaTro || !DiaChi) {
    throw new AppError('Tên nhà trọ và địa chỉ là bắt buộc.', 400);
  }

  const newProperty = await Property.create({
    MaChuTro: maChuTro,
    TenNhaTro,
    DiaChi,
    GhiChu,
  });
  return newProperty;
};

/**
 * Cập nhật thông tin nhà trọ
 * @param {number} propertyId - MaNhaTro
 * @param {number} maChuTro - MaChuTro của chủ trọ hiện tại
 * @param {object} updateData - Dữ liệu cần cập nhật
 * @returns {Promise<Property>}
 */
const updateProperty = async (propertyId, maChuTro, updateData) => {
  const property = await Property.findOne({
    where: {
      MaNhaTro: propertyId,
      MaChuTro: maChuTro,
    }
  });

  if (!property) {
    throw new AppError('Không tìm thấy nhà trọ hoặc bạn không có quyền chỉnh sửa.', 404);
  }

  // Chỉ cho phép cập nhật các trường cụ thể
  const allowedUpdates = ['TenNhaTro', 'DiaChi', 'GhiChu'];
  const updates = {};
  Object.keys(updateData).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      updates[key] = updateData[key];
    }
  });

  if (Object.keys(updates).length === 0) {
    throw new AppError('Không có thông tin hợp lệ để cập nhật.', 400);
  }

  await property.update(updates);
  return property;
};

/**
 * Xóa nhà trọ
 * @param {number} propertyId - MaNhaTro
 * @param {number} maChuTro - MaChuTro của chủ trọ hiện tại
 * @returns {Promise<void>}
 */
const deleteProperty = async (propertyId, maChuTro) => {
  const property = await Property.findOne({
    where: {
      MaNhaTro: propertyId,
      MaChuTro: maChuTro,
    }
  });

  if (!property) {
    throw new AppError('Không tìm thấy nhà trọ hoặc bạn không có quyền xóa.', 404);
  }

  // Kiểm tra xem nhà trọ có phòng nào đang được sử dụng không (cần model Room)
  const roomsInProperty = await Room.count({ where: { MaNhaTro: propertyId } });
  if (roomsInProperty > 0) {
    throw new AppError('Không thể xóa nhà trọ vì vẫn còn phòng trong nhà trọ này.', 400);
  }
  // Thêm các kiểm tra ràng buộc khác nếu cần (ví dụ: có hợp đồng đang hoạt động, v.v.)

  await property.destroy();
};


module.exports = {
  getPropertiesByLandlordId,
  getPropertyByIdAndLandlord,
  createProperty,
  updateProperty,
  deleteProperty,
};