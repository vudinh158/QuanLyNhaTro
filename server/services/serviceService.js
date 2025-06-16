// clone nhatro/server/services/serviceService.js
const { Op } = require('sequelize');
const { Service, Property, PropertyAppliedService, ServicePriceHistory, ContractRegisteredService, ServiceUsage, sequelize } = require('../models');
const AppError = require('../utils/AppError');

const getServiceAndCheckOwnership = async (serviceId, landlordId) => {
    const service = await Service.findByPk(serviceId);
    if (!service) {
        throw new AppError(`Không tìm thấy dịch vụ với ID ${serviceId}.`, 404);
    }
    if (service.MaChuTro !== landlordId) {
        throw new AppError('Bạn không có quyền truy cập dịch vụ này.', 403);
    }
    return service;
};


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
        },
        {
            model: ServicePriceHistory,
            as: 'priceHistories',
            where: {
                NgayApDung: { [Op.lte]: new Date() } // Op.lte = Less than or Equal to
            },
            order: [['NgayApDung', 'DESC']], // Sắp xếp để lấy ngày gần nhất
            limit: 1, // Chỉ lấy 1 bản ghi giá mới nhất và có hiệu lực
            required: false // Dùng LEFT JOIN để dịch vụ chưa có giá nào vẫn hiển thị
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
        },
        {
            model: ServicePriceHistory,
        as: 'priceHistories',
        // Thêm điều kiện where để chỉ lấy giá đã có hiệu lực
        where: {
            NgayApDung: { [Op.lte]: new Date() } // Op.lte nghĩa là "Less than or Equal to"
        },
        order: [['NgayApDung', 'DESC']], // Vẫn sắp xếp để lấy ngày gần nhất
        limit: 1,
        required: false // Dùng LEFT JOIN để dịch vụ chưa có giá vẫn hiển thị
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
        const service = await getServiceAndCheckOwnership(serviceId, landlordId);

        // Ràng buộc: Không cho sửa các trường quan trọng nếu dịch vụ đã được sử dụng
        const isCriticalFieldChanged = updateData.LoaiDichVu && updateData.LoaiDichVu !== service.LoaiDichVu;
        if (isCriticalFieldChanged) {
            const usageCount = await ContractRegisteredService.count({ where: { MaDV: serviceId } });
            if (usageCount > 0) {
                throw new AppError('Không thể sửa loại hình của dịch vụ vì đã có hợp đồng đăng ký.', 400);
            }
        }

        if (updateData.HoatDong === false) {
            const registrationCount = await ContractRegisteredService.count({ where: { MaDV: serviceId } });
            if (registrationCount > 0) {
                throw new AppError('Không thể ngừng cung cấp dịch vụ vì vẫn còn hợp đồng đang đăng ký.', 400);
            }
        }

        await service.update(updateData, { transaction: t });
        await PropertyAppliedService.destroy({ where: { MaDV: serviceId }, transaction: t });
        if (propertyIdsToApply && propertyIdsToApply.length > 0) {
            const applications = propertyIdsToApply.map(propertyId => ({ MaNhaTro: propertyId, MaDV: serviceId }));
            await PropertyAppliedService.bulkCreate(applications, { transaction: t });
        }

        await t.commit();
        return service;
    } catch (error) {
        await t.rollback();
        throw error; // Ném lỗi ra để controller bắt
    }
};
// XÓA DỊCH VỤ
const deleteServiceById = async (serviceId, landlordId) => {
    await getServiceAndCheckOwnership(serviceId, landlordId);

    // Ràng buộc: Không cho xóa nếu đã có người đăng ký hoặc sử dụng
    const registrationCount = await ContractRegisteredService.count({ where: { MaDV: serviceId } });
    if (registrationCount > 0) {
        throw new AppError(`Không thể xóa dịch vụ vì đã có ${registrationCount} hợp đồng đăng ký.`, 400);
    }
    const usageCount = await ServiceUsage.count({ where: { MaDV: serviceId } });
    if (usageCount > 0) {
        throw new AppError(`Không thể xóa dịch vụ vì đã có ${usageCount} lượt sử dụng được ghi nhận.`, 400);
    }
    
    // Nếu an toàn, tiến hành xóa (Sequelize sẽ tự xóa các liên kết trong PropertyAppliedService do có 'onDelete: CASCADE')
    await Service.destroy({ where: { MaDV: serviceId, MaChuTro: landlordId } });
};

const addPriceToService = async (serviceId, priceData, landlordId) => {
    await getServiceAndCheckOwnership(serviceId, landlordId);

    // Ràng buộc: Ngày áp dụng mới phải sau ngày áp dụng gần nhất
    const latestPrice = await ServicePriceHistory.findOne({
        where: { MaDV: serviceId },
        order: [['NgayApDung', 'DESC']]
    });

    if (latestPrice && new Date(priceData.NgayApDung) <= new Date(latestPrice.NgayApDung)) {
        throw new AppError('Ngày áp dụng mới phải sau ngày áp dụng gần nhất.', 400);
    }

    return ServicePriceHistory.create({
        MaDV: serviceId,
        DonGiaMoi: priceData.DonGiaMoi,
        NgayApDung: priceData.NgayApDung,
        MaNguoiCapNhat: landlordId,
        ThoiGianCapNhat: new Date()
    });
};

module.exports = {
    getServicesForLandlord,
    getServiceById,
  createServiceForLandlord,
  updateServiceById,
    deleteServiceById,
    addPriceToService
};