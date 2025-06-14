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
      include: [
        { 
          model: Room, 
          as: 'rooms', 
          attributes: ['MaPhong', 'MaLoaiPhong', 'TenPhong', 'TrangThai', 'GhiChu'], // Lấy các thuộc tính cần thiết của phòng
          // Bạn có thể include thêm RoomType nếu muốn hiển thị tên loại phòng và giá ngay tại đây
          // include: [{ model: models.RoomType, as: 'roomType', attributes: ['TenLoai', 'Gia'] }]
        }
      ],
      order: [
        [{ model: Room, as: 'rooms' }, 'TenPhong', 'ASC'] // Sắp xếp phòng theo tên
      ]
    });
    if (!property) {
      throw new AppError('Không tìm thấy nhà trọ hoặc bạn không có quyền truy cập.', 404);
    }
    return property;
  };

/**
 * 
 * @param {number} maChuTro
 * @param {object} propertyData
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
 * 
 * @param {number} propertyId 
 * @param {number} maChuTro 
 * @param {object} updateData 
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
 * @param {number} propertyId 
 * @param {number} maChuTro 
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

  const roomsInProperty = await Room.count({ where: { MaNhaTro: propertyId } });
  if (roomsInProperty > 0) {
    throw new AppError('Không thể xóa nhà trọ vì vẫn còn phòng trong nhà trọ này.', 400);
  }

  await property.destroy();
};


module.exports = {
  getPropertiesByLandlordId,
  getPropertyByIdAndLandlord,
  createProperty,
  updateProperty,
  deleteProperty,
};