const { PaymentDetail, Invoice, PaymentMethod, Landlord, Contract, Room, Property, Occupant, Tenant } = require('../models');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');

exports.createChiTietThanhToan = async (req, res, next) => {
  try {
    const { MaHoaDon, SoTien, MaPTTT, MaGiaoDich, GhiChu } = req.body;

    if (!MaHoaDon || !SoTien || !MaPTTT) {
      throw new AppError('Missing required fields', 400);
    }

    const invoice = await Invoice.findOne({
      where: { MaHoaDon },
      include: [
        {
          model: Contract,
          as: 'contract',
          include: [
            {
              model: Room,
              as: 'room',
              include: [{ model: Property, as: 'property' }]
            },
            {
              model: Occupant,
              as: 'occupants',
              include: [{ model: Tenant, as: 'tenant' }]
            }
          ]
        }
      ]
    });

    if (!invoice) throw new AppError('Invoice not found', 404);

    const contract = invoice.contract;
    const room = contract?.room;
    const property = room?.property;

    if (req.user.TenVaiTro === 'Chủ trọ' && property?.MaChuTro !== req.user.MaChuTro) {
      throw new AppError('Unauthorized to add payment for this invoice', 403);
    }

    if (SoTien <= 0) throw new AppError('Amount must be greater than 0', 400);

    const transaction = await PaymentDetail.sequelize.transaction();

    try {
      const payment = await PaymentDetail.create({
        MaHoaDon,
        SoTien,
        MaPTTT,
        MaGiaoDich,
        GhiChu,
        MaNguoiNhanTK: req.user.MaChuTro || null,
        NgayThanhToan: new Date()
      }, { transaction });

      invoice.DaThanhToan = parseFloat(invoice.DaThanhToan) + parseFloat(SoTien);
      invoice.ConLai = parseFloat(invoice.TongTienPhaiTra) - parseFloat(invoice.DaThanhToan);
      invoice.TrangThaiThanhToan =
        invoice.ConLai <= 0 ? 'Đã thanh toán đủ' : invoice.DaThanhToan > 0 ? 'Đã thanh toán một phần' : 'Chưa thanh toán';

      await invoice.save({ transaction });
      await transaction.commit();

      res.status(201).json({ status: 'success', data: payment });
    } catch (err) {
      await transaction.rollback();
      next(err);
    }
  } catch (error) {
    next(error);
  }
};

exports.getChiTietThanhToan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = await PaymentDetail.findByPk(id, {
      include: [
        { model: Invoice, as: 'invoice' },
        { model: PaymentMethod, as: 'paymentMethod' },
        { model: Landlord, as: 'receiver' }
      ]
    });

    if (!payment) throw new AppError('Payment detail not found', 404);

    res.status(200).json({ status: 'success', data: payment });
  } catch (error) {
    next(error);
  }
};

exports.getAllChiTietThanhToan = async (req, res, next) => {
  try {
    const { MaHoaDon } = req.query;
    const where = {};

    if (MaHoaDon) {
      where.MaHoaDon = MaHoaDon;
    }

    const payments = await PaymentDetail.findAll({
      where,
      include: [
        {
          model: Invoice,
          as: 'invoice',
          include: [
            {
              model: Contract,
              as: 'contract',
              include: [
                { model: Room, as: 'room', include: [{ model: Property, as: 'property' }] },
                { model: Occupant, as: 'occupants', include: [{ model: Tenant, as: 'tenant' }] }
              ]
            }
          ]
        },
        { model: PaymentMethod, as: 'paymentMethod' },
        { model: Landlord, as: 'receiver' }
      ]
    });

    res.status(200).json({ status: 'success', results: payments.length, data: payments });
  } catch (error) {
    next(error);
  }
};