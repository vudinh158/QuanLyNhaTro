const roomService = require('../services/roomService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getRoomsByProperty = catchAsync(async (req, res, next) => {
    const maNhaTro = parseInt(req.params.propertyId, 10);
    if (isNaN(maNhaTro)) {
        return next(new AppError('Mã nhà trọ không hợp lệ.', 400));
    }
    if (!req.user || !req.user.landlordProfile.MaChuTro) {
        return next(new AppError('Không tìm thấy thông tin chủ trọ.', 401));
    }
    const maChuTro = req.user.landlordProfile.MaChuTro;
    const rooms = await roomService.getRoomsByPropertyIdForLandlord(maNhaTro, maChuTro);
    res.status(200).json({
        status: 'success',
        results: rooms.length,
        data: { rooms },
    });
});

exports.getAllRooms = catchAsync(async (req, res, next) => {
    if (!req.user || !req.user.landlordProfile.MaChuTro) {
        return next(new AppError('Không tìm thấy thông tin chủ trọ.', 401));
    }
    const maChuTro = req.user.landlordProfile.MaChuTro;
    const rooms = await roomService.getAllRoomsForLandlord(maChuTro);
    res.status(200).json({
        status: 'success',
        results: rooms.length,
        data: { rooms },
    });
});


exports.getRoomById = catchAsync(async (req, res, next) => {
    const maPhong = parseInt(req.params.id, 10);
    if (isNaN(maPhong)) {
        return next(new AppError('Mã phòng không hợp lệ.', 400));
    }
    if (!req.user || !req.user.landlordProfile.MaChuTro) {
        return next(new AppError('Không tìm thấy thông tin chủ trọ.', 401));
    }
    const maChuTro = req.user.landlordProfile.MaChuTro;
    const room = await roomService.getRoomDetailsByIdForLandlord(maPhong, maChuTro);
    res.status(200).json({
        status: 'success',
        data: { room },
    });
});

exports.createRoom = catchAsync(async (req, res, next) => {
    if (!req.user || !req.user.landlordProfile.MaChuTro) {
        return next(new AppError('Không tìm thấy thông tin chủ trọ.', 401));
    }
    const maChuTro = req.user.landlordProfile.MaChuTro;
    const newRoom = await roomService.createRoom(maChuTro, req.body);
    res.status(201).json({
        status: 'success',
        data: { room: newRoom },
    });
});

exports.updateRoom = catchAsync(async (req, res, next) => {
    const maPhong = parseInt(req.params.id, 10);
    if (isNaN(maPhong)) {
        return next(new AppError('Mã phòng không hợp lệ.', 400));
    }
    if (!req.user || !req.user.landlordProfile.MaChuTro) {
        return next(new AppError('Không tìm thấy thông tin chủ trọ.', 401));
    }
    const maChuTro = req.user.landlordProfile.MaChuTro;
    const updatedRoom = await roomService.updateRoom(maPhong, maChuTro, req.body);
    res.status(200).json({
        status: 'success',
        data: { room: updatedRoom },
    });
});

exports.deleteRoom = catchAsync(async (req, res, next) => {
    const maPhong = parseInt(req.params.id, 10);
    if (isNaN(maPhong)) {
        return next(new AppError('Mã phòng không hợp lệ.', 400));
    }
    if (!req.user || !req.user.landlordProfile.MaChuTro) {
        return next(new AppError('Không tìm thấy thông tin chủ trọ.', 401));
    }
    const maChuTro = req.user.landlordProfile.MaChuTro;
    await roomService.deleteRoom(maPhong, maChuTro);
    res.status(204).json({
        status: 'success',
        data: null,
    });
});

exports.getAllRoomTypes = catchAsync(async (req, res, next) => {
        const roomTypes = await roomService.getAllRoomTypes();
        res.status(200).json({
                status: 'success',
                results: roomTypes.length,
                data: {
                        roomTypes
                }
        });
});

exports.getAvailableRooms = catchAsync(async (req, res, next) => {
        if (!req.user || !req.user.landlordProfile.MaChuTro) {
            return next(new AppError('Không tìm thấy thông tin chủ trọ.', 401));
        }
        const rooms = await roomService.getAvailableRoomsForContract(req.user.landlordProfile.MaChuTro);
        res.status(200).json({
            status: 'success',
            results: rooms.length,
            data: { rooms },
        });
});