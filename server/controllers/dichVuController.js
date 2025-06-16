const { Service, Property, PropertyAppliedService, Landlord, ServicePriceHistory } = require('../models');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');
const serviceService = require('../services/serviceService');
const catchAsync = require('../utils/catchAsync');

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

exports.getService = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const landlordId = req.user.landlordProfile.MaChuTro;
    const service = await serviceService.getServiceById(id, landlordId);
    res.status(200).json({ status: 'success', data: { service } });
});

// TẠO DỊCH VỤ
exports.createService = catchAsync(async (req, res, next) => {
    const { propertyIds, ...serviceData } = req.body;
    const landlordId = req.user.landlordProfile.MaChuTro;
    const newService = await serviceService.createServiceForLandlord(serviceData, propertyIds, landlordId);
    res.status(201).json({ status: 'success', data: { service: newService } });
});

// SỬA DỊCH VỤ
exports.updateService = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const landlordId = req.user.landlordProfile.MaChuTro;
    const { propertyIds, ...serviceData } = req.body; // Tách mảng propertyIds ra

    const updatedService = await serviceService.updateServiceById(id, serviceData, propertyIds, landlordId);
    
    res.status(200).json({ status: 'success', data: { service: updatedService } });
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

exports.addPriceHistory = catchAsync(async (req, res, next) => {
    const { id } = req.params; // Lấy MaDV từ URL
    const landlordId = req.user.landlordProfile.MaChuTro;
    const newPriceRecord = await serviceService.addPriceToService(id, req.body, landlordId);

    res.status(201).json({
        status: 'success',
        data: { priceHistory: newPriceRecord }
    });
});