// clone nhatro/server/services/serviceService.js
const { Op } = require('sequelize');
const { Service, Property, PropertyAppliedService, ServicePriceHistory, ContractRegisteredService, ServiceUsage, sequelize } = require('../models');
const AppError = require('../utils/AppError');

// LẤY DANH SÁCH DỊCH VỤ
const getServicesForLandlord = async (landlordId) => {
    return Service.findAll({
      where: { MaChuTro: landlordId },
      // Thêm include để lấy danh sách nhà trọ mà dịch vụ này đã được áp dụng
      include: [{
        model: Property,
        as: 'appliedToProperties',
        attributes: ['MaNhaTro', 'TenNhaTro'], // Chỉ cần lấy ID và Tên
        through: { attributes: [] } // Không cần lấy thông tin từ bảng trung gian
      }],
      order: [['TenDV', 'ASC']],
    });
  };

  const getServiceById = async (serviceId, landlordId) => {
    const service = await Service.findOne({
        where: { MaDV: serviceId, MaChuTro: landlordId }, // Kiểm tra sở hữu ngay trong query
        include: [{
            model: Property,
            as: 'appliedToProperties',
            attributes: ['MaNhaTro', 'TenNhaTro'],
            through: { attributes: [] }
        }]
    });

    if (!service) {
        throw new AppError('Không tìm thấy dịch vụ hoặc bạn không có quyền truy cập.', 404);
    }
    return service;
};

// TẠO DỊCH VỤ MỚI
const createServiceForLandlord = async (serviceData, propertyIdsToApply, landlordId) => {
  const t = await sequelize.transaction();
  try {
    const servicePayload = { ...serviceData, MaChuTro: landlordId };
    delete servicePayload.DonGia; // Xóa DonGia khỏi data tạo service

    const newService = await Service.create(servicePayload, { transaction: t });

    await ServicePriceHistory.create({
        MaDV: newService.MaDV,
        DonGiaMoi: serviceData.DonGia,
        NgayApDung: new Date(),
    }, { transaction: t });

    if (propertyIdsToApply && propertyIdsToApply.length > 0) {
      const applications = propertyIdsToApply.map(propertyId => ({
        MaNhaTro: propertyId,
        MaDV: newService.MaDV,
      }));
      await PropertyAppliedService.bulkCreate(applications, { transaction: t });
    }

    await t.commit();
    return newService;
  } catch (error) {
    await t.rollback();
    throw new AppError(error.message || 'Tạo dịch vụ thất bại.', 500);
  }
};

// SỬA DỊCH VỤ
const updateServiceById = async (serviceId, updateData, propertyIdsToApply, landlordId) => {
    const t = await sequelize.transaction();
    try {
        const service = await Service.findByPk(serviceId, { transaction: t });
        if (!service) throw new AppError('Không tìm thấy dịch vụ.', 404);
        if (service.MaChuTro !== landlordId) throw new AppError('Bạn không có quyền sửa dịch vụ này.', 403);

        // ... logic kiểm tra ràng buộc sửa các trường quan trọng giữ nguyên ...

        // Cập nhật thông tin cơ bản của dịch vụ
        await service.update(updateData, { transaction: t });

        // Cập nhật lại danh sách nhà trọ được áp dụng
        // 1. Xóa tất cả các liên kết cũ
        await PropertyAppliedService.destroy({ where: { MaDV: serviceId }, transaction: t });
        // 2. Tạo lại các liên kết mới dựa trên danh sách được gửi lên
        if (propertyIdsToApply && propertyIdsToApply.length > 0) {
            const applications = propertyIdsToApply.map(propertyId => ({
                MaNhaTro: propertyId,
                MaDV: serviceId,
            }));
            await PropertyAppliedService.bulkCreate(applications, { transaction: t });
        }

        await t.commit();
        return service;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};
// XÓA DỊCH VỤ
const deleteServiceById = async (serviceId, landlordId) => {
    const service = await Service.findByPk(serviceId);
    if (!service) throw new AppError('Không tìm thấy dịch vụ.', 404);
    if (service.MaChuTro !== landlordId) throw new AppError('Bạn không có quyền xóa dịch vụ này.', 403);

    const usageCount = await ContractRegisteredService.count({ where: { MaDV: serviceId } }) + await ServiceUsage.count({ where: { MaDV: serviceId } });
    if (usageCount > 0) throw new AppError('Không thể xóa dịch vụ vì đã được sử dụng hoặc đăng ký.', 400);

    await service.destroy();
};

module.exports = {
    getServicesForLandlord,
    getServiceById,
  createServiceForLandlord,
  updateServiceById,
  deleteServiceById,
};