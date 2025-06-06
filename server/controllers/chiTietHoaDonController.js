const { InvoiceDetail, Invoice, Service } = require('../models');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');

exports.createChiTietHoaDon = async (req, res, next) => {
  try {
    const {
      MaHoaDon,
      LoaiChiPhi,
      MoTaChiTiet,
      MaDV_LienQuan,
      SoLuong,
      DonGia,
      DonViTinh,
    } = req.body;

    const hoaDon = await Invoice.findByPk(MaHoaDon, {
      include: [
        {
          association: 'contract',
          include: [
            {
              association: 'phong',
              include: ['nhaTro']
            }
          ]
        }
      ]
    });

    if (!hoaDon) throw new AppError('Invoice not found', 404);

    if (req.user.TenVaiTro === 'Chủ trọ' && hoaDon.contract.phong.nhaTro.MaChuTro !== req.user.MaChuTro) {
      throw new AppError('You do not have permission to add details to this invoice', 403);
    }

    if (hoaDon.TrangThaiThanhToan === 'Đã thanh toán đủ') {
      throw new AppError('Cannot add details to a fully paid invoice', 400);
    }

    const chiTietHoaDon = await InvoiceDetail.create({
      MaHoaDon,
      LoaiChiPhi,
      MoTaChiTiet,
      MaDV_LienQuan,
      SoLuong,
      DonGia,
      DonViTinh,
      ThanhTien: SoLuong * DonGia,
    });

    await updateHoaDonTotals(MaHoaDon);

    res.status(201).json({ status: 'success', data: chiTietHoaDon });
  } catch (error) {
    next(error);
  }
};

exports.getChiTietHoaDon = async (req, res, next) => {
  try {
    const { id } = req.params;

    const chiTiet = await InvoiceDetail.findByPk(id, {
      include: [
        { model: Invoice, as: 'invoice' },
        { model: Service, as: 'service' }
      ]
    });

    if (!chiTiet) throw new AppError('Invoice detail not found', 404);
    await checkHoaDonAccess(req.user, chiTiet.invoice);

    res.status(200).json({ status: 'success', data: chiTiet });
  } catch (error) {
    next(error);
  }
};

exports.getAllChiTietHoaDon = async (req, res, next) => {
  try {
    const { MaHoaDon } = req.query;
    const where = {};
    let hoaDon;

    if (MaHoaDon) {
      hoaDon = await Invoice.findByPk(MaHoaDon, {
        include: [
          {
            association: 'contract',
            include: [
              { association: 'phong', include: ['nhaTro'] },
              { association: 'nguoiOCungs' }
            ]
          }
        ]
      });

      if (!hoaDon) throw new AppError('Invoice not found', 404);
      await checkHoaDonAccess(req.user, hoaDon);
      where.MaHoaDon = MaHoaDon;
    }

    const chiTietHoaDons = await InvoiceDetail.findAll({
      where,
      include: [
        {
          model: Invoice,
          as: 'invoice',
          include: [
            {
              association: 'contract',
              include: [
                { association: 'phong', include: ['nhaTro'] },
                { association: 'nguoiOCungs' }
              ]
            }
          ]
        },
        { model: Service, as: 'service' }
      ]
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
    const {
      LoaiChiPhi,
      MoTaChiTiet,
      MaDV_LienQuan,
      SoLuong,
      DonGia,
      DonViTinh
    } = req.body;

    const chiTiet = await InvoiceDetail.findByPk(id, {
      include: [
        {
          model: Invoice,
          as: 'invoice',
          include: [
            {
              association: 'contract',
              include: [
                { association: 'phong', include: ['nhaTro'] }
              ]
            }
          ]
        }
      ]
    });

    if (!chiTiet) throw new AppError('Invoice detail not found', 404);

    if (req.user.TenVaiTro === 'Chủ trọ' && chiTiet.invoice.contract.phong.nhaTro.MaChuTro !== req.user.MaChuTro) {
      throw new AppError('You do not have permission to update this invoice detail', 403);
    }

    if (chiTiet.invoice.TrangThaiThanhToan === 'Đã thanh toán đủ') {
      throw new AppError('Cannot update details of a fully paid invoice', 400);
    }

    await chiTiet.update({
      LoaiChiPhi,
      MoTaChiTiet,
      MaDV_LienQuan,
      SoLuong,
      DonGia,
      DonViTinh,
      ThanhTien: SoLuong * DonGia,
    });

    await updateHoaDonTotals(chiTiet.MaHoaDon);

    res.status(200).json({ status: 'success', data: chiTiet });
  } catch (error) {
    next(error);
  }
};

exports.deleteChiTietHoaDon = async (req, res, next) => {
  try {
    const { id } = req.params;

    const chiTiet = await InvoiceDetail.findByPk(id, {
      include: [
        {
          model: Invoice,
          as: 'invoice',
          include: [
            {
              association: 'contract',
              include: [
                { association: 'phong', include: ['nhaTro'] }
              ]
            }
          ]
        }
      ]
    });

    if (!chiTiet) throw new AppError('Invoice detail not found', 404);

    if (req.user.TenVaiTro === 'Chủ trọ' && chiTiet.invoice.contract.phong.nhaTro.MaChuTro !== req.user.MaChuTro) {
      throw new AppError('You do not have permission to delete this invoice detail', 403);
    }

    if (chiTiet.invoice.TrangThaiThanhToan === 'Đã thanh toán đủ') {
      throw new AppError('Cannot delete details of a fully paid invoice', 400);
    }

    const MaHoaDon = chiTiet.MaHoaDon;
    await chiTiet.destroy();
    await updateHoaDonTotals(MaHoaDon);

    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    next(error);
  }
};