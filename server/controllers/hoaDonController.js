const { Invoice, Contract, Room, Property, Occupant, Tenant, InvoiceDetail } = require('../models');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');

exports.createHoaDon = async (req, res, next) => {
  try {
    const { MaHopDong, KyThanhToan_TuNgay, KyThanhToan_DenNgay, NgayLap, TongTien } = req.body;

    const hopDong = await Contract.findByPk(MaHopDong);
    if (!hopDong) throw new AppError('Không tìm thấy hợp đồng', 404);

    const hoaDon = await Invoice.create({
      MaHopDong,
      KyThanhToan_TuNgay,
      KyThanhToan_DenNgay,
      NgayLap,
      TongTien,
    });

    res.status(201).json({ status: 'success', data: hoaDon });
  } catch (error) {
    next(error);
  }
};

exports.getAllHoaDon = async (req, res, next) => {
  try {
    let whereClause = {};

    // Sửa lỗi truy cập thông tin user
    if (req.user.role.TenVaiTro === 'Chủ trọ') {
      whereClause['$contract.room.property.MaChuTro$'] = req.user.landlordProfile.MaChuTro;
    }

    const hoaDons = await Invoice.findAll({
      where: whereClause,
      include: [
        {
          model: Contract,
          as: 'contract',
          include: [
            {
              model: Room,
              as: 'room',
              include: {
                model: Property,
                as: 'property',
              }
            },
            {
              model: Occupant,
              as: 'occupants', // Dùng đúng alias 'occupants'
              include: [{
                model: Tenant, // Bây giờ "Tenant" đã được import và hợp lệ
                as: 'tenant',
                attributes: ['HoTen']
              }]
            }
          ]
        }
      ],
      order: [['NgayLap', 'DESC']]
    });

    // Sửa lỗi cấu trúc data trả về
    res.status(200).json({ 
        status: 'success', 
        results: hoaDons.length, 
        data: { hoaDons } 
    });
  } catch (error) {
    next(error);
  }
};

exports.getHoaDon = async (req, res, next) => {
  try {
    const { id } = req.params;

    const hoaDon = await Invoice.findByPk(id, {
      include: [
        {
          model: Contract,
          as: 'contract',
          include: [
            {
              model: Room,
              as: 'room',
              include: {
                model: Property,
                as: 'property',
              }
            },
            {
              model: Occupant,
              as: 'occupants'
            }
          ]
        },
        {
          model: InvoiceDetail,
          as: 'details'
        }
      ]
    });

    if (!hoaDon) throw new AppError('Không tìm thấy hóa đơn', 404);

    if (
        req.user.role.TenVaiTro=== 'Chủ trọ' &&
      hoaDon.contract?.room?.property?.MaChuTro !== req.user.MaChuTro
    ) {
      throw new AppError('Bạn không có quyền truy cập hóa đơn này', 403);
    }

    res.status(200).json({ status: 'success', data: hoaDon });
  } catch (error) {
    next(error);
  }
};