const { Room, Property, RoomType, Contract } = require('../models');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');

const getRoomsByPropertyIdForLandlord = async (maNhaTro, maChuTro) => {
  const property = await Property.findOne({ where: { MaNhaTro: maNhaTro, MaChuTro: maChuTro } });
  if (!property) {
    throw new AppError('Không tìm thấy nhà trọ hoặc bạn không có quyền truy cập.', 404);
  }

  return Room.findAll({
    where: { MaNhaTro: maNhaTro },
    include: [
      { model: RoomType, as: 'roomType', attributes: ['TenLoai', 'Gia'] },
      { model: Property, as: 'property', attributes: ['TenNhaTro'] },
      {
        model: Contract,
        as: 'contracts',
        attributes: ['MaHopDong', 'TrangThai'],
        where: { TrangThai: 'Có hiệu lực' }, 
        required: false
      }
    ],
    order: [['TenPhong', 'ASC']],
  });
};

const getRoomDetailsByIdForLandlord = async (maPhong, maChuTro) => {
  const room = await Room.findByPk(maPhong, {
    include: [
      {
        model: Property,
        as: 'property',
        where: { MaChuTro: maChuTro }, 
        required: true, 
      },
      { model: RoomType, as: 'roomType' },
    ],
  });
  if (!room) {
    throw new AppError('Không tìm thấy phòng hoặc bạn không có quyền truy cập.', 404);
  }
  return room;
};

const createRoom = async (maChuTro, roomData) => {
  const { MaNhaTro, MaLoaiPhong, TenPhong, TrangThai, GhiChu } = roomData;

  if (!MaNhaTro || !MaLoaiPhong || !TenPhong) {
    throw new AppError('Nhà trọ, loại phòng và tên phòng là bắt buộc.', 400);
  }

  const property = await Property.findOne({ where: { MaNhaTro: MaNhaTro, MaChuTro: maChuTro } });
  if (!property) {
    throw new AppError('Nhà trọ không tồn tại hoặc không thuộc quyền quản lý của bạn.', 403);
  }

  const existingRoom = await Room.findOne({ where: { MaNhaTro, TenPhong } });
  if (existingRoom) {
    throw new AppError(`Tên phòng "${TenPhong}" đã tồn tại trong nhà trọ này.`, 400);
  }

  const newRoom = await Room.create({
    MaNhaTro,
    MaLoaiPhong,
    TenPhong,
    TrangThai: TrangThai || 'Còn trống',
    GhiChu,
  });
  return newRoom;
};

const updateRoom = async (maPhong, maChuTro, updateData) => {
  const room = await Room.findByPk(maPhong, {
    include: [{ model: Property, as: 'property', attributes: ['MaChuTro'] }]
  });

  if (!room) {
    throw new AppError('Không tìm thấy phòng.', 404);
  }
  if (room.property.MaChuTro !== maChuTro) {
    throw new AppError('Bạn không có quyền chỉnh sửa phòng này.', 403);
  }

  if (updateData.MaNhaTro && updateData.MaNhaTro !== room.MaNhaTro) {
    throw new AppError('Không thể thay đổi nhà trọ của phòng.', 400);
  }

  if (updateData.TenPhong && updateData.TenPhong !== room.TenPhong) {
    const existingRoom = await Room.findOne({
        where: {
            MaNhaTro: room.MaNhaTro,
            TenPhong: updateData.TenPhong,
            MaPhong: { [Op.ne]: maPhong } 
        }
    });
    if (existingRoom) {
        throw new AppError(`Tên phòng "${updateData.TenPhong}" đã tồn tại trong nhà trọ này.`, 400);
    }
  }


  const allowedUpdates = ['MaLoaiPhong', 'TenPhong', 'TrangThai', 'GhiChu'];
  const updates = {};
  Object.keys(updateData).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updates[key] = updateData[key];
    }
  });

   if (Object.keys(updates).length === 0) {
    throw new AppError('Không có thông tin hợp lệ để cập nhật.', 400);
  }

  await room.update(updates);
  return room.reload({
    include: [
      { model: RoomType, as: 'roomType' },
      { model: Property, as: 'property' }
    ]
  });
};

const deleteRoom = async (maPhong, maChuTro) => {
  const room = await Room.findByPk(maPhong, {
    include: [{ model: Property, as: 'property', attributes: ['MaChuTro'] }]
  });

  if (!room) {
    throw new AppError('Không tìm thấy phòng.', 404);
  }
  if (room.property.MaChuTro !== maChuTro) {
    throw new AppError('Bạn không có quyền xóa phòng này.', 403);
  }

  const activeContracts = await Contract.count({
    where: { MaPhong: maPhong, TrangThai: 'Có hiệu lực' }
  });
  if (activeContracts > 0) {
    throw new AppError('Không thể xóa phòng vì đang có hợp đồng hiệu lực liên kết với phòng này.', 400);
  }

  await room.destroy();
};

const getAllRoomTypes = async () => {
  return RoomType.findAll({ order: [['TenLoai', 'ASC']] });
};

const getAvailableRoomsForContract = async (maChuTro) => {
    const properties = await Property.findAll({ where: { MaChuTro: maChuTro }, attributes: ['MaNhaTro'] });
    const propertyIds = properties.map(p => p.MaNhaTro);
    if (propertyIds.length === 0) return [];
  
    return Room.findAll({
      where: {
        MaNhaTro: { [Op.in]: propertyIds },
        TrangThai: { [Op.in]: ['Còn trống', 'Đặt cọc'] }
      },
      include: [
        { model: RoomType, as: 'roomType', attributes: ['TenLoai', 'Gia'] },
        { model: Property, as: 'property', attributes: ['TenNhaTro'] }
      ],
      order: [['MaNhaTro', 'ASC'], ['TenPhong', 'ASC']]
    });
  };

module.exports = {
  getRoomsByPropertyIdForLandlord,
  getRoomDetailsByIdForLandlord,
  createRoom,
  updateRoom,
  deleteRoom,
    getAllRoomTypes,
    getAvailableRoomsForContract
};