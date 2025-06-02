const { DienNuoc, LichSuGiaDienNuoc, Phong, NhaTro } = require('../models');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');

exports.createDienNuoc = async (req, res, next) => {
  try {
    const { MaPhong, Loai, ChiSoDau, ChiSoCuoi, NgayGhi, GhiChu } = req.body;

    const phong = await Phong.findByPk(MaPhong, {
      include: [{ model: NhaTro, as: 'nhaTro' }],
    });

    if (!phong) {
      throw new AppError('Room not found', 404);
    }

    if (req.user.TenVaiTro === 'Chủ trọ' && phong.nhaTro.MaChuTro !== req.user.MaChuTro) {
      throw new AppError('You do not have permission to record for this room', 403);
    }

    if (ChiSoCuoi < ChiSoDau) {
      throw new AppError('End reading must be greater than or equal to start reading', 400);
    }

    const latestDienNuoc = await DienNuoc.findOne({
      where: { MaPhong, Loai, TrangThai: { [Op.ne]: 'Đã hủy' } },
      order: [['NgayGhi', 'DESC']],
    });

    if (latestDienNuoc && ChiSoDau !== latestDienNuoc.ChiSoCuoi) {
      throw new AppError('Start reading must match the previous end reading', 400);
    }

    const gia = await LichSuGiaDienNuoc.findOne({
      where: {
        MaNhaTro: phong.MaNhaTro,
        Loai,
        NgayApDung: { [Op.lte]: NgayGhi },
      },
      order: [['NgayApDung', 'DESC']],
    });

    if (!gia) {
      throw new AppError('No applicable price found for this period', 400);
    }

    const SoLuongTieuThu = ChiSoCuoi - ChiSoDau;
    const ThanhTien = SoLuongTieuThu * parseFloat(gia.DonGiaMoi);

    const dienNuoc = await DienNuoc.create({
      MaPhong,
      Loai,
      ChiSoDau,
      ChiSoCuoi,
      SoLuongTieuThu,
      DonGia: gia.DonGiaMoi,
      ThanhTien,
      NgayGhi,
      GhiChu,
      TrangThai: 'Mới ghi',
    });

    res.status(201).json({
      status: 'success',
      data: dienNuoc,
    });
  } catch (error) {
    next(error);
  }
};

exports.getDienNuoc = async (req, res, next) => {
  try {
    const { id } = req.params;

    const dienNuoc = await DienNuoc.findByPk(id, {
      include: [{ model: Phong, as: 'phong', include: [{ model: NhaTro, as: 'nhaTro' }] }],
    });

    if (!dienNuoc) {
      throw new AppError('Electricity/Water record not found', 404);
    }

    if (req.user.TenVaiTro === 'Chủ trọ' && dienNuoc.phong.nhaTro.MaChuTro !== req.user.MaChuTro) {
      throw new AppError('You do not have permission to view this record', 403);
    }

    if (req.user.TenVaiTro === 'Khách thuê') {
      const nguoiOCung = await NguoiOCung.findOne({
        where: { MaKhachThue: req.user.MaKhachThue, MaHopDong: { [Op.in]: await getHopDongIdsForPhong(dienNuoc.MaPhong) } },
      });
      if (!nguoiOCung) {
        throw new AppError('You do not have permission to view this record', 403);
      }
    }

    res.status(200).json({
      status: 'success',
      data: dienNuoc,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllDienNuoc = async (req, res, next) => {
  try {
    const where = {};
    if (req.user.TenVaiTro === 'Chủ trọ') {
      where['$phong.nhaTro.MaChuTro$'] = req.user.MaChuTro;
    } else if (req.user.TenVaiTro === 'Khách thuê') {
      where['$hopDong.nguoiOCungs.MaKhachThue$'] = req.user.MaKhachThue;
    }

    const dienNuocs = await DienNuoc.findAll({
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
      ],
    });

    res.status(200).json({
      status: 'success',
      results: dienNuocs.length,
      data: dienNuocs,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateDienNuoc = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ChiSoCuoi, NgayGhi, GhiChu } = req.body;

    const dienNuoc = await DienNuoc.findByPk(id, {
      include: [{ model: Phong, as: 'phong', include: [{ model: NhaTro, as: 'nhaTro' }] }],
    });

    if (!dienNuoc) {
      throw new AppError('Electricity/Water record not found', 404);
    }

    if (req.user.TenVaiTro === 'Chủ trọ' && dienNuoc.phong.nhaTro.MaChuTro !== req.user.MaChuTro) {
      throw new AppError('You do not have permission to update this record', 403);
    }

    if (dienNuoc.TrangThai !== 'Mới ghi') {
      throw new AppError('Cannot update a record that is already billed or cancelled', 400);
    }

    if (ChiSoCuoi < dienNuoc.ChiSoDau) {
      throw new AppError('End reading must be greater than or equal to start reading', 400);
    }

    const gia = await LichSuGiaDienNuoc.findOne({
      where: {
        MaNhaTro: dienNuoc.phong.MaNhaTro,
        Loai: dienNuoc.Loai,
        NgayApDung: { [Op.lte]: NgayGhi || dienNuoc.NgayGhi },
      },
      order: [['NgayApDung', 'DESC']],
    });

    if (!gia) {
      throw new AppError('No applicable price found for this period', 400);
    }

    const SoLuongTieuThu = ChiSoCuoi - dienNuoc.ChiSoDau;
    const ThanhTien = SoLuongTieuThu * parseFloat(gia.DonGiaMoi);

    await dienNuoc.update({
      ChiSoCuoi,
      SoLuongTieuThu,
      DonGia: gia.DonGiaMoi,
      ThanhTien,
      NgayGhi,
      GhiChu,
    });

    res.status(200).json({
      status: 'success',
      data: dienNuoc,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteDienNuoc = async (req, res, next) => {
  try {
    const { id } = req.params;

    const dienNuoc = await DienNuoc.findByPk(id, {
      include: [{ model: Phong, as: 'phong', include: [{ model: NhaTro, as: 'nhaTro' }] }],
    });

    if (!dienNuoc) {
      throw new AppError('Electricity/Water record not found', 404);
    }

    if (req.user.TenVaiTro === 'Chủ trọ' && dienNuoc.phong.nhaTro.MaChuTro !== req.user.MaChuTro) {
      throw new AppError('You do not have permission to delete this record', 403);
    }

    if (dienNuoc.TrangThai !== 'Mới ghi') {
      throw new AppError('Cannot delete a record that is already billed or cancelled', 400);
    }

    await dienNuoc.update({ TrangThai: 'Đã hủy' });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to get HopDong IDs for a Phong
const getHopDongIdsForPhong = async (MaPhong) => {
  const hopDongs = await HopDong.findAll({
    where: { MaPhong, TrangThai: 'Có hiệu lực' },
    attributes: ['MaHopDong'],
  });
  return hopDongs.map(hd => hd.MaHopDong);
};