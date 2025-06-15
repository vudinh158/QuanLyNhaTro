const {
  ServiceUsage,
  Service,
  ServicePriceHistory,
  Room,
  Property,
  Occupant,
  Contract
} = require('../models');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');
const catchAsync = require('../utils/catchAsync');
const serviceUsageService = require('../services/serviceUsageService');


exports.createSuDungDichVu = async (req, res, next) => {
  try {
    const { MaPhong, MaDV, SoLuong, NgaySuDung } = req.body;

    const phong = await Room.findByPk(MaPhong, {
      include: { model: Property, as: 'property' }
    });
    if (!phong) throw new AppError('Room not found', 404);
    if (req.user.TenVaiTro === 'Chủ trọ' && phong.property.MaChuTro !== req.user.MaChuTro) {
      throw new AppError('You do not have permission to add usage to this room', 403);
    }

    const gia = await ServicePriceHistory.findOne({
      where: {
        MaDV,
        NgayApDung: { [Op.lte]: NgaySuDung }
      },
      order: [['NgayApDung', 'DESC']]
    });
    if (!gia) throw new AppError('No price found for this service at that date', 400);

    const thanhTien = gia.DonGiaMoi * SoLuong;
    const usage = await ServiceUsage.create({ MaPhong, MaDV, SoLuong, NgaySuDung, ThanhTien: thanhTien });

    res.status(201).json({ status: 'success', data: usage });
  } catch (error) {
    next(error);
  }
};

exports.getAllSuDungDichVu = async (req, res, next) => {
  try {
    let whereClause = {};

    if (req.user.TenVaiTro === 'Chủ trọ') {
      whereClause['$room.property.MaChuTro$'] = req.user.MaChuTro;
    } else if (req.user.TenVaiTro === 'Khách thuê') {
      const contracts = await Contract.findAll({
        include: {
          model: Occupant,
          as: 'occupants',
          where: { MaNguoiDung: req.user.MaNguoiDung }
        },
        where: { TrangThai: 'Có hiệu lực' },
        attributes: ['MaPhong']
      });
      const maPhongList = contracts.map(c => c.MaPhong);
      whereClause['MaPhong'] = { [Op.in]: maPhongList };
    }

    const records = await ServiceUsage.findAll({
      where: whereClause,
      include: [
        { model: Room, as: 'room', include: { model: Property, as: 'property' } },
        { model: Service, as: 'service' }
      ]
    });

    res.status(200).json({ status: 'success', results: records.length, data: records });
  } catch (error) {
    next(error);
  }
};

exports.getSuDungDichVu = async (req, res, next) => {
  try {
    const { id } = req.params;

    const usage = await ServiceUsage.findByPk(id, {
      include: [
        { model: Room, as: 'room', include: { model: Property, as: 'property' } },
        { model: Service, as: 'service' }
      ]
    });

    if (!usage) throw new AppError('Không tìm thấy bản ghi sử dụng dịch vụ', 404);

    if (
      req.user.TenVaiTro === 'Chủ trọ' &&
      usage.room.property.MaChuTro !== req.user.MaChuTro
    ) {
      throw new AppError('Bạn không có quyền truy cập bản ghi này', 403);
    }

    res.status(200).json({ status: 'success', data: usage });
  } catch (error) {
    next(error);
  }
};

exports.updateSuDungDichVu = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { SoLuong, NgaySuDung } = req.body;

    const usage = await ServiceUsage.findByPk(id, {
      include: { model: Room, as: 'room', include: { model: Property, as: 'property' } }
    });

    if (!usage) throw new AppError('Không tìm thấy bản ghi', 404);

    if (
      req.user.TenVaiTro === 'Chủ trọ' &&
      usage.room.property.MaChuTro !== req.user.MaChuTro
    ) {
      throw new AppError('Bạn không có quyền sửa bản ghi này', 403);
    }

    const gia = await ServicePriceHistory.findOne({
      where: {
        MaDV: usage.MaDV,
        NgayApDung: { [Op.lte]: NgaySuDung }
      },
      order: [['NgayApDung', 'DESC']]
    });

    if (!gia) throw new AppError('Không tìm thấy giá tại thời điểm đó', 400);

    usage.SoLuong = SoLuong;
    usage.NgaySuDung = NgaySuDung;
    usage.ThanhTien = gia.DonGiaMoi * SoLuong;

    await usage.save();

    res.status(200).json({ status: 'success', data: usage });
  } catch (error) {
    next(error);
  }
};

exports.deleteSuDungDichVu = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usage = await ServiceUsage.findByPk(id, {
      include: {
        model: Room,
        as: 'room',
        include: { model: Property, as: 'property' }
      }
    });
    if (!usage) throw new AppError('Usage record not found', 404);

    if (req.user.TenVaiTro === 'Chủ trọ' && usage.room.property.MaChuTro !== req.user.MaChuTro) {
      throw new AppError('You do not have permission to delete this usage', 403);
    }

    await usage.destroy();
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    next(error);
  }
};

exports.getTenantServiceUsages = catchAsync(async (req, res, next) => {
    if (!req.user || !req.user.tenantProfile || !req.user.tenantProfile.MaKhachThue) {
        return next(new AppError('Thông tin khách thuê không hợp lệ.', 400));
    }
    const usages = await serviceUsageService.getAllServiceUsagesForTenant(req.user.tenantProfile.MaKhachThue);
    res.status(200).json({
        status: 'success',
        results: usages.length,
        data: { usages } // Đảm bảo trả về dưới key 'usages'
    });
});