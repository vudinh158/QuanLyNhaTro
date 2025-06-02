const { LichSuGiaDichVu, DichVu } = require('../models');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');

exports.createLichSuGiaDichVu = async (req, res, next) => {
  try {
    const { MaDV, DonGiaMoi, NgayApDung } = req.body;

    const dichVu = await DichVu.findByPk(MaDV, {
      include: [{ model: NhaTro, as: 'nhaTroRieng' }],
    });

    if (!dichVu) {
      throw new AppError('Service not found', 404);
    }

    if (req.user.TenVaiTro === 'Chủ trọ' && dichVu.MaNhaTro && dichVu.nhaTroRieng.MaChuTro !== req.user.MaChuTro) {
      throw new AppError('You do not have permission to update price for this service', 403);
    }

    const existingPrice = await LichSuGiaDichVu.findOne({
      where: { MaDV, NgayApDung },
    });

    if (existingPrice) {
      throw new AppError('Price already exists for this service and date', 400);
    }

    const lichSuGiaDichVu = await LichSuGiaDichVu.create({
      MaDV,
      DonGiaMoi,
      NgayApDung,
      MaNguoiCapNhat: req.user.MaChuTro,
      ThoiGianCapNhat: new Date(),
    });

    res.status(201).json({
      status: 'success',
      data: lichSuGiaDichVu,
    });
  } catch (error) {
    next(error);
  }
};

exports.getLichSuGiaDichVu = async (req, res, next) => {
  try {
    const { id } = req.params;

    const lichSuGiaDichVu = await LichSuGiaDichVu.findByPk(id, {
      include: [
        { model: DichVu, as: 'dichVu', include: [{ model: NhaTro, as: 'nhaTroRieng' }] },
        { model: ChuTro, as: 'nguoiCapNhat' },
      ],
    });

    if (!lichSuGiaDichVu) {
      throw new AppError('Price history not found', 404);
    }

    if (req.user.TenVaiTro === 'Chủ trọ' && lichSuGiaDichVu.dichVu.MaNhaTro && lichSuGiaDichVu.dichVu.nhaTroRieng.MaChuTro !== req.user.MaChuTro) {
      throw new AppError('You do not have permission to view this price history', 403);
    }

    res.status(200).json({
      status: 'success',
      data: lichSuGiaDichVu,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllLichSuGiaDichVu = async (req, res, next) => {
  try {
    const where = {};
    if (req.user.TenVaiTro === 'Chủ trọ') {
      where['$dichVu.nhaTroRieng.MaChuTro$'] = req.user.MaChuTro;
    }

    const lichSuGiaDichVus = await LichSuGiaDichVu.findAll({
      where,
      include: [
        { model: DichVu, as: 'dichVu', include: [{ model: NhaTro, as: 'nhaTroRieng' }] },
        { model: ChuTro, as: 'nguoiCapNhat' },
      ],
    });

    res.status(200).json({
      status: 'success',
      results: lichSuGiaDichVus.length,
      data: lichSuGiaDichVus,
    });
  } catch (error) {
    next(error);
  }
};

// No update/delete as price history is immutable