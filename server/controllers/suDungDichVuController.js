const { SuDungDichVu, DichVu, LichSuGiaDichVu, Phong, NhaTro } = require('../models');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');

exports.createSuDungDichVu = async (req, res, next) => {
  try {
    const { MaPhong, MaDV, NgaySuDung, SoLuong, GhiChu } = req.body;

    const phong = await Phong.findByPk(MaPhong, {
      include: [{ model: NhaTro, as: 'nhaTro' }],
    });

    if (!phong) {
      throw new AppError('Room not found', 404);
    }

    if (req.user.TenVaiTro === 'Chủ trọ' && phong.nhaTro.MaChuTro !== req.user.MaChuTro) {
      throw new AppError('You do not have permission to record for this room', 403);
    }

    const dichVu = await DichVu.findByPk(MaDV);
    if (!dichVu || !dichVu.HoatDong) {
      throw new AppError('Service not found or inactive', 404);
    }

    if (dichVu.MaNhaTro && dichVu.MaNhaTro !== phong.MaNhaTro) {
      throw new AppError('Service not applicable to this property', 400);
    }

    const gia = await LichSuGiaDichVu.findOne({
      where: { MaDV, NgayApDung: { [Op.lte]: NgaySuDung } },
      order: [['NgayApDung', 'DESC']],
    });

    if (!gia) {
      throw new AppError('No applicable price found for this period', 400);
    }

    const ThanhTien = SoLuong * parseFloat(gia.DonGiaMoi);

    const suDungDichVu = await SuDungDichVu.create({
      MaPhong,
      MaDV,
      NgaySuDung,
      SoLuong,
      DonGia: gia.DonGiaMoi,
      ThanhTien,
      GhiChu,
      TrangThai: 'Mới ghi',
    });

    res.status(201).json({
      status: 'success',
      data: suDungDichVu,
    });
  } catch (error) {
    next(error);
  }
};

exports.getSuDungDichVu = async (req, res, next) => {
  try {
    const { id } = req.params;

    const suDungDichVu = await SuDungDichVu.findByPk(id, {
      include: [
        { model: Phong, as: 'phong', include: [{ model: NhaTro, as: 'nhaTro' }] },
        { model: DichVu, as: 'dichVu' },
      ],
    });

    if (!suDungDichVu) {
      throw new AppError('Service usage not found', 404);
    }

    if (req.user.TenVaiTro === 'Chủ trọ' && suDungDichVu.phong.nhaTro.MaChuTro !== req.user.MaChuTro) {
      throw new AppError('You do not have permission to view this record', 403);
    }

    if (req.user.TenVaiTro === 'Khách thuê') {
      const nguoiOCung = await NguoiOCung.findOne({
        where: { MaKhachThue: req.user.MaKhachThue, MaHopDong: { [Op.in]: await getHopDongIdsForPhong(suDungDichVu.MaPhong) } },
      });
      if (!nguoiOCung) {
        throw new AppError('You do not have permission to view this record', 403);
      }
    }

    res.status(200).json({
      status: 'success',
      data: suDungDichVu,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllSuDungDichVu = async (req, res, next) => {
  try {
    const where = {};
    if (req.user.TenVaiTro === 'Chủ trọ') {
      where['$phong.nhaTro.MaChuTro$'] = req.user.MaChuTro;
    } else if (req.user.TenVaiTro === 'Khách thuê') {
      where['$hopDong.nguoiOCungs.MaKhachThue$'] = req.user.MaKhachThue;
    }

    const suDungDichVus = await SuDungDichVu.findAll({
      where,
      include: [
        {
          model: Phong,
          as: 'phong',
          include: [
            {
              model: NhaTro,
              as: 'nhaTro',
            },
            {
              model: HopDong,
              as: 'hopDongs',
              include: [{ model: NguoiOCung, as: 'nguoiOCungs' }],
            },
          ],
        },
        { model: DichVu, as: 'dichVu' },
      ],
    });

    res.status(200).json({
      status: 'success',
      results: suDungDichVus.length,
      data: suDungDichVus,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSuDungDichVu = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { SoLuong, NgaySuDung, GhiChu } = req.body;

    const suDungDichVu = await SuDungDichVu.findByPk(id, {
      include: [{ model: Phong, as: 'phong', include: [{ model: NhaTro, as: 'nhaTro' }] }],
    });

    if (!suDungDichVu) {
      throw new AppError('Service usage not found', 404);
    }

    if (req.user.TenVaiTro === 'Chủ trọ' && suDungDichVu.phong.nhaTro.MaChuTro !== req.user.MaChuTro) {
      throw new AppError('You do not have permission to update this record', 403);
    }

    if (suDungDichVu.TrangThai !== 'Mới ghi') {
      throw new AppError('Cannot update a record that is already billed or cancelled', 400);
    }

    const gia = await LichSuGiaDichVu.findOne({
      where: { MaDV: suDungDichVu.MaDV, NgayApDung: { [Op.lte]: NgaySuDung || suDungDichVu.NgaySuDung } },
      order: [['NgayApDung', 'DESC']],
    });

    if (!gia) {
      throw new AppError('No applicable price found for this period', 400);
    }

    const ThanhTien = SoLuong * parseFloat(gia.DonGiaMoi);

    await suDungDichVu.update({
      SoLuong,
      DonGia: gia.DonGiaMoi,
      ThanhTien,
      NgaySuDung,
      GhiChu,
    });

    res.status(200).json({
      status: 'success',
      data: suDungDichVu,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteSuDungDichVu = async (req, res, next) => {
  try {
    const { id } = req.params;

    const suDungDichVu = await SuDungDichVu.findByPk(id, {
      include: [{ model: Phong, as: 'phong', include: [{ model: NhaTro, as: 'nhaTro' }] }],
    });

    if (!suDungDichVu) {
      throw new AppError('Service usage not found', 404);
    }

    if (req.user.TenVaiTro === 'Chủ trọ' && suDungDichVu.phong.nhaTro.MaChuTro !== req.user.MaChuTro) {
      throw new AppError('You do not have permission to delete this record', 403);
    }

    if (suDungDichVu.TrangThai !== 'Mới ghi') {
      throw new AppError('Cannot delete a record that is already billed or cancelled', 400);
    }

    await suDungDichVu.update({ TrangThai: 'Đã hủy' });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};