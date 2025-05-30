const { PhuongThucThanhToan } = require('../models');
const AppError = require('../utils/error');

exports.createPhuongThucThanhToan = async (req, res, next) => {
  try {
    const { TenPTTT, MoTa, HoatDong } = req.body;

    const existingPTTT = await PhuongThucThanhToan.findOne({ where: { TenPTTT } });
    if (existingPTTT) {
      throw new AppError('Payment method already exists', 400);
    }

    const phuongThucThanhToan = await PhuongThucThanhToan.create({
      TenPTTT,
      MoTa,
      HoatDong: HoatDong !== undefined ? HoatDong : true,
    });

    res.status(201).json({
      status: 'success',
      data: phuongThucThanhToan,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPhuongThucThanhToan = async (req, res, next) => {
  try {
    const { id } = req.params;

    const phuongThucThanhToan = await PhuongThucThanhToan.findByPk(id);

    if (!phuongThucThanhToan) {
      throw new AppError('Payment method not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: phuongThucThanhToan,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllPhuongThucThanhToan = async (req, res, next) => {
  try {
    const phuongThucThanhToans = await PhuongThucThanhToan.findAll({
      where: { HoatDong: true },
    });

    res.status(200).json({
      status: 'success',
      results: phuongThucThanhToans.length,
      data: phuongThucThanhToans,
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePhuongThucThanhToan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { TenPTTT, MoTa, HoatDong } = req.body;

    const phuongThucThanhToan = await PhuongThucThanhToan.findByPk(id);

    if (!phuongThucThanhToan) {
      throw new AppError('Payment method not found', 404);
    }

    await phuongThucThanhToan.update({ TenPTTT, MoTa, HoatDong });

    res.status(200).json({
      status: 'success',
      data: phuongThucThanhToan,
    });
  } catch (error) {
    next(error);
  }
};

exports.deletePhuongThucThanhToan = async (req, res, next) => {
  try {
    const { id } = req.params;

    const phuongThucThanhToan = await PhuongThucThanhToan.findByPk(id);

    if (!phuongThucThanhToan) {
      throw new AppError('Payment method not found', 404);
    }

    await phuongThucThanhToan.update({ HoatDong: false });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};