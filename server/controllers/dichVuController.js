const { Service, Property, PropertyAppliedService, Landlord, ServicePriceHistory } = require('../models');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');
const serviceService = require('../services/serviceService');
const catchAsync = require('../utils/catchAsync');

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

exports.getAllServices = catchAsync(async (req, res, next) => {
    const landlordId = req.user.landlordProfile.MaChuTro;
    const services = await serviceService.getServicesForLandlord(landlordId);

    res.status(200).json({
        status: 'success',
        results: services.length,
        data: {
            services,
        },
    });
});

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

    const dichVu = await Service.findByPk(id); //
    if (!dichVu) throw new AppError('Không tìm thấy dịch vụ', 404);

    // --- BẮT ĐẦU PHẦN SỬA LỖI PHÂN QUYỀN ---
    // Phân quyền chủ trọ:
    // Nếu dịch vụ là riêng cho một nhà trọ (MaNhaTro có giá trị)
    // THÌ phải kiểm tra xem nhà trọ đó có thuộc quyền quản lý của chủ trọ hiện tại không.
    // Nếu dịch vụ là chung (MaNhaTro là null), thì chủ trọ vẫn có thể chỉnh sửa nếu có quyền chung.
    // Quyền 'service_definition:manage_own_property' áp dụng cho cả dịch vụ chung và riêng
    // (backend của bạn đã có restrictTo này ở route).
    // Logic này sẽ kiểm tra quyền sở hữu đối với dịch vụ riêng.
    if (req.user.TenVaiTro === 'Chủ trọ') { //
        if (dichVu.MaNhaTro) { // Nếu dịch vụ này thuộc về một nhà trọ cụ thể
            const property = await Property.findByPk(dichVu.MaNhaTro); //
            if (!property || property.MaChuTro !== req.user.MaChuTro) { //
                throw new AppError('Bạn không có quyền sửa giá dịch vụ này (không thuộc nhà trọ của bạn).', 403);
            }
        } else {
            // Đây là dịch vụ chung (MaNhaTro là null).
            // Middleware `restrictTo('service_definition:manage_own_property')`
            // đã đảm bảo user có quyền tổng thể để quản lý dịch vụ.
            // Không cần kiểm tra thêm quyền sở hữu nhà trọ cụ thể.
        }
    }
    // --- KẾT THÚC PHẦN SỬA LỖI PHÂN QUYỀN ---

    const giaCu = await ServicePriceHistory.findOne({
      where: { MaDV: id },
      order: [['NgayApDung', 'DESC']]
    }); //

    // Nếu giá không đổi thì không làm gì
    if (giaCu && giaCu.DonGiaMoi == DonGiaMoi) { // Sử dụng == thay vì === để so sánh DECIMAL với Number
      return res.status(200).json({ status: 'no_change', message: 'Giá không thay đổi' });
    }

    await ServicePriceHistory.create({
      MaDV: id,
      DonGiaCu: giaCu ? giaCu.DonGiaMoi : 0,
      DonGiaMoi,
      NgayApDung: new Date(),
      MaNguoiCapNhat: req.user.MaTK // Lưu MaTK của người dùng cập nhật
    });

    res.status(200).json({ status: 'success', message: 'Cập nhật giá thành công' });
  } catch (error) {
    console.error("Lỗi trong updateGiaDichVu:", error); // Thêm log chi tiết lỗi server
    next(error); // Chuyển lỗi cho middleware xử lý lỗi chung
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

// TẠO DỊCH VỤ
exports.createService = catchAsync(async (req, res, next) => {
    const landlordId = req.user.landlordProfile.MaChuTro;
    const newService = await serviceService.createServiceForLandlord(req.body, landlordId);
    res.status(201).json({
        status: 'success',
        data: { service: newService },
    });
});

// SỬA DỊCH VỤ
exports.updateService = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const landlordId = req.user.landlordProfile.MaChuTro;
    const updatedService = await serviceService.updateServiceById(id, req.body, landlordId);
    res.status(200).json({
        status: 'success',
        data: { service: updatedService },
    });
});

// XÓA DỊCH VỤ
exports.deleteService = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const landlordId = req.user.landlordProfile.MaChuTro;
    await serviceService.deleteServiceById(id, landlordId);
    res.status(204).json({
        status: 'success',
        data: null,
    });
});