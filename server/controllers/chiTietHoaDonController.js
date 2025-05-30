const { ChiTietHoaDon, HoaDon, DichVu } = require('../models');
const AppError = require('../utils/error');
const { Op } = require('sequelize');

exports.createChiTietHoaDon = async (req, res, next) => {
  try {
    const { MaHoaDon, MaDV, MoTaChiTiet, SoLuong, DonGia } = req.body;

    // Verify invoice belongs to landlord's property
    const hoaDon = await HoaDon.findOne({
      where: { MaHoaDon },
      include: [
        {
          model: HopDong,
          as: 'hopDong',
          include: [
            {
              model: Phong,
              as: 'phong',
              include: [{ model: NhaTro, as: 'nhaTro' }],
            },
          ],
        },
      ],
    });

    if (!hoaDon) {
      throw new AppError('Invoice not found', 404);
    }

    if (req.user.TenVaiTro === 'Chủ trọ' && hoaDon.hopDong.phong.nhaTro.MaChuTro !== req.user.MaChuTro) {
      throw new AppError('You do not have permission to add details to this invoice', 403);
    }

    if (hoaDon.TrangThaiThanhToan === 'Đã thanh toán đủ') {
      throw new AppError('Cannot add details to a fully paid invoice', 400);
    }

    const chiTietHoaDon = await ChiTietHoaDon.create({
      MaHoaDon,
      MaDV,
      MoTaChiTiet,
      SoLuong,
      DonGia,
      ThanhTien: SoLuong * DonGia,
    });

    // Update HoaDon totals
    await updateHoaDonTotals(MaHoaDon);

    res.status(201).json({
      status: 'success',
      data: chiTietHoaDon,
    });
  } catch (error) {
    next(error);
  }
};

exports.getChiTietHoaDon = async (req, res, next) => {
  try {
    const { id } = req.params;

    const chiTietHoaDon = await ChiTietHoaDon.findByPk(id, {
      include: [
        { model: HoaDon, as: 'hoaDon' },
        { model: DichVu, as: 'dichVu' },
      ],
    });

    if (!chiTietHoaDon) {
      throw new AppError('Invoice detail not found', 404);
    }

    // Authorization check
    await checkHoaDonAccess(req.user, chiTietHoaDon.hoaDon);

    res.status(200).json({
      status: 'success',
      data: chiTietHoaDon,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllChiTietHoaDon = async (req, res, next) => {
  try {
    const { MaHoaDon } = req.query;
    const where = {};

    if (MaHoaDon) {
      where.MaHoaDon = MaHoaDon;
      const hoaDon = await HoaDon.findByPk(MaHoaDon);
      if (!hoaDon) throw new AppError('Invoice not found', 404);
      await checkHoaDonAccess(req.user, hoaDon);
    } else if (req.user.TenVaiTro === 'Chủ trọ') {
      where['$hoaDon.hopDong.phong.nhaTro.MaChuTro$'] = req.user.MaChuTro;
    } else if (req.user.TenVaiTro === 'Khách thuê') {
      where['$hoaDon.hopDong.nguoiOCungs.MaKhachThue$'] = req.user.MaKhachThue;
    }

    const chiTietHoaDons = await ChiTietHoaDon.findAll({
      where,
      include: [
        {
          model: HoaDon,
          as: 'hoaDon',
          include: [
            {
              model: HopDong,
              as: 'hopDong',
              include: [
                { model: Phong, as: 'phong', include: [{ model: NhaTro, as: 'nhaTro' }] },
                { model: NguoiOCung, as: 'nguoiOCungs' },
              ],
            },
          ],
        },
        { model: DichVu, as: 'dichVu' },
      ],
    });

    res.status(200).json({
      status: 'success',
      results: chiTietHoaDons.length,
      data: chiTietHoaDons,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateChiTietHoaDon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { MoTaChiTiet, SoLuong, DonGia } = req.body;

    const chiTietHoaDon = await ChiTietHoaDon.findByPk(id, {
      include: [
        {
          model: HoaDon,
          as: 'hoaDon',
          include: [
            {
              model: HopDong,
              as: 'hopDong',
              include: [{ model: Phong, as: 'phong', include: [{ model: NhaTro, as: 'nhaTro' }] }],
            },
          ],
        },
      ],
    });

    if (!chiTietHoaDon) {
      throw new AppError('Invoice detail not found', 404);
    }

    if (req.user.TenVaiTro === 'Chủ trọ' && chiTietHoaDon.hoaDon.hopDong.phong.nhaTro.MaChuTro !== req.user.MaChuTro) {
      throw new AppError('You do not have permission to update this invoice detail', 403);
    }

    if (chiTietHoaDon.hoaDon.TrangThaiThanhToan === 'Đã thanh toán đủ') {
      throw new AppError('Cannot update details of a fully paid invoice', 400);
    }

    await chiTietHoaDon.update({
      MoTaChiTiet,
      SoLuong,
      DonGia,
      ThanhTien: SoLuong * DonGia,
    });

    // Update HoaDon totals
    await updateHoaDonTotals(chiTietHoaDon.MaHoaDon);

    res.status(200).json({
      status: 'success',
      data: chiTietHoaDon,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteChiTietHoaDon = async (req, res, next) => {
  try {
    const { id } = req.params;

    const chiTietHoaDon = await ChiTietHoaDon.findByPk(id, {
      include: [
        {
          model: HoaDon,
          as: 'hoaDon',
          include: [
            {
              model: HopDong,
              as: 'hopDong',
              include: [{ model: Phong, as: 'phong', include: [{ model: NhaTro, as: 'nhaTro' }] }],
            },
          ],
        },
      ],
    });

    if (!chiTietHoaDon) {
      throw new AppError('Invoice detail not found', 404);
    }

    if (req.user.TenVaiTro === 'Chủ trọ' && chiTietHoaDon.hoaDon.hopDong.phong.nhaTro.MaChuTro !== req.user.MaChuTro) {
      throw new AppError('You do not have permission to delete this invoice detail', 403);
    }

    if (chiTietHoaDon.hoaDon.TrangThaiThanhToan === 'Đã thanh toán đủ') {
      throw new AppError('Cannot delete details of a fully paid invoice', 400);
    }

    const MaHoaDon = chiTietHoaDon.MaHoaDon;
    await chiTietHoaDon.destroy();

    // Update HoaDon totals
    await updateHoaDonTotals(MaHoaDon);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to update HoaDon totals
const updateHoaDonTotals = async (MaHoaDon) => {
  const hoaDon = await HoaDon.findByPk(MaHoaDon, {
    include: [
      { model: DienNuoc, as: 'dienNuocs' },
      { model: SuDungDichVu, as: 'suDungDichVus' },
      { model: ChiTietHoaDon, as: 'chiTietHoaDons' },
    ],
  });

  const TongTienDien = hoaDon.dienNuocs
    .filter(dn => dn.Loai === 'Điện')
    .reduce((sum, dn) => sum + parseFloat(dn.ThanhTien), 0);
  const TongTienNuoc = hoaDon.dienNuocs
    .filter(dn => dn.Loai === 'Nước')
    .reduce((sum, dn) => sum + parseFloat(dn.ThanhTien), 0);
  const TongTienDichVu = hoaDon.suDungDichVus.reduce((sum, sddv) => sum + parseFloat(sddv.ThanhTien), 0) +
    hoaDon.chiTietHoaDons.reduce((sum, cthd) => sum + parseFloat(cthd.ThanhTien), 0);

  const TongTienPhaiTra = parseFloat(hoaDon.TienPhong) + TongTienDien + TongTienNuoc + TongTienDichVu;
  const ConLai = TongTienPhaiTra - parseFloat(hoaDon.DaThanhToan);

  await hoaDon.update({
    TongTienDien,
    TongTienNuoc,
    TongTienDichVu,
    TongTienPhaiTra,
    ConLai,
    TrangThaiThanhToan: ConLai <= 0 ? 'Đã thanh toán đủ' : ConLai < TongTienPhaiTra ? 'Đã thanh toán một phần' : 'Chưa thanh toán',
  });
};

// Helper function to check HoaDon access
const checkHoaDonAccess = async (user, hoaDon) => {
  if (user.TenVaiTro === 'Chủ trọ') {
    const nhaTro = await hoaDon.getHopDong({
      include: [{ model: Phong, as: 'phong', include: [{ model: NhaTro, as: 'nhaTro' }] }],
    });
    if (nhaTro.phong.nhaTro.MaChuTro !== user.MaChuTro) {
      throw new AppError('You do not have permission to access this invoice', 403);
    }
  } else if (user.TenVaiTro === 'Khách thuê') {
    const nguoiOCung = await NguoiOCung.findOne({
      where: { MaHopDong: hoaDon.MaHopDong, MaKhachThue: user.MaKhachThue },
    });
    if (!nguoiOCung) {
      throw new AppError('You do not have permission to access this invoice', 403);
    }
  }
};