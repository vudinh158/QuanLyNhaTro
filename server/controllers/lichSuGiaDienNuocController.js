const { LichSuGiaDienNuoc, NhaTro } = require('../models');
const AppError = require('../utils/error');
const { Op } = require('sequelize');

exports.createLichSuGiaDienNuoc = async (req, res, next) => {
  try {
    const { MaNhaTro, Loai, DonGiaMoi, NgayApDung } = req.body;

    const nhaTro = await NhaTro.findByPk(MaNhaTro);
    if (!nhaTro) {
      throw new AppError('Property not found', 404);
    }

    if (req.user.TenVaiTro === 'Chủ trọ' && nhaTro.MaChuTro !== req.user.MaChuTro) {
      throw new AppError('You do not have permission to update price for this property', 403);
    }

    const existingPrice = await LichSuGiaDienNuoc.findOne({
      where: { MaNhaTro, Loai, NgayApDung },
    });

    if (existingPrice) {
      throw new AppError('Price already exists for this property, type, and date', 400);
    }

    const lichSuGiaDienNuoc = await LichSuGiaDienNuoc.create({
      MaNhaTro,
      Loai,
      DonGiaMoi,
      NgayApDung,
      MaNguoiCapNhat: req.user.MaChuTro,
      ThoiGianCapNhat: new Date(),
    });

    res.status(201).json({
      status: 'success',
      data: lichSuGiaDienNuoc,
    });
  } catch (error) {
    next(error);
  }
};

exports.getLichSuGiaDienNuoc = async (req, res, next) => {
  try {
    const { id } = req.params;

    const lichSuGiaDienNuoc = await LichSuGiaDienNuoc.findByPk(id, {
      include: [{ model: NhaTro, as: 'nhaTro' }, { model: ChuTro, as: 'nguoiCapNhat' }],
    });

    if (!lichSuGiaDienNuoc) {
      throw new AppError('Price history not found', 404);
    }

    if (req.user.TenVaiTro === 'Chủ trọ' && lichSuGiaDienNuoc.nhaTro.MaChuTro !== req.user.MaChuTro) {
      throw new AppError('You do not have permission to view this price history', 403);
    }

    res.status(200).json({
      status: 'success',
      data: lichSuGiaDienNuoc,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllLichSuGiaDienNuoc = async (req, res, next) => {
  try {
    const where = {};
    if (req.user.TenVaiTro === 'Chủ trọ') {
      where['$nhaTro.MaChuTro$'] = req.user.MaChuTro;
    }

    const lichSuGiaDienNuocs = await LichSuGiaDienNuoc.findAll({
      where,
      include: [{ model: NhaTro, as: 'nhaTro' }, { model: ChuTro, as: 'nguoiCapNhat' }],
    });

    res.status(200).json({
      status: 'success',
      results: lichSuGiaDienNuocs.length,
      data: lichSuGiaDienNuocs,
    });
  } catch (error) {
    next(error);
  }
};

// No update/delete as price history is immutable