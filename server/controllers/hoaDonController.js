const { Invoice, Contract, Room, Property, Occupant, Tenant, InvoiceDetail, Service, PaymentDetail, PaymentMethod } = require('../models');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');

exports.createHoaDon = async (req, res, next) => {
  try {
    const { MaHopDong, KyThanhToan_TuNgay, KyThanhToan_DenNgay, NgayLap, TongTien } = req.body;

    const hopDong = await Contract.findByPk(MaHopDong);
    if (!hopDong) throw new AppError('Không tìm thấy hợp đồng', 404);

    const hoaDon = await Invoice.create({
      MaHopDong,
      KyThanhToan_TuNgay,
      KyThanhToan_DenNgay,
      NgayLap,
      TongTien,
    });

    res.status(201).json({ status: 'success', data: hoaDon });
  } catch (error) {
    next(error);
  }
};

exports.getAllHoaDon = async (req, res, next) => {
  try {
    let whereClause = {};

    // Sửa lỗi truy cập thông tin user
    if (req.user.role.TenVaiTro === 'Chủ trọ') {
        whereClause['$contract.room.property.MaChuTro$'] = req.user.landlordProfile.MaChuTro;
      } else if (req.user.role.TenVaiTro === 'Khách thuê') {
        // Logic để lọc hóa đơn cho khách thuê
        // Cần đảm bảo req.user.tenantProfile.MaKhachThue tồn tại và đã được load bởi authMiddleware
        if (req.user.tenantProfile && req.user.tenantProfile.MaKhachThue) {
            // Lọc theo MaKhachThue trong Occupant của Contract
            whereClause['$contract.occupants.MaKhachThue$'] = req.user.tenantProfile.MaKhachThue;
        } else {
            return next(new AppError('Thông tin khách thuê không hợp lệ.', 400));
        }
      }

    const hoaDons = await Invoice.findAll({
      where: whereClause,
      include: [
        {
          model: Contract,
          as: 'contract',
          include: [
            {
              model: Room,
              as: 'room',
              include: {
                model: Property,
                as: 'property',
              }
            },
            {
              model: Occupant,
              as: 'occupants', // Dùng đúng alias 'occupants'
              include: [{
                model: Tenant, // Bây giờ "Tenant" đã được import và hợp lệ
                as: 'tenant',
                attributes: ['HoTen']
              }]
            }
          ]
        }
      ],
      order: [['NgayLap', 'DESC']]
    });

    // Sửa lỗi cấu trúc data trả về
    res.status(200).json({ 
        status: 'success', 
        results: hoaDons.length, 
        data: { hoaDons } 
    });
  } catch (error) {
    next(error);
  }
};

exports.getHoaDon = async (req, res, next) => {
    try {
      const { id } = req.params;
  
      const hoaDon = await Invoice.findByPk(id, {
        include: [
          {
            model: Contract,
            as: 'contract',
            include: [
              {
                model: Room,
                as: 'room',
                include: {
                  model: Property,
                  as: 'property',
                }
              },
              {
                model: Occupant,
                as: 'occupants',
                // Cần include Tenant để lấy thông tin người đại diện (HoTen)
                include: [{
                  model: Tenant,
                  as: 'tenant',
                  attributes: ['MaKhachThue', 'HoTen', 'SoDienThoai', 'CCCD', 'NgaySinh', 'GioiTinh', 'Email', 'QueQuan'] // Thêm các thuộc tính cần thiết của Tenant
                }]
              }
            ]
          },
          {
              model: InvoiceDetail,
              as: 'details',
              attributes: [
                'MaChiTietHD',
                'MaHoaDon',
                'LoaiChiPhi',
                'MoTaChiTiet',
                'MaDV_LienQuan',
                'SoLuong',
                'DonViTinh',
                'DonGia',
                'ThanhTien'
              ],
              // Bạn có thể cần include Service nếu 'MoTaChiTiet' phụ thuộc vào tên dịch vụ
              include: {
                model: Service,
                as: 'service', // Đảm bảo alias 'service' khớp với association trong InvoiceDetail model
                attributes: ['MaDV', 'TenDV', 'DonViTinh']
              }
          },
          { // THÊM ĐOẠN NÀY để include PaymentDetail và PaymentMethod
              model: PaymentDetail,
              as: 'paymentDetails', // Đảm bảo alias này khớp với association trong Invoice model
              include: [{
                  model: PaymentMethod,
                  as: 'paymentMethod', // Đảm bảo alias này khớp với association trong PaymentDetail model
                  attributes: ['MaPTTT', 'TenPTTT']
              }]
          }
        ]
      });
  
      if (!hoaDon) throw new AppError('Không tìm thấy hóa đơn', 404);
  
    //   console.log('User Role:', req.user.role.TenVaiTro);
    //   console.log('User MaChuTro:', req.user.landlordProfile.MaChuTro);
    //   console.log('Invoice Property MaChuTro:', hoaDon.contract?.room?.property?.MaChuTro);
  
      if (
          req.user.role.TenVaiTro === 'Chủ trọ' &&
          hoaDon.contract?.room?.property?.MaChuTro !== req.user.landlordProfile.MaChuTro
      ) {
        throw new AppError('Bạn không có quyền truy cập hóa đơn này', 403);
      }
  
      res.status(200).json({ status: 'success', data: hoaDon });
    } catch (error) {
      next(error);
    }
  };