// file: server/services/dashboardService.js
const { Op, fn, col } = require('sequelize');
const { Property, Room, Tenant, Contract, Invoice, Occupant, Notification, NotificationReadStatus } = require('../models');
const { startOfMonth, endOfMonth, format, addDays } = require('date-fns');

/**
 * Lấy dữ liệu tổng quan cho dashboard của một chủ trọ.
 * @param {number} maChuTro ID của chủ trọ
 * @returns {Promise<object>} Dữ liệu tổng quan
 */
exports.getLandlordDashboardSummary = async (maChuTro) => {
    // Lấy danh sách các nhà trọ của chủ trọ này
    const properties = await Property.findAll({
        where: { MaChuTro: maChuTro },
        attributes: ['MaNhaTro']
    });
    const propertyIds = properties.map(p => p.MaNhaTro);

    if (propertyIds.length === 0) {
        // Nếu chủ trọ chưa có nhà trọ nào
        return {
            propertyCount: 0,
            roomSummary: { total: 0, occupied: 0, vacant: 0 },
            tenantCount: 0,
            monthlyRevenue: { total: 0, paid: 0, unpaid: 0 },
        };
    }

    // Sử dụng Promise.all để thực hiện các truy vấn song song, tăng hiệu suất
    const [propertyCount, roomSummary, tenantCount, monthlyRevenue, expiringContracts, unpaidInvoices ] = await Promise.all([
        // 1. Đếm tổng số nhà trọ
        Property.count({ where: { MaChuTro: maChuTro } }),

        // 2. Thống kê phòng
        Room.findAll({
            where: { MaNhaTro: { [Op.in]: propertyIds } },
            attributes: [
                'TrangThai',
                [fn('COUNT', col('MaPhong')), 'count']
            ],
            group: ['TrangThai']
        }),

        // 3. Đếm số khách thuê đang hoạt động
        Occupant.count({
            distinct: true,
            col: 'MaKhachThue',
            include: [
                {
                    model: Tenant,
                    as: 'tenant',
                    attributes: [],
                    required: true,
                    where: { TrangThai: 'Hoạt động' }
                },
                {
                    model: Contract,
                    as: 'contract',
                    attributes: [],
                    required: true,
                    where: { TrangThai: 'Có hiệu lực' },
                    include: [{
                        model: Room,
                        as: 'room',
                        attributes: [],
                        required: true,
                        where: { MaNhaTro: { [Op.in]: propertyIds } }
                    }]
                }
            ]
        }),

        // 4. Thống kê doanh thu trong tháng hiện tại (ĐÃ SỬA LỖI)
        Invoice.findAll({
            attributes: [
                'TrangThaiThanhToan',
                [fn('SUM', col('TongTienPhaiTra')), 'totalAmount']
            ],
            // Thêm 'include' để JOIN các bảng và lọc theo MaNhaTro
            include: [{
                model: Contract,
                as: 'contract',
                attributes: [], // không cần lấy trường nào từ Contract
                required: true, // INNER JOIN
                include: [{
                    model: Room,
                    as: 'room',
                    attributes: [], // không cần lấy trường nào từ Room
                    required: true, // INNER JOIN
                    where: {
                        MaNhaTro: { [Op.in]: propertyIds } // Lọc MaNhaTro ở đây
                    }
                }]
            }],
            where: {
                // Sửa lại điều kiện ngày, dùng 'KyThanhToan_DenNgay'
                KyThanhToan_DenNgay: {
                    [Op.between]: [
                        startOfMonth(new Date()), // date-fns trả về object Date, Sequelize xử lý được
                        endOfMonth(new Date())
                    ]
                }
            },
            group: ['TrangThaiThanhToan']
        }),

        // 5. Lấy 5 hợp đồng sắp hết hạn trong 30 ngày tới
        Contract.findAll({
            where: {
                TrangThai: 'Có hiệu lực',
                NgayKetThuc: {
                    [Op.between]: [new Date(), addDays(new Date(), 30)]
                }
            },
            include: [
                {
                    model: Room, as: 'room', attributes: ['TenPhong'], required: true,
                    where: { MaNhaTro: { [Op.in]: propertyIds } }
                },
                {
                    model: Occupant, as: 'occupants', attributes: ['MaKhachThue'], where: { LaNguoiDaiDien: true },
                    include: [{ model: Tenant, as: 'tenant', attributes: ['HoTen']}]
                }
            ],
            order: [['NgayKetThuc', 'ASC']],
            limit: 5
        }),

        // 6. Lấy 5 hóa đơn chưa thanh toán gần nhất
        Invoice.findAll({
            where: {
                // Chỉ giữ lại điều kiện lọc theo trạng thái thanh toán ở đây
                TrangThaiThanhToan: { [Op.in]: ['Chưa thanh toán', 'Quá hạn'] }
            },
            include: [
                { 
                    model: Contract, 
                    as: 'contract', 
                    attributes: ['MaHopDong'],
                    required: true, // INNER JOIN để đảm bảo hóa đơn luôn có hợp đồng hợp lệ
                    include: [
                        {
                            model: Room,
                            as: 'room',
                            attributes: ['TenPhong'],
                            required: true,
                            // --- BẮT ĐẦU PHẦN SỬA LỖI ---
                            // Chuyển điều kiện lọc theo nhà trọ vào đây
                            where: { 
                                MaNhaTro: { [Op.in]: propertyIds }
                            }
                        },
                        { // Lấy thông tin người thuê từ Contract
                            model: Occupant, 
                            as: 'occupants', 
                            where: { LaNguoiDaiDien: true },
                            required: true,
                            include: [{ model: Tenant, as: 'tenant', attributes: ['HoTen'] }]
                        }
                    ]
                }
            ],
            order: [['NgayHanThanhToan', 'ASC']],
            limit: 5
        })
    ]);

    // Xử lý dữ liệu thống kê phòng
    const processedRoomSummary = { total: 0, occupied: 0, vacant: 0 };
    roomSummary.forEach(item => {
        const status = item.get('TrangThai');
        const count = item.get('count');
        processedRoomSummary.total += count;
        if (status === 'Đang thuê') processedRoomSummary.occupied = count;
        if (status === 'Còn trống') processedRoomSummary.vacant = count;
    });

    // Xử lý dữ liệu doanh thu (ĐÃ SỬA LỖI)
    const processedRevenue = { total: 0, paid: 0, unpaid: 0 };
    monthlyRevenue.forEach(item => {
        const status = item.get('TrangThaiThanhToan');
        // Xử lý trường hợp SUM trả về null bằng cách cho giá trị mặc định là 0
        const amount = parseFloat(item.get('totalAmount')) || 0;
        processedRevenue.total += amount;
        if (status === 'Đã thanh toán') {
            processedRevenue.paid += amount;
        } else if (status === 'Chưa thanh toán' || status === 'Quá hạn') {
            processedRevenue.unpaid += amount;
        }
    });

    return {
        propertyCount,
        roomSummary: processedRoomSummary,
        tenantCount,
        monthlyRevenue: processedRevenue,
        expiringContracts,
        unpaidInvoices, 
    };
};

exports.getTenantDashboardSummary = async (maKhachThue) => {
    // Tìm hợp đồng đang hoạt động của khách thuê này
    const activeContract = await Contract.findOne({
        where: { TrangThai: 'Có hiệu lực' },
        include: [
            { model: Room, as: 'room', include: [{ model: Property, as: 'property' }] },
            { model: Occupant, as: 'occupants', where: { MaKhachThue: maKhachThue }, required: true }
        ]
    });
    
    let nextUnpaidInvoice = null;
    let recentNotifications = [];

    // Nếu có hợp đồng, mới đi tìm hóa đơn và thông báo liên quan
    if (activeContract) {
        [nextUnpaidInvoice, recentNotifications] = await Promise.all([
            // Tìm hóa đơn chưa thanh toán của hợp đồng này
            Invoice.findOne({
                where: {
                    MaHopDong: activeContract.MaHopDong,
                    TrangThaiThanhToan: { [Op.in]: ['Chưa thanh toán', 'Quá hạn'] }
                },
                order: [['NgayHanThanhToan', 'ASC']]
            }),

            // Lấy 3 thông báo gần đây nhất
            Notification.findAll({
                where: { // Logic tìm thông báo cho khách thuê
                    [Op.or]: [
                        { MaNguoiNhan: maKhachThue, LoaiNguoiNhan: 'Khách thuê' },
                        { MaPhongNhan: activeContract.MaPhong }
                    ]
                },
                order: [['ThoiGianGui', 'DESC']],
                limit: 3
            })
        ]);
    }

    return {
        activeContract,
        nextUnpaidInvoice,
        recentNotifications,
    };
};