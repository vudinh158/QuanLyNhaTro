const { Invoice, Contract, Room, Property, Occupant, InvoiceDetail } = require('../models');
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

    if (req.user.TenVaiTro === 'Chủ trọ') {
      whereClause['$contract.room.property.MaChuTro$'] = req.user.MaChuTro;
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
              as: 'tenant'
            }
          ]
        }
      ],
      order: [['NgayLap', 'DESC']]
    });

    res.status(200).json({ status: 'success', results: hoaDons.length, data: hoaDons });
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
              as: 'tenant'
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
      req.user.TenVaiTro === 'Chủ trọ' &&
      hoaDon.contract?.room?.property?.MaChuTro !== req.user.MaChuTro
    ) {
      throw new AppError('Bạn không có quyền truy cập hóa đơn này', 403);
    }

    res.status(200).json({ status: 'success', data: hoaDon });
  } catch (error) {
    next(error);
  }
};