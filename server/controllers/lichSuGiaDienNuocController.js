const { ElectricWaterPriceHistory, Property, Landlord } = require('../models');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');

exports.createLichSuGiaDienNuoc = async (req, res, next) => {
  try {
    const { MaNhaTro, Loai, DonGiaMoi, NgayApDung } = req.body;

    const nhaTro = await Property.findByPk(MaNhaTro);
    if (!nhaTro) throw new AppError('Property not found', 404);
    if (req.user.TenVaiTro === 'Chủ trọ' && nhaTro.MaChuTro !== req.user.MaChuTro) {
      throw new AppError('You do not have permission to update price for this property', 403);
    }

    const existingPrice = await ElectricWaterPriceHistory.findOne({
      where: { MaNhaTro, Loai, NgayApDung },
    });
    if (existingPrice) throw new AppError('Price already exists for this property, type, and date', 400);

    const lichSuGiaDienNuoc = await ElectricWaterPriceHistory.create({
      MaNhaTro,
      Loai,
      DonGiaMoi,
      NgayApDung,
      MaNguoiCapNhat: req.user.MaChuTro,
      ThoiGianCapNhat: new Date(),
    });

    res.status(201).json({ status: 'success', data: lichSuGiaDienNuoc });
  } catch (error) {
    next(error);
  }
};

exports.getLichSuGiaDienNuoc = async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await ElectricWaterPriceHistory.findByPk(id, {
      include: [
        { model: Property, as: 'nhaTro' },
        { model: Landlord, as: 'nguoiCapNhat' }
      ]
    });

    if (!record) throw new AppError('Price history not found', 404);
    if (req.user.TenVaiTro === 'Chủ trọ' && record.nhaTro.MaChuTro !== req.user.MaChuTro) {
      throw new AppError('You do not have permission to view this price history', 403);
    }

    res.status(200).json({ status: 'success', data: record });
  } catch (error) {
    next(error);
  }
};

exports.getAllLichSuGiaDienNuoc = async (req, res, next) => {
  try {
    const where = {};
    
    // SỬA LỖI 1: Truy cập đúng cấu trúc thông tin người dùng
    if (req.user.role.TenVaiTro === 'Chủ trọ') {
      // SỬA LỖI 2: Dùng đúng alias 'property' trong điều kiện where
      where['$property.MaChuTro$'] = req.user.landlordProfile.MaChuTro;
    }

    const records = await ElectricWaterPriceHistory.findAll({
      where,
      include: [
        // SỬA LỖI 2: Dùng đúng alias 'property' trong include
        { model: Property, as: 'property' }, 
        { model: Landlord, as: 'updatedBy' } // Alias 'updatedBy' phải khớp với model
      ],
      order: [['NgayApDung', 'DESC']]
    });

    // SỬA LỖI 3: Trả về dữ liệu đúng cấu trúc client mong đợi
    res.status(200).json({ 
      status: 'success', 
      results: records.length, 
      data: { lichSuGiaDienNuoc: records } 
    });

  } catch (error) {
    // Ghi lại lỗi để debug
    console.error("Lỗi trong getAllLichSuGiaDienNuoc:", error);
    next(error);
  }
};