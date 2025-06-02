const { HoaDon, DienNuoc, SuDungDichVu, ChiTietHoaDon, HopDong_DichVuDangKy, DichVu, LichSuGiaDichVu } = require('../models');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');

exports.createHoaDon = async (req, res, next) => {
  try {
    const { MaHopDong, KyThanhToan_TuNgay, KyThanhToan_DenNgay } = req.body;

    const hopDong = await HopDong.findOne({
      where: { MaHopDong, TrangThai: 'Có hiệu lực' },
      include: [{ model: Phong, as: 'phong', include: [{ model: NhaTro, as: 'nhaTro' }] }],
    });

    if (!hopDong) {
      throw new AppError('Contract not found or not active', 404);
    }

    if (req.user.TenVaiTro === 'Chủ trọ' && hopDong.phong.nhaTro.MaChuTro !== req.user.MaChuTro) {
      throw new AppError('You do not have permission to create invoice for this contract', 403);
    }

    // Check for duplicate invoice
    const existingHoaDon = await HoaDon.findOne({
      where: { MaHopDong, KyThanhToan_DenNgay },
    });
    if (existingHoaDon) {
      throw new AppError('Invoice already exists for this contract and period', 400);
    }

    const transaction = await sequelize.transaction();

    try {
      const hoaDon = await HoaDon.create(
        {
          MaHopDong,
          NgayLap: new Date(),
          KyThanhToan_TuNgay,
          KyThanhToan_DenNgay,
          TienPhong: hopDong.TienThueThoaThuan,
          TongTienDien: 0,
          TongTienNuoc: 0,
          TongTienDichVu: 0,
          TongTienPhaiTra: 0,
          DaThanhToan: 0,
          ConLai: 0,
          TrangThaiThanhToan: 'Chưa thanh toán',
          NgayHanThanhToan: new Date(new Date(KyThanhToan_DenNgay).getTime() + hopDong.HanThanhToan * 24 * 60 * 60 * 1000),
        },
        { transaction }
      );

      // Calculate electricity and water
      const dienNuocs = await DienNuoc.findAll({
        where: {
          MaPhong: hopDong.MaPhong,
          NgayGhi: { [Op.between]: [KyThanhToan_TuNgay, KyThanhToan_DenNgay] },
          TrangThai: 'Mới ghi',
        },
      });

      let TongTienDien = 0, TongTienNuoc = 0;
      for (const dn of dienNuocs) {
        await dn.update({ MaHoaDon: hoaDon.MaHoaDon, TrangThai: 'Đã tính tiền' }, { transaction });
        if (dn.Loai === 'Điện') TongTienDien += parseFloat(dn.ThanhTien);
        else TongTienNuoc += parseFloat(dn.ThanhTien);
      }

      // Calculate service usage
      const suDungDichVus = await SuDungDichVu.findAll({
        where: {
          MaPhong: hopDong.MaPhong,
          NgaySuDung: { [Op.between]: [KyThanhToan_TuNgay, KyThanhToan_DenNgay] },
          TrangThai: 'Mới ghi',
        },
      });

      let TongTienDVSuDung = 0;
      for (const sddv of suDungDichVus) {
        await sddv.update({ MaHoaDon: hoaDon.MaHoaDon, TrangThai: 'Đã tính tiền' }, { transaction });
        TongTienDVSuDung += parseFloat(sddv.ThanhTien);
      }

      // Calculate fixed services
      let TongTienDV_DangKy = 0;
      const dichVuDangKys = await HopDong_DichVuDangKy.findAll({
        where: { MaHopDong },
        include: [{ model: DichVu, as: 'dichVu', where: { LoaiDichVu: 'Cố định hàng tháng', HoatDong: true } }],
      });

      for (const dk of dichVuDangKys) {
        const gia = await LichSuGiaDichVu.findOne({
          where: { MaDV: dk.MaDV, NgayApDung: { [Op.lte]: KyThanhToan_DenNgay } },
          order: [['NgayApDung', 'DESC']],
        });

        if (gia) {
          TongTienDV_DangKy += parseFloat(gia.DonGiaMoi);
          await ChiTietHoaDon.create(
            {
              MaHoaDon: hoaDon.MaHoaDon,
              MaDV: dk.MaDV,
              MoTaChiTiet: dk.dichVu.TenDV,
              SoLuong: 1,
              DonGia: gia.DonGiaMoi,
              ThanhTien: gia.DonGiaMoi,
            },
            { transaction }
          );
        }
      }

      // Calculate additional fees
      const chiTietHoaDons = await ChiTietHoaDon.findAll({ where: { MaHoaDon: hoaDon.MaHoaDon } });
      const TongTienPhatSinh = chiTietHoaDons.reduce((sum, cthd) => sum + parseFloat(cthd.ThanhTien), 0);

      // Update totals
      const TongTienDichVu = TongTienDVSuDung + TongTienDV_DangKy + TongTienPhatSinh;
      const TongTienPhaiTra = parseFloat(hoaDon.TienPhong) + TongTienDien + TongTienNuoc + TongTienDichVu;

      await hoaDon.update(
        {
          TongTienDien,
          TongTienNuoc,
          TongTienDichVu,
          TongTienPhaiTra,
          ConLai: TongTienPhaiTra,
        },
        { transaction }
      );

      await transaction.commit();

      res.status(201).json({
        status: 'success',
        data: hoaDon,
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

exports.getHoaDon = async (req, res, next) => {
  try {
    const { id } = req.params;

    const hoaDon = await HoaDon.findByPk(id, {
      include: [
        { model: HopDong, as: 'hopDong', include: [{ model: Phong, as: 'phong', include: [{ model: NhaTro, as: 'nhaTro' }] }, { model: NguoiOCung, as: 'nguoiOCungs' }] },
        { model: DienNuoc, as: 'dienNuocs' },
        { model: SuDungDichVu, as: 'suDungDichVus' },
        { model: ChiTietHoaDon, as: 'chiTietHoaDons' },
      ],
    });

    if (!hoaDon) {
      throw new AppError('Invoice not found', 404);
    }

    await checkHoaDonAccess(req.user, hoaDon);

    res.status(200).json({
      status: 'success',
      data: hoaDon,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllHoaDon = async (req, res, next) => {
  try {
    const where = {};
    if (req.user.TenVaiTro === 'Chủ trọ') {
      where['$hopDong.phong.nhaTro.MaChuTro$'] = req.user.MaChuTro;
    } else if (req.user.TenVaiTro === 'Khách thuê') {
      where['$hopDong.nguoiOCungs.MaKhachThue$'] = req.user.MaKhachThue;
    }

    const hoaDons = await HoaDon.findAll({
      where,
      include: [
        {
          model: HopDong,
          as: 'hopDong',
          include: [
            { model: Phong, as: 'phong', include: [{ model: NhaTro, as: 'nhaTro' }] },
            { model: NguoiOCung, as: 'nguoiOCungs' },
          ],
        },
        { model: DienNuoc, as: 'dienNuocs' },
        { model: SuDungDichVu, as: 'suDungDichVus' },
        { model: ChiTietHoaDon, as: 'chiTietHoaDons' },
      ],
    });

    res.status(200).json({
      status: 'success',
      results: hoaDons.length,
      data: hoaDons,
    });
  } catch (error) {
    next(error);
  }
};

// Note: Update and delete operations are limited as per requirements