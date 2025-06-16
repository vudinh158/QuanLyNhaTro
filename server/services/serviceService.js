// clone nhatro/server/services/serviceService.js
const { Op } = require('sequelize');
const { Service, Property, PropertyAppliedService, ContractRegisteredService, ServiceUsage } = require('../models');
const AppError = require('../utils/AppError');

const getServicesForLandlord = async (landlordId) => {
    // Bước 1: Lấy danh sách ID các nhà trọ thuộc sở hữu của chủ trọ này
    const properties = await Property.findAll({
      where: { MaChuTro: landlordId },
      attributes: ['MaNhaTro'],
    });
    const propertyIds = properties.map(p => p.MaNhaTro);
  
    // Nếu chủ trọ không có nhà trọ nào, họ sẽ không sở hữu dịch vụ nào cả (theo logic mới)
    if (propertyIds.length === 0) {
        // Họ cũng không thể thấy dịch vụ chung nào vì không có nhà trọ để áp dụng
        return [];
    }
  
    // Bước 2: Lấy danh sách ID của các "Dịch vụ Chung" đã được áp dụng cho các nhà trọ trên
    const appliedServices = await PropertyAppliedService.findAll({
      where: { MaNhaTro: { [Op.in]: propertyIds } },
      attributes: ['MaDV'],
    });
    const appliedServiceIds = appliedServices.map(as => as.MaDV);
  
    // Bước 3: Truy vấn tất cả dịch vụ thỏa mãn điều kiện sở hữu
    const services = await Service.findAll({
      where: {
        [Op.or]: [
          // Điều kiện 1: Là "Dịch vụ Riêng" của một trong các nhà trọ họ sở hữu
          { MaNhaTro: { [Op.in]: propertyIds } },
          // Điều kiện 2: Là "Dịch vụ Chung" VÀ có trong danh sách đã được áp dụng
          {
            [Op.and]: [
              { MaNhaTro: null },
              { MaDV: { [Op.in]: appliedServiceIds } }
            ]
          }
        ]
      },
      order: [['TenDV', 'ASC']],
    });
  
    return services;
  };

// === HÀM KIỂM TRA QUYỀN SỞ HỮU (TỪ LẦN TRƯỚC) ===
const getServiceAndCheckOwnership = async (serviceId, landlordId) => {
    const service = await Service.findByPk(serviceId);
    if (!service) {
        throw new AppError(`Không tìm thấy dịch vụ với ID ${serviceId}.`, 404);
    }

    // Dịch vụ riêng
    if (service.MaNhaTro) {
        const property = await Property.findOne({ where: { MaNhaTro: service.MaNhaTro, MaChuTro: landlordId } });
        if (!property) throw new AppError('Bạn không có quyền truy cập dịch vụ này.', 403);
    }
    // Dịch vụ chung: chỉ cần tồn tại là được, quyền sửa/xóa sẽ kiểm tra sau
    
    return service;
};

// === HÀM TẠO DỊCH VỤ (CÀI ĐẶT PHƯƠNG ÁN 2) ===
const createServiceForLandlord = async (serviceData, landlordId) => {
    // Nếu là dịch vụ chung (MaNhaTro là null), kiểm tra xem chủ trọ có nhà trọ nào không
    if (!serviceData.MaNhaTro) {
        const propertyCount = await Property.count({ where: { MaChuTro: landlordId } });
        if (propertyCount === 0) {
            throw new AppError('Bạn cần tạo ít nhất một nhà trọ trước khi có thể tạo dịch vụ chung.', 400);
        }
    }
    
    // Nếu là dịch vụ riêng, kiểm tra xem nhà trọ đó có thuộc sở hữu không
    if(serviceData.MaNhaTro) {
        const property = await Property.findOne({ where: { MaNhaTro: serviceData.MaNhaTro, MaChuTro: landlordId }});
        if (!property) {
            throw new AppError('Bạn không có quyền tạo dịch vụ riêng cho nhà trọ này.', 403);
        }
    }
    
    const newService = await Service.create(serviceData);
    return newService;
};

const updateServiceById = async (serviceId, updateData, landlordId) => {
    const service = await getServiceAndCheckOwnership(serviceId, landlordId);

    // Kiểm tra xem các trường quan trọng có bị thay đổi không
    const isCriticalFieldChanged = updateData.LoaiDichVu && updateData.LoaiDichVu !== service.LoaiDichVu;
    // Kiểm tra xem có thay đổi đơn vị tính không
    const isUnitChanged = updateData.DonViTinh && updateData.DonViTinh !== service.DonViTinh;
    if (isCriticalFieldChanged || isUnitChanged) {
        const registrationCount = await ContractRegisteredService.count({ where: { MaDV: serviceId } });
        const usageCount = await ServiceUsage.count({ where: { MaDV: serviceId } });

        if (registrationCount > 0 || usageCount > 0) {
            throw new AppError('Không thể sửa thuộc tính cơ bản của dịch vụ vì đã có người đăng ký hoặc sử dụng.', 400);
        }
    }

    await service.update(updateData);
    return service;
};

const deleteServiceById = async (serviceId, landlordId) => {
    const service = await getServiceAndCheckOwnership(serviceId, landlordId);
    
    const registrationCount = await ContractRegisteredService.count({ where: { MaDV: serviceId } });
    if (registrationCount > 0) {
        throw new AppError(`Không thể xóa dịch vụ vì đã có ${registrationCount} hợp đồng đăng ký.`, 400);
    }
    
    const usageCount = await ServiceUsage.count({ where: { MaDV: serviceId } });
    if (usageCount > 0) {
        throw new AppError(`Không thể xóa dịch vụ vì đã có ${usageCount} lượt sử dụng được ghi nhận.`, 400);
    }

    await service.destroy();
};


module.exports = {
    getServicesForLandlord,
  createServiceForLandlord,
  updateServiceById,
  deleteServiceById,
};