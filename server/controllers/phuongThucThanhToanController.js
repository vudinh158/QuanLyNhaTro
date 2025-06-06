const { PaymentMethod } = require('../models');
const AppError = require('../utils/AppError');

exports.createPhuongThucThanhToan = async (req, res, next) => {
  try {
    const { TenPTTT, MoTa, HoatDong } = req.body;

    const exists = await PaymentMethod.findOne({ where: { TenPTTT } });
    if (exists) throw new AppError('Payment method already exists', 400);

    const created = await PaymentMethod.create({
      TenPTTT,
      MoTa,
      HoatDong: HoatDong !== undefined ? HoatDong : true,
    });

    res.status(201).json({ status: 'success', data: created });
  } catch (error) {
    next(error);
  }
};

exports.getPhuongThucThanhToan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await PaymentMethod.findByPk(id);
    if (!record) throw new AppError('Payment method not found', 404);

    res.status(200).json({ status: 'success', data: record });
  } catch (error) {
    next(error);
  }
};

exports.getAllPhuongThucThanhToan = async (req, res, next) => {
  try {
    const records = await PaymentMethod.findAll({ where: { HoatDong: true } });
    res.status(200).json({ status: 'success', results: records.length, data: records });
  } catch (error) {
    next(error);
  }
};

exports.updatePhuongThucThanhToan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { TenPTTT, MoTa, HoatDong } = req.body;

    const record = await PaymentMethod.findByPk(id);
    if (!record) throw new AppError('Payment method not found', 404);

    await record.update({ TenPTTT, MoTa, HoatDong });
    res.status(200).json({ status: 'success', data: record });
  } catch (error) {
    next(error);
  }
};

exports.deletePhuongThucThanhToan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await PaymentMethod.findByPk(id);
    if (!record) throw new AppError('Payment method not found', 404);

    await record.update({ HoatDong: false });
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    next(error);
  }
};
