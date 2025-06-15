// file: clone nhatro/server/services/serviceusageService.ts (nếu là service JS, bỏ type)
const { ServiceUsage, Service, Contract, Occupant } = require('../models'); // Thêm Contract và Occupant
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');

/**
 * Lấy tất cả các bản ghi sử dụng dịch vụ cho một khách thuê cụ thể
 */
const getAllServiceUsagesForTenant = async (maKhachThue) => {
    // Tìm các hợp đồng có hiệu lực mà khách thuê này là người ở
    const activeContracts = await Contract.findAll({
        where: { TrangThai: 'Có hiệu lực' },
        include: [{
            model: Occupant,
            as: 'occupants',
            where: { MaKhachThue: maKhachThue },
            required: true,
            attributes: ['MaHopDong'] // Chỉ cần MaHopDong để lọc
        }],
        attributes: ['MaHopDong', 'MaPhong'] // Lấy MaHopDong và MaPhong
    });

    if (activeContracts.length === 0) {
        return []; // Không có hợp đồng hoạt động, trả về mảng rỗng
    }

    // Lấy tất cả MaHopDong và MaPhong từ các hợp đồng này
    const contractIds = activeContracts.map(c => c.MaHopDong);
    const roomIds = [...new Set(activeContracts.map(c => c.MaPhong))]; // Lấy unique MaPhong

    return ServiceUsage.findAll({
        where: {
            MaPhong: { [Op.in]: roomIds }, // Lọc theo phòng của khách thuê
            // Có thể thêm điều kiện lọc theo thời gian nếu cần
        },
        include: [
            {
                model: Service,
                as: 'service', // Đảm bảo alias là 'service' trong model ServiceUsage
                attributes: ['MaDV', 'TenDV', 'DonViTinh']
            },
            // Bạn có thể cần include Contract hoặc Occupant nếu muốn lọc sâu hơn
        ],
        order: [['NgaySuDung', 'DESC']] // Sắp xếp theo ngày sử dụng gần nhất
    });
};

module.exports = {
    // ... (các hàm khác như createServiceUsage, updateServiceUsage, deleteServiceUsage)
    getAllServiceUsagesForTenant
};