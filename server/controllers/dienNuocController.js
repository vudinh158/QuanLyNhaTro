const { ElectricWaterUsage, ElectricWaterPriceHistory, Room, Property, Contract, Occupant } = require('../models');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');

exports.createDienNuoc = async (req, res, next) => {
  try {
    const { MaPhong, Loai, ChiSoDau, ChiSoCuoi, NgayGhi, GhiChu } = req.body;

    const phong = await Room.findByPk(MaPhong, {
      include: [{ model: Property, as: 'property' }],
    });

    if (!phong) throw new AppError('Room not found', 404);
    if (req.user.TenVaiTro === 'Chủ trọ' && phong.property.MaChuTro !== req.user.MaChuTro) {
      throw new AppError('You do not have permission to record for this room', 403);
    }
    if (ChiSoCuoi < ChiSoDau) throw new AppError('End reading must be greater than or equal to start reading', 400);

    const latest = await ElectricWaterUsage.findOne({
      where: { MaPhong, Loai, TrangThai: { [Op.ne]: 'Đã hủy' } },
      order: [['NgayGhi', 'DESC']],
    });
    if (latest && ChiSoDau !== latest.ChiSoCuoi) {
      throw new AppError('Start reading must match the previous end reading', 400);
    }

    const gia = await ElectricWaterPriceHistory.findOne({
      where: {
        MaNhaTro: phong.MaNhaTro,
        Loai,
        NgayApDung: { [Op.lte]: NgayGhi },
      },
      order: [['NgayApDung', 'DESC']],
    });

    if (!gia) throw new AppError('No applicable price found for this period', 400);

    const SoLuongTieuThu = ChiSoCuoi - ChiSoDau;
    const ThanhTien = SoLuongTieuThu * parseFloat(gia.DonGiaMoi);

    const created = await ElectricWaterUsage.create({
      MaPhong,
      Loai,
      ChiSoDau,
      ChiSoCuoi,
      SoLuongTieuThu,
      DonGia: gia.DonGiaMoi,
      ThanhTien,
      NgayGhi,
      GhiChu,
      TrangThai: 'Mới ghi',
    });

    res.status(201).json({ status: 'success', data: created });
  } catch (error) {
    next(error);
  }
};

exports.getDienNuoc = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dienNuoc = await ElectricWaterUsage.findByPk(id, {
      include: [{ model: Room, as: 'room', include: [{ model: Property, as: 'property' }] }],
    });
    if (!dienNuoc) throw new AppError('Record not found', 404);
    if (req.user.TenVaiTro === 'Chủ trọ' && dienNuoc.room.property.MaChuTro !== req.user.MaChuTro) {
      throw new AppError('No permission to view this record', 403);
    }
    if (req.user.TenVaiTro === 'Khách thuê') {
      const ids = await getHopDongIdsForPhong(dienNuoc.MaPhong);
      const found = await Occupant.findOne({ where: { MaKhachThue: req.user.MaKhachThue, MaHopDong: { [Op.in]: ids } } });
      if (!found) throw new AppError('No permission to view this record', 403);
    }
    res.status(200).json({ status: 'success', data: dienNuoc });
  } catch (error) {
    next(error);
  }
};

exports.getAllDienNuoc = async (req, res, next) => {
    try {
      let whereClause = {}; // Điều kiện lọc chính cho ElectricWaterUsage
      const { roomId } = req.query; // Thêm roomId vào query params nếu frontend gửi lên
  
      // Lọc theo roomId nếu có (để dùng khi chủ trọ xem riêng từng phòng hoặc frontend gửi lên)
      if (roomId) {
        whereClause.MaPhong = roomId;
      }
  
      if (req.user.role.TenVaiTro === 'Chủ trọ') { // Chủ trọ
        whereClause['$room.property.MaChuTro$'] = req.user.landlordProfile.MaChuTro;
      } else if (req.user.role.TenVaiTro === 'Khách thuê') { // Khách thuê
        // Tìm hợp đồng đang hoạt động của khách thuê này để lấy MaPhong
        const activeContract = await Contract.findOne({
          where: { TrangThai: 'Có hiệu lực' },
          include: [
            {
              model: Occupant,
              as: 'occupants',
              where: { MaKhachThue: req.user.tenantProfile.MaKhachThue },
              required: true // Đảm bảo chỉ lấy hợp đồng có khách thuê này
            }
          ]
        });
  
        if (activeContract) {
          whereClause.MaPhong = activeContract.MaPhong; // Lọc theo MaPhong của hợp đồng đang hoạt động
        } else {
          // Nếu khách thuê không có hợp đồng đang hoạt động, trả về mảng rỗng
          return res.status(200).json({ status: 'success', results: 0, data: [] });
        }
      }
  
      const dienNuocs = await ElectricWaterUsage.findAll({
        where: whereClause, // Áp dụng điều kiện lọc ở đây
        include: [
          {
            model: Room,
            as: 'room',
            // required: true, // Không cần required nếu đã lọc MaPhong ở whereClause.
            include: [
              { model: Property, as: 'property' },
              // Không cần include Contracts và Occupants ở đây nếu đã lọc MaPhong ở trên,
              // hoặc nếu cần để hiển thị thêm thông tin trong response.
              // Nếu chỉ để lọc, việc lấy MaPhong trước là hiệu quả hơn.
              // {
              //   model: Contract,
              //   as: 'contracts',
              //   include: [{ model: Occupant, as: 'occupants' }]
              // }
            ]
          },
        ],
        order: [['NgayGhi', 'DESC']] // Sắp xếp theo ngày ghi mới nhất
      });
  
      res.status(200).json({ status: 'success', results: dienNuocs.length, data: dienNuocs });
    } catch (error) {
      console.error("Server-side error in getAllDienNuoc:", error);
      next(error);
    }
  };

exports.getAllDienNuocRecords = async (req, res, next) => {
  try {
    let whereClause = {};
    const { propertyId, roomId, month, year } = req.query;

    if (req.user.role.TenVaiTro === 'Chủ trọ') {
      // ... logic cho chủ trọ giữ nguyên
    }

    // SỬA LỖI TRUY CẬP THÔNG TIN KHÁCH THUÊ
    if (req.user.role.TenVaiTro === 'Khách thuê') {
      const currentContract = await Contract.findOne({
        where: { MaKhachThue: req.user.tenantProfile.MaKhachThue, TrangThai: 'Có hiệu lực' }
      });

      if (currentContract) {
        whereClause.MaPhong = currentContract.MaPhong;
      } else {
        return res.status(200).json({ status: 'success', results: 0, data: { records: [] } });
      }
    }

    // ... phần code còn lại của hàm giữ nguyên
    const records = await ElectricWaterUsage.findAll({
        where: whereClause,
        // ...
    });
    
    res.status(200).json({ status: 'success', results: records.length, data: { records } });

  } catch (error) {
    next(error);
  }
};

exports.updateDienNuoc = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ChiSoCuoi, NgayGhi, GhiChu } = req.body;

    const dienNuoc = await ElectricWaterUsage.findByPk(id, {
      include: [{ model: Room, as: 'room', include: [{ model: Property, as: 'property' }] }],
    });

    if (!dienNuoc) throw new AppError('Record not found', 404);
    if (req.user.TenVaiTro === 'Chủ trọ' && dienNuoc.room.property.MaChuTro !== req.user.MaChuTro) {
      throw new AppError('No permission to update this record', 403);
    }
    if (dienNuoc.TrangThai !== 'Mới ghi') {
      throw new AppError('Only records in "Mới ghi" status can be updated', 400);
    }
    if (ChiSoCuoi < dienNuoc.ChiSoDau) throw new AppError('End reading must be >= start reading', 400);

    const gia = await ElectricWaterPriceHistory.findOne({
      where: {
        MaNhaTro: dienNuoc.room.MaNhaTro,
        Loai: dienNuoc.Loai,
        NgayApDung: { [Op.lte]: NgayGhi || dienNuoc.NgayGhi },
      },
      order: [['NgayApDung', 'DESC']],
    });
    if (!gia) throw new AppError('No applicable price found', 400);

    const SoLuongTieuThu = ChiSoCuoi - dienNuoc.ChiSoDau;
    const ThanhTien = SoLuongTieuThu * parseFloat(gia.DonGiaMoi);

    await dienNuoc.update({ ChiSoCuoi, SoLuongTieuThu, DonGia: gia.DonGiaMoi, ThanhTien, NgayGhi, GhiChu });
    res.status(200).json({ status: 'success', data: dienNuoc });
  } catch (error) {
    next(error);
  }
};

exports.deleteDienNuoc = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dienNuoc = await ElectricWaterUsage.findByPk(id, {
      include: [{ model: Room, as: 'room', include: [{ model: Property, as: 'property' }] }],
    });
    if (!dienNuoc) throw new AppError('Record not found', 404);
    if (req.user.TenVaiTro === 'Chủ trọ' && dienNuoc.room.property.MaChuTro !== req.user.MaChuTro) {
      throw new AppError('No permission to delete this record', 403);
    }
    if (dienNuoc.TrangThai !== 'Mới ghi') {
      throw new AppError('Only records in "Mới ghi" status can be deleted', 400);
    }
    await dienNuoc.update({ TrangThai: 'Đã hủy' });
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    next(error);
  }
};

// Helper
async function getHopDongIdsForPhong(MaPhong) {
  const hopDongs = await Contract.findAll({
    where: { MaPhong, TrangThai: 'Có hiệu lực' },
    attributes: ['MaHopDong']
  });
  return hopDongs.map(h => h.MaHopDong);
}
