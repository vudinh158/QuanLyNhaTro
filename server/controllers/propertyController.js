const propertyService = require('../services/propertyService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getMyProperties = catchAsync(async (req, res, next) => {
    if (!req.user || !req.user.landlordProfile.MaChuTro) {
        return next(new AppError('Không tìm thấy thông tin chủ trọ đã đăng nhập.', 401));
    }
    const maChuTro = req.user.landlordProfile.MaChuTro;
    const properties = await propertyService.getPropertiesByLandlordId(maChuTro);

    res.status(200).json({
        status: 'success',
        results: properties.length,
        data: {
            properties,
        },
    });
});

exports.getPropertyById = catchAsync(async (req, res, next) => {
    if (!req.user || !req.user.landlordProfile.MaChuTro) {
        return next(new AppError('Không tìm thấy thông tin chủ trọ đã đăng nhập.', 401));
    }
    const maChuTro = req.user.landlordProfile.MaChuTro;
    const propertyId = parseInt(req.params.id, 10);

    if (isNaN(propertyId)) {
        return next(new AppError('Mã nhà trọ không hợp lệ.', 400));
    }

    const property = await propertyService.getPropertyByIdAndLandlord(propertyId, maChuTro);
    res.status(200).json({
        status: 'success',
        data: {
            property,
        },
    });
});

exports.createProperty = catchAsync(async (req, res, next) => {
    if (!req.user || !req.user.landlordProfile.MaChuTro) {
        return next(new AppError('Không tìm thấy thông tin chủ trọ đã đăng nhập.', 401));
    }
    const maChuTro = req.user.landlordProfile.MaChuTro;
    const { TenNhaTro, DiaChi, GhiChu } = req.body;

    const newProperty = await propertyService.createProperty(maChuTro, { TenNhaTro, DiaChi, GhiChu });

    res.status(201).json({
        status: 'success',
        data: {
            property: newProperty,
        },
    });
});

exports.updateProperty = catchAsync(async (req, res, next) => {
    if (!req.user || !req.user.landlordProfile.MaChuTro) {
        return next(new AppError('Không tìm thấy thông tin chủ trọ đã đăng nhập.', 401));
    }
    const maChuTro = req.user.landlordProfile.MaChuTro;
    const propertyId = parseInt(req.params.id, 10);

    if (isNaN(propertyId)) {
        return next(new AppError('Mã nhà trọ không hợp lệ.', 400));
    }

    const { TenNhaTro, DiaChi, GhiChu } = req.body;
    const updateData = { TenNhaTro, DiaChi, GhiChu };

    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const updatedProperty = await propertyService.updateProperty(propertyId, maChuTro, updateData);

    res.status(200).json({
        status: 'success',
        data: {
            property: updatedProperty,
        },
    });
});

exports.deleteProperty = catchAsync(async (req, res, next) => {
    if (!req.user || !req.user.landlordProfile.MaChuTro) {
        return next(new AppError('Không tìm thấy thông tin chủ trọ đã đăng nhập.', 401));
    }
    const maChuTro = req.user.landlordProfile.MaChuTro;
    const propertyId = parseInt(req.params.id, 10);

    if (isNaN(propertyId)) {
        return next(new AppError('Mã nhà trọ không hợp lệ.', 400));
    }

    await propertyService.deleteProperty(propertyId, maChuTro);

    res.status(204).json({
        status: 'success',
        data: null,
    });
});
