const { DichVu, NhaTro_DichVuApDung } = require('../models');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');

exports.createDichVu = async (req, res, next) => {
  try {
    const { TenDV, LoaiDichVu, DonViTinh, MaNhaTro } = req.body;

    if (req.user.TenVaiTro === 'Chủ trọ' && MaNhaTro) {
      const nhaTro = await NhaTro.findByPk(MaNhaTro);
      if (!nhaTro || nhaTro.MaChuTro !== req.user.MaChuTro) {
        throw new AppError('You do not have permission to create service for this property', 403);
      }
    }

    const transaction = await sequelize.transaction();

    try {
      const dichVu = await DichVu.create(
        {
          TenDV,
          LoaiDichVu,
          DonViTinh,
          MaNhaTro,
          HoatDong: true,
        },
        { transaction }
      );

      if (MaNhaTro) {
        await NhaTro_DichVuApDung.create(
          { MaNhaTro, MaDV: dichVu.MaDV },
          { transaction }
        );
      }

      await transaction.commit();

      res.status(201).json({
        status: 'success',
        data: dichVu,
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

exports.getDichVu = async (req, res, next) => {
  try {
    const { id } = req.params;

    const dichVu = await DichVu.findByPk(id, {
      include: [{ model: NhaTro, as: 'nhaTroRieng' }, { model: NhaTro, as: 'nhaTrosApDung' }],
    });

    if (!dichVu) {
      throw new AppError('Service not found', 404);
    }

    if (req.user.TenVaiTro === 'Chủ trọ' && dichVu.MaNhaTro && dichVu.nhaTroRieng.MaChuTro !== req.user.MaChuTro) {
      throw new AppError('You do not have permission to view this service', 403);
    }

    res.status(200).json({
      status: 'success',
      data: dichVu,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllDichVu = async (req, res, next) => {
  try {
    const where = { HoatDong: true };
    if (req.user.TenVaiTro === 'Chủ trọ') {
      where[Op.or] = [
        { MaNhaTro: null },
        { '$nhaTrosApDung.MaChuTro$': req.user.MaChuTro },
      ];
    }

    const dichVus = await DichVu.findAll({
      where,
      include: [
        { model: NhaTro, as: 'nhaTroRieng' },
        {
          model: NhaTro,
          as: 'nhaTrosApDung',
          through: { attributes: [] },
          include: [{ model: ChuTro, as: 'chuTro' }],
        },
      ],
    });

    res.status(200).json({
      status: 'success',
      results: dichVus.length,
      data: dichVus,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateDichVu = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { TenDV, LoaiDichVu, DonViTinh, MaNhaTro, HoatDong } = req.body;

    const dichVu = await DichVu.findByPk(id, {
      include: [{ model: NhaTro, as: 'nhaTroRieng' }],
    });

    if (!dichVu) {
      throw new AppError('Service not found', 404);
    }

    if (req.user.TenVaiTro === 'Chủ trọ' && dichVu.MaNhaTro && dichVu.nhaTroRieng.MaChuTro !== req.user.MaChuTro) {
      throw new AppError('You do not have permission to update this service', 403);
    }

    const transaction = await sequelize.transaction();

    try {
      await dichVu.update(
        { TenDV, LoaiDichVu, DonViTinh, MaNhaTro, HoatDong },
        { transaction }
      );

      if (MaNhaTro && MaNhaTro !== dichVu.MaNhaTro) {
        await NhaTro_DichVuApDung.destroy(
          { where: { MaDV: id } },
          { transaction }
        );
        await NhaTro_DichVuApDung.create(
          { MaNhaTro, MaDV: id },
          { transaction }
        );
      }

      await transaction.commit();

      res.status(200).json({
        status: 'success',
        data: dichVu,
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

exports.deleteDichVu = async (req, res, next) => {
  try {
    const { id } = req.params;

    const dichVu = await DichVu.findByPk(id, {
      include: [{ model: NhaTro, as: 'nhaTroRieng' }],
    });

    if (!dichVu) {
      throw new AppError('Service not found', 404);
    }

    if (req.user.TenVaiTro === 'Chủ trọ' && dichVu.MaNhaTro && dichVu.nhaTroRieng.MaChuTro !== req.user.MaChuTro) {
      throw new AppError('You do not have permission to delete this service', 403);
    }

    // Instead of deleting, set HoatDong to false
    await dichVu.update({ HoatDong: false, NgayNgungCungCap: new Date() });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};