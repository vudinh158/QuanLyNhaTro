const { Service, Property, PropertyAppliedService, Landlord } = require('../models');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');

exports.createDichVu = async (req, res, next) => {
  try {
    const { TenDV, LoaiDichVu, DonViTinh, MaNhaTro } = req.body;

    if (req.user.TenVaiTro === 'Chủ trọ' && MaNhaTro) {
      const nhaTro = await Property.findByPk(MaNhaTro);
      if (!nhaTro || nhaTro.MaChuTro !== req.user.MaChuTro) {
        throw new AppError('You do not have permission to create service for this property', 403);
      }
    }

    const transaction = await Service.sequelize.transaction();

    try {
      const newService = await Service.create({
        TenDV,
        LoaiDichVu,
        DonViTinh,
        MaNhaTro: MaNhaTro || null,
        HoatDong: true,
      }, { transaction });

      if (MaNhaTro) {
        await PropertyAppliedService.create({ MaNhaTro, MaDV: newService.MaDV }, { transaction });
      }

      await transaction.commit();
      res.status(201).json({ status: 'success', data: newService });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    next(err);
  }
};

exports.getDichVu = async (req, res, next) => {
  try {
    const { id } = req.params;
    const service = await Service.findByPk(id, {
      include: [
        { model: Property, as: 'propertySpecific' },
        { model: Property, as: 'appliedToProperties' }
      ]
    });

    if (!service) throw new AppError('Service not found', 404);

    if (req.user.TenVaiTro === 'Chủ trọ' && service.MaNhaTro && service.propertySpecific?.MaChuTro !== req.user.MaChuTro) {
      throw new AppError('You do not have permission to view this service', 403);
    }

    res.status(200).json({ status: 'success', data: service });
  } catch (err) {
    next(err);
  }
};

exports.getAllDichVu = async (req, res, next) => {
  try {
    const where = { HoatDong: true };
    const include = [
      { model: Property, as: 'propertySpecific' },
      {
        model: Property,
        as: 'appliedToProperties',
        through: { attributes: [] },
        include: [{ model: Landlord, as: 'landlord' }]
      }
    ];

    if (req.user.TenVaiTro === 'Chủ trọ') {
      where[Op.or] = [
        { MaNhaTro: null },
        { '$appliedToProperties.MaChuTro$': req.user.MaChuTro }
      ];
    }

    const services = await Service.findAll({ where, include });
    res.status(200).json({ status: 'success', results: services.length, data: services });
  } catch (err) {
    next(err);
  }
};

exports.updateDichVu = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { TenDV, LoaiDichVu, DonViTinh, MaNhaTro, HoatDong } = req.body;

    const service = await Service.findByPk(id, {
      include: [{ model: Property, as: 'propertySpecific' }]
    });

    if (!service) throw new AppError('Service not found', 404);

    if (req.user.TenVaiTro === 'Chủ trọ' && service.MaNhaTro && service.propertySpecific?.MaChuTro !== req.user.MaChuTro) {
      throw new AppError('You do not have permission to update this service', 403);
    }

    const transaction = await Service.sequelize.transaction();

    try {
      await service.update({ TenDV, LoaiDichVu, DonViTinh, MaNhaTro, HoatDong }, { transaction });

      if (MaNhaTro && MaNhaTro !== service.MaNhaTro) {
        await PropertyAppliedService.destroy({ where: { MaDV: id } }, { transaction });
        await PropertyAppliedService.create({ MaNhaTro, MaDV: id }, { transaction });
      }

      await transaction.commit();
      res.status(200).json({ status: 'success', data: service });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    next(err);
  }
};

exports.deleteDichVu = async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await Service.findByPk(id, {
      include: [{ model: Property, as: 'propertySpecific' }]
    });

    if (!service) throw new AppError('Service not found', 404);

    if (req.user.TenVaiTro === 'Chủ trọ' && service.MaNhaTro && service.propertySpecific?.MaChuTro !== req.user.MaChuTro) {
      throw new AppError('You do not have permission to delete this service', 403);
    }

    await service.update({ HoatDong: false, NgayNgungCungCap: new Date() });
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
};