// file: server/controllers/notificationController.js
const notificationService = require('../services/notificationService');
const catchAsync = require('../utils/catchAsync');

exports.createNotification = catchAsync(async (req, res, next) => {
  // Lấy thông tin người gửi từ req.user (do middleware protect thêm vào)
  const senderInfo = {
    role: req.user.role.TenVaiTro,
    userId: req.user.role.TenVaiTro === 'Chủ trọ' ? req.user.landlordProfile.MaChuTro : req.user.tenantProfile.MaKhachThue,
    getProperties: () => req.user.landlordProfile.getProperties(), // Ví dụ
  };

  const notification = await notificationService.createNotification(senderInfo, req.body);
  res.status(201).json({ status: 'success', data: { notification } });
});

exports.getMyNotifications = catchAsync(async (req, res, next) => {
    console.log(req.user);
  const userInfo = {
    role: req.user.role.TenVaiTro,
    userId: req.user.role.TenVaiTro === 'Chủ trọ' ? req.user.landlordProfile.MaChuTro : req.user.tenantProfile.MaKhachThue,
  };

  const notifications = await notificationService.getNotificationsForUser(userInfo);
  res.status(200).json({ status: 'success', results: notifications.length, data: { notifications } });
});

exports.markAsRead = catchAsync(async (req, res, next) => {
  const userInfo = {
    role: req.user.role.TenVaiTro,
    userId: req.user.role.TenVaiTro === 'Chủ trọ' ? req.user.landlordProfile.MaChuTro : req.user.tenantProfile.MaKhachThue,
  };
  
  const success = await notificationService.markNotificationAsRead(userInfo, req.params.id);
  res.status(200).json({ status: 'success', data: { success } });
});