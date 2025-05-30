const { ChiTietThanhToan, HoaDon } = require('../models');
const AppError = require('../utils/error');
const { Op } = require('sequelize');

exports.createChiTietThanhToan = async (req, res, next) => {
  try {
    const { MaHoaDon, SoTien, MaPTTT, MaGiaoDich, GhiChu } = req.body;

    const hoaDon = await HoaDon.findOne({
      where: { MaHoaDon },
      include: [
        {
          model: HopDong,
          as: 'hopDong',
          include: [
            { model: Phong, as: 'phong', include: [{ model: NhaTro, as: 'nhaTro' }] },
          ],
        },
      ],
    });

    if (!hoaDon) {
      throw new AppError('Invoice not found', 404);
    }

    if (req.user.TenVaiTro === 'Chủ trọ' && hoaDon.hopDong.phong.nhaTro.MaChuTro !== req.user.MaChuTro) {
      throw new AppError('You do not have permission to record payment for this invoice', 403);
    }

    if (SoTien <= 0) {
      throw new AppError('Payment amount must be greater than 0', 400);
    }

    const transaction = await sequelize.transaction();

    try {
      const chiTietThanhToan = await ChiTietThanhToan.create(
        {
          MaHoaDon,
          SoTien,
          MaPTTT,
          MaGiaoDich,
          GhiChu,
          MaNguoiNhanTK: req.user.MaChuTro,
          NgayThanhToan: new Date(),
        },
        { transaction }
      );

      // Update HoaDon
      hoaDon.DaThanhToan = parseFloat(hoaDon.DaThanhToan) + parseFloat(SoTien);
      hoaDon.ConLai = parseFloat(hoaDon.TongTienPhaiTra) - parseFloat(hoaDon.DaThanhToan);
      hoaDon.TrangThaiThanhToan =
        hoaDon.ConLai <= 0
          ? 'Đã thanh toán đủ'
          : hoaDon.DaThanhToan > 0
          ? 'Đã thanh toán một phần'
          : 'Chưa thanh toán';

      await hoaDon.save({ transaction });

      await transaction.commit();

      res.status(201).json({
        status: 'success',
        data: chiTietThanhToan,
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

exports.getChiTietThanhToan = async (req, res, next) => {
  try {
    const { id } = req.params;

    const chiTietThanhToan = await ChiTietThanhToan.findByPk(id, {
      include: [
        { model: HoaDon, as: 'hoaDon' },
        { model: PhuongThucThanhToan, as: 'phuongThucThanhToan' },
        { model: ChuTro, as: 'nguoiNhan' },
      ],
    });

    if (!chiTietThanhToan) {
      throw new AppError('Payment detail not found', 404);
    }

    await checkHoaDonAccess(req.user, chiTietThanhToan.hoaDon);

    res.status(200).json({
      status: 'success',
      data: chiTietThanhToan,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllChiTietThanhToan = async (req, res, next) => {
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

    const chiTietThanhToans = await ChiTietThanhToan.findAll({
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
        { model: PhuongThucThanhToan, as: 'phuongThucThanhToan' },
        { model: ChuTro, as: 'nguoiNhan' },
      ],
    });

    res.status(200).json({
      status: 'success',
      results: chiTietThanhToans.length,
      data: chiTietThanhToans,
    });
  } catch (error) {
    next(error);
  }
};

// No update/delete for ChiTietThanhToan as per requirements (immutable after creation)