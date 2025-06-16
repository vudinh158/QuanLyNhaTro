// clone nhatro/server/services/servicePriceHistoryService.js
const { Op } = require('sequelize');
const { ServicePriceHistory, Service, Invoice } = require('../models');
const AppError = require('../utils/AppError');

// Hàm kiểm tra quyền và lấy bản ghi giá
const getPriceRecordAndCheckOwnership = async (priceHistoryId, landlordId) => {
    const priceRecord = await ServicePriceHistory.findByPk(priceHistoryId, {
        include: { model: Service, as: 'service', attributes: ['MaChuTro'] }
    });
    if (!priceRecord) throw new AppError('Không tìm thấy bản ghi giá.', 404);
    if (priceRecord.service.MaChuTro !== landlordId) throw new AppError('Bạn không có quyền truy cập.', 403);
    return priceRecord;
};

// Hàm kiểm tra xem giá đã được dùng trong hóa đơn chưa
const checkInvoiceUsage = async (priceRecord) => {
    const existingInvoice = await Invoice.findOne({
        include: [{
            model: Room, as: 'room', required: true,
            include: [{ model: Property, as: 'property', where: {MaNhaTro: priceRecord.service.property.MaNhaTro} }]
        }],
        where: {
            NgayBatDauKy: { [Op.lte]: priceRecord.NgayApDung },
            NgayKetThucKy: { [Op.gte]: priceRecord.NgayApDung },
        }
    });
    if (existingInvoice) {
        throw new AppError('Không thể sửa/xóa giá này vì đã được sử dụng trong một kỳ đã xuất hóa đơn.', 400);
    }
};

// SỬA MỘT MỐC GIÁ
exports.updatePriceHistoryRecord = async (priceHistoryId, updateData, landlordId) => {
    const priceRecord = await getPriceRecordAndCheckOwnership(priceHistoryId, landlordId);
    await checkInvoiceUsage(priceRecord);
    await priceRecord.update(updateData);
    return priceRecord;
};

// XÓA MỘT MỐC GIÁ
exports.deletePriceHistoryRecord = async (priceHistoryId, landlordId) => {
    const priceRecord = await getPriceRecordAndCheckOwnership(priceHistoryId, landlordId);
    await checkInvoiceUsage(priceRecord);
    await priceRecord.destroy();
};