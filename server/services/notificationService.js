// file: server/services/notificationService.js
const { Op } = require('sequelize');
const { Notification, NotificationReadStatus, Tenant, Contract, Room, Property, Occupant, sequelize } = require('../models');

/**
 * Tạo thông báo. Logic mới sẽ không tạo bản ghi trong NotificationReadStatus nữa.
 */
exports.createNotification = async (senderInfo, notificationData) => {
  const { role, userId } = senderInfo;
  // Chỉ cần tạo bản ghi ThongBao chính
  const newNotification = await Notification.create({
    ...notificationData,
    LoaiNguoiGui: role,
    MaNguoiGui: userId,
  });
  return newNotification;
};

/**
 * Lấy tất cả thông báo cho một người dùng, và xác định trạng thái đã đọc.
 * (LOGIC ĐÃ ĐƯỢC VIẾT LẠI HOÀN TOÀN)
 */
exports.getNotificationsForUser = async (userInfo) => {
    const { role, userId } = userInfo;

    // Bước 1: Lấy ID của tất cả các nhà trọ/phòng mà người dùng có liên quan
    let propertyIds = [];
    let roomIds = [];
    if (role === 'Chủ trọ') {
        const properties = await Property.findAll({ where: { MaChuTro: userId }, attributes: ['MaNhaTro'] });
        propertyIds = properties.map(p => p.MaNhaTro);
    } else { // Khách thuê
        const contracts = await Contract.findAll({ 
            where: { TrangThai: 'Có hiệu lực' },
            include: [{ model: Occupant, as: 'occupants', where: { MaKhachThue: userId }, attributes: [] }]
        });
        roomIds = contracts.map(c => c.MaPhong);
    }
    
    // Bước 2: Tìm tất cả các thông báo mà người dùng này là người nhận
    const notifications = await Notification.findAll({
        where: {
            [Op.or]: [
                { MaNguoiNhan: userId, LoaiNguoiNhan: role }, // Gửi trực tiếp
                { MaPhongNhan: { [Op.in]: roomIds } }, // Gửi cho phòng của khách thuê
                { MaNhaTroNhan: { [Op.in]: propertyIds } }, // Gửi cho nhà trọ của chủ trọ
                // Thêm các điều kiện khác nếu có (ví dụ: gửi cho tất cả)
            ]
        },
        order: [['ThoiGianGui', 'DESC']]
    });

    // Bước 3: Lấy trạng thái đã đọc của các thông báo này
    const notificationIds = notifications.map(n => n.MaThongBao);
    const readStatuses = await NotificationReadStatus.findAll({
        where: {
            MaThongBao: { [Op.in]: notificationIds },
            MaNguoiDoc: userId,
            LoaiNguoiDoc: role
        }
    });

    // Chuyển readStatuses thành một Set để tra cứu nhanh hơn
    const readNotificationIds = new Set(readStatuses.map(rs => rs.MaThongBao));

    // Bước 4: Kết hợp dữ liệu
    // Trả về danh sách thông báo, kèm theo một trường 'isRead' tự tính toán
    return notifications.map(notification => ({
        ...notification.toJSON(),
        isRead: readNotificationIds.has(notification.MaThongBao)
    }));
};

/**
 * Đánh dấu một thông báo là đã đọc bằng cách tạo một bản ghi mới.
 * (LOGIC ĐÃ ĐƯỢC VIẾT LẠI HOÀN TOÀN)
 */
exports.markNotificationAsRead = async (userInfo, notificationId) => {
    const { role, userId } = userInfo;
    
    // Sử dụng findOrCreate để tránh tạo bản ghi trùng lặp nếu người dùng click nhiều lần
    const [readStatus, created] = await NotificationReadStatus.findOrCreate({
        where: {
            MaThongBao: notificationId,
            MaNguoiDoc: userId,
            LoaiNguoiDoc: role,
        },
        // defaults không cần thiết vì các cột đã có giá trị
    });

    // Trả về true nếu một bản ghi mới được tạo (tức là lần đầu đọc)
    return created;
};