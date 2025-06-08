const { Service, Property, PropertyAppliedService, Landlord, ServicePriceHistory } = require('../models');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');

exports.createDichVu = async (req, res, next) => {
  try {
    const { TenDV, LoaiDichVu, DonViTinh, MaNhaTro, DonGia } = req.body;

    if (!DonGia) return next(new AppError('Vui lòng nhập giá dịch vụ ban đầu', 400));

    if (req.user.TenVaiTro === 'Chủ trọ' && MaNhaTro) {
      const nhaTro = await Property.findByPk(MaNhaTro);
      if (!nhaTro || nhaTro.MaChuTro !== req.user.MaChuTro) {
        throw new AppError('Bạn không có quyền tạo dịch vụ cho nhà trọ này', 403);
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

      await ServicePriceHistory.create({
        MaDV: newService.MaDV,
        DonGiaCu: 0,
        DonGiaMoi: DonGia,
        NgayApDung: new Date(),
      }, { transaction });

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

exports.getDichVu = async (req, res, next) => {
  try {
    const { id } = req.params;
    const service = await Service.findByPk(id, {
      include: [
        { model: Property, as: 'propertySpecific' },
        { model: Property, as: 'appliedToProperties' }
      ]
    });

    if (!service) throw new AppError('Không tìm thấy dịch vụ', 404);

    if (
      req.user.TenVaiTro === 'Chủ trọ' &&
      service.MaNhaTro &&
      service.propertySpecific?.MaChuTro !== req.user.MaChuTro
    ) {
      throw new AppError('Bạn không có quyền xem dịch vụ này', 403);
    }

    res.status(200).json({ status: 'success', data: service });
  } catch (err) {
    next(err);
  }
};

exports.updateGiaDichVu = async (req, res, next) => {
  try {
    const { id } = req.params; // id = MaDV
    const { DonGiaMoi } = req.body;

    if (!DonGiaMoi || DonGiaMoi <= 0) {
      throw new AppError('Giá mới phải lớn hơn 0', 400);
    }

    const dichVu = await Service.findByPk(id);
    if (!dichVu) throw new AppError('Không tìm thấy dịch vụ', 404);

    // Phân quyền chủ trọ
    if (
      req.user.TenVaiTro === 'Chủ trọ' &&
      dichVu.MaNhaTro &&
      (await Property.findByPk(dichVu.MaNhaTro)).MaChuTro !== req.user.MaChuTro
    ) {
      throw new AppError('Bạn không có quyền sửa giá dịch vụ này', 403);
    }

    const giaCu = await ServicePriceHistory.findOne({
      where: { MaDV: id },
      order: [['NgayApDung', 'DESC']]
    });

    // Nếu giá không đổi thì không làm gì
    if (giaCu && giaCu.DonGiaMoi === DonGiaMoi) {
      return res.status(200).json({ status: 'no_change', message: 'Giá không thay đổi' });
    }

    await ServicePriceHistory.create({
      MaDV: id,
      DonGiaCu: giaCu ? giaCu.DonGiaMoi : 0,
      DonGiaMoi,
      NgayApDung: new Date()
    });

    res.status(200).json({ status: 'success', message: 'Cập nhật giá thành công' });
  } catch (error) {
    next(error);
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

    if (!service) throw new AppError('Không tìm thấy dịch vụ', 404);

    if (
      req.user.TenVaiTro === 'Chủ trọ' &&
      service.MaNhaTro &&
      service.propertySpecific?.MaChuTro !== req.user.MaChuTro
    ) {
      throw new AppError('Bạn không có quyền xóa dịch vụ này', 403);
    }

    await service.update({ HoatDong: false, NgayNgungCungCap: new Date() });
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
};