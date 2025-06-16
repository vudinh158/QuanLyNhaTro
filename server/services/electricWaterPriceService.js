// clone nhatro/server/services/electricWaterPriceService.js
const { Op } = require('sequelize');
const { ElectricWaterPriceHistory, Property, Invoice } = require('../models');
const AppError = require('../utils/AppError');

/**
 * Xóa một bản ghi lịch sử giá điện/nước một cách an toàn
 * @param {number} priceHistoryId - ID của bản ghi giá cần xóa
 * @param {number} maChuTro - ID của chủ trọ để xác thực quyền sở hữu
 */
const deleteElectricWaterPriceById = async (priceHistoryId, maChuTro) => {
  // 1. Tìm bản ghi giá cần xóa, kèm theo thông tin nhà trọ để kiểm tra quyền
  const priceRecord = await ElectricWaterPriceHistory.findByPk(priceHistoryId, {
    include: {
      model: Property,
      as: 'property',
      attributes: ['MaChuTro', 'MaNhaTro'],
    },
  });

  if (!priceRecord) {
    throw new AppError(`Không tìm thấy bản ghi giá với ID ${priceHistoryId}.`, 404);
  }

  // 2. Xác thực quyền sở hữu
  if (priceRecord.property.MaChuTro !== maChuTro) {
    throw new AppError('Bạn không có quyền thực hiện hành động này.', 403);
  }

  // 3. Kiểm tra xem có hóa đơn nào đã được tạo cho kỳ chứa ngày áp dụng của giá này không.
  const existingInvoice = await Invoice.findOne({
    where: {
      MaNhaTro: priceRecord.property.MaNhaTro,
      NgayBatDauKy: { [Op.lte]: priceRecord.NgayApDung }, // Ngày áp dụng >= Ngày bắt đầu kỳ
      NgayKetThucKy: { [Op.gte]: priceRecord.NgayApDung }, // Ngày áp dụng <= Ngày kết thúc kỳ
    },
  });

  if (existingInvoice) {
    throw new AppError(
      'Không thể xóa giá này vì nó thuộc về một kỳ đã được xuất hóa đơn.',
      400
    );
  }

  // 4. Nếu tất cả kiểm tra đều qua, tiến hành xóa
  await priceRecord.destroy();
};

module.exports = {
  deleteElectricWaterPriceById,
};