const { ServicePriceHistory, Service, Property, Landlord } = require('../models');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');

exports.createLichSuGiaDichVu = async (req, res, next) => {
  try {
    const { MaDV, DonGiaMoi, NgayApDung } = req.body;

    const dichVu = await Service.findByPk(MaDV, {
      include: [{ model: Property, as: 'propertySpecific' }]
    });
    if (!dichVu) throw new AppError('Service not found', 404);
    if (req.user.TenVaiTro === 'Chủ trọ' && dichVu.MaNhaTro && dichVu.propertySpecific?.MaChuTro !== req.user.MaChuTro) {
      throw new AppError('You do not have permission to update price for this service', 403);
    }

    const exists = await ServicePriceHistory.findOne({ where: { MaDV, NgayApDung } });
    if (exists) throw new AppError('Price already exists for this date', 400);

    const created = await ServicePriceHistory.create({
      MaDV,
      DonGiaMoi,
      NgayApDung,
      MaNguoiCapNhat: req.user.MaChuTro,
      ThoiGianCapNhat: new Date()
    });
    res.status(201).json({ status: 'success', data: created });
  } catch (error) {
    next(error);
  }
};

exports.getLichSuGiaDichVu = async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await ServicePriceHistory.findByPk(id, {
      include: [
        { model: Service, as: 'service', include: [{ model: Property, as: 'propertySpecific' }] },
        { model: Landlord, as: 'updatedBy' }
      ]
    });
    if (!record) throw new AppError('Price history not found', 404);
    if (req.user.TenVaiTro === 'Chủ trọ' && record.service.MaNhaTro && record.service.propertySpecific?.MaChuTro !== req.user.MaChuTro) {
      throw new AppError('You do not have permission to view this price history', 403);
    }
    res.status(200).json({ status: 'success', data: record });
  } catch (error) {
    next(error);
  }
};

exports.getAllLichSuGiaDichVu = async (req, res, next) => {
  try {
    const where = {};
    if (req.user.TenVaiTro === 'Chủ trọ') {
      where['$service.propertySpecific.MaChuTro$'] = req.user.MaChuTro;
    }

    const records = await ServicePriceHistory.findAll({
      where,
      include: [
        { model: Service, as: 'service', include: [{ model: Property, as: 'propertySpecific' }] },
        { model: Landlord, as: 'updatedBy' }
      ]
    });

    res.status(200).json({ status: 'success', results: records.length, data: records });
  } catch (error) {
    next(error);
  }
};