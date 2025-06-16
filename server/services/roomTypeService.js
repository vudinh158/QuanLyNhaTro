// clone nhatro/server/services/roomTypeService.js
const { RoomType, Property, Room } = require('../models');
const AppError = require('../utils/AppError');

/**
 * Lấy tất cả loại phòng cho một nhà trọ cụ thể, kiểm tra quyền sở hữu
 * @param {number} maNhaTro - Mã nhà trọ
 * @param {number} maChuTro - Mã chủ trọ để kiểm tra quyền
 * @returns {Promise<Array<RoomType>>}
 */
const getRoomTypesByPropertyId = async (maNhaTro, maChuTro) => {
  const property = await Property.findOne({ where: { MaNhaTro: maNhaTro, MaChuTro: maChuTro }});
  if (!property) {
    throw new AppError('Không tìm thấy nhà trọ hoặc bạn không có quyền truy cập.', 404);
  }
  return RoomType.findAll({
    where: { MaNhaTro: maNhaTro },
    order: [['TenLoai', 'ASC']],
  });
};

/**
 * Lấy chi tiết một loại phòng, kiểm tra quyền sở hữu
 * @param {number} roomTypeId - Mã loại phòng
 * @param {number} maChuTro - Mã chủ trọ
 * @returns {Promise<RoomType>}
 */
const getRoomTypeById = async (roomTypeId, maChuTro) => {
    // Bước 1: Tìm loại phòng chỉ bằng ID trước
    const roomType = await RoomType.findByPk(roomTypeId);
  
    // Nếu không tìm thấy, trả về lỗi cụ thể
    if (!roomType) {
      throw new AppError(`Không tìm thấy loại phòng với mã số ${roomTypeId}.`, 404);
    }
  
    // Bước 2: Kiểm tra xem loại phòng này có thuộc nhà trọ của chủ trọ không
    const property = await Property.findOne({
      where: {
        MaNhaTro: roomType.MaNhaTro, // Lấy MaNhaTro từ loại phòng đã tìm thấy
        MaChuTro: maChuTro,          // So khớp với mã chủ trọ đang đăng nhập
      }
    });
  
    // Nếu không tìm thấy nhà trọ tương ứng, nghĩa là không có quyền truy cập
    if (!property) {
      throw new AppError('Bạn không có quyền truy cập vào loại phòng này.', 403); // Lỗi 403 Forbidden
    }
  
    // Nếu mọi thứ đều ổn, trả về loại phòng
    return roomType;
  };

/**
 * Tạo loại phòng mới, kiểm tra quyền sở hữu
 * @param {object} roomTypeData - Dữ liệu loại phòng
 * @param {number} maChuTro - Mã chủ trọ
 * @returns {Promise<RoomType>}
 */
const createRoomType = async (roomTypeData, maChuTro) => {
  const { MaNhaTro, TenLoai, Gia, DienTich, SoNguoiToiDa, MoTa } = roomTypeData;

  if (!MaNhaTro || !TenLoai || Gia === undefined || Gia === null) {
    throw new AppError('Nhà trọ, Tên loại và Giá là bắt buộc.', 400);
  }

  const property = await Property.findOne({ where: { MaNhaTro, maChuTro } });
  if (!property) {
    throw new AppError('Bạn không có quyền tạo loại phòng cho nhà trọ này.', 403);
  }

  return RoomType.create({
    MaNhaTro,
    TenLoai,
    Gia,
    DienTich,
    SoNguoiToiDa,
    MoTa,
  });
};

/**
 * Cập nhật loại phòng, kiểm tra quyền sở hữu
 * @param {number} roomTypeId
 * @param {object} updateData
 * @param {number} maChuTro
 * @returns {Promise<RoomType>}
 */
const updateRoomType = async (roomTypeId, updateData, maChuTro) => {
    // Bước 1: Kiểm tra xem có phòng nào thuộc loại này đang được thuê không.
    const rentedRoom = await Room.findOne({
      where: {
        MaLoaiPhong: roomTypeId,
        TrangThai: 'Đang thuê' // Trạng thái cần kiểm tra
      }
    });
  
    // Nếu tìm thấy một phòng đang được thuê, ném lỗi và dừng lại.
    if (rentedRoom) {
      throw new AppError('Không thể sửa loại phòng này vì đang có phòng được thuê. Vui lòng kiểm tra lại trạng thái các phòng.', 400); // 400 Bad Request
    }
  
    // Bước 2: Tìm loại phòng cần cập nhật và kiểm tra quyền sở hữu (logic cũ)
    const roomType = await RoomType.findByPk(roomTypeId, {
      include: {
        model: Property,
        as: 'property',
        attributes: ['MaChuTro']
      }
    });
  
    if (!roomType) {
      throw new AppError(`Không tìm thấy loại phòng với mã số ${roomTypeId}.`, 404);
    }
  
    if (!roomType.property || roomType.property.MaChuTro !== maChuTro) {
      throw new AppError('Bạn không có quyền chỉnh sửa loại phòng này.', 403);
    }
  
    // Bước 3: Nếu mọi thứ đều ổn, tiến hành cập nhật
    await roomType.update(updateData);
  
    return roomType;
  };

/**
 * Xóa loại phòng, kiểm tra ràng buộc và quyền sở hữu
 * @param {number} roomTypeId
 * @param {number} maChuTro
 * @returns {Promise<void>}
 */
const deleteRoomType = async (roomTypeId, maChuTro) => {
  const roomType = await getRoomTypeById(roomTypeId, maChuTro); // Dùng lại hàm get để kiểm tra quyền

  const roomCount = await Room.count({ where: { MaLoaiPhong: roomTypeId } });
  if (roomCount > 0) {
    throw new AppError('Không thể xóa loại phòng vì vẫn còn phòng đang sử dụng loại này.', 400);
  }

  await roomType.destroy();
};

module.exports = {
  getRoomTypesByPropertyId,
  getRoomTypeById,
  createRoomType,
  updateRoomType,
  deleteRoomType,
};