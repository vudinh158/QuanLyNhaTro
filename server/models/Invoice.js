'use strict';
module.exports = (sequelize, DataTypes) => {
  const Invoice = sequelize.define('Invoice', { 
    MaHoaDon: { 
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      field: 'MaHoaDon' 
    },
    MaHopDong: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'MaHopDong' 
    },
    NgayLap: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'NgayLap'
    },
    KyThanhToan_TuNgay: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'KyThanhToan_TuNgay'
    },
    KyThanhToan_DenNgay: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'KyThanhToan_DenNgay'
    },
    TienPhong: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'TienPhong'
    },
    TongTienDien: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'TongTienDien'
    },
    TongTienNuoc: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'TongTienNuoc'
    },
    TongTienDichVu: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'TongTienDichVu'
    },
    TongTienPhaiTra: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'TongTienPhaiTra'
    },
    DaThanhToan: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'DaThanhToan'
    },
    ConLai: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'ConLai'
    },
    TrangThaiThanhToan: {
      type: DataTypes.ENUM('Chưa thanh toán', 'Đã thanh toán một phần', 'Đã thanh toán đủ', 'Quá hạn'),
      allowNull: false,
      defaultValue: 'Chưa thanh toán',
      field: 'TrangThaiThanhToan'
    },
    NgayHanThanhToan: {
      type: DataTypes.DATEONLY,
      field: 'NgayHanThanhToan'
    },
    GhiChu: {
      type: DataTypes.TEXT,
      field: 'GhiChu'
    }
  }, {
    tableName: 'HoaDon', 
    timestamps: false,
    indexes: [
      { unique: true, fields: ['MaHopDong', 'KyThanhToan_DenNgay'], name: 'idx_unique_hoadon_ky' },
      { fields: ['TrangThaiThanhToan'], name: 'idx_hoadon_trangthai' },
      { fields: ['NgayHanThanhToan'], name: 'idx_hoadon_hanthanhtoan' }
    ],
    hooks: {
        beforeValidate: (invoiceInstance, options) => { 
            if (invoiceInstance.TongTienPhaiTra && typeof invoiceInstance.DaThanhToan !== 'undefined') {
                 invoiceInstance.ConLai = parseFloat(invoiceInstance.TongTienPhaiTra) - parseFloat(invoiceInstance.DaThanhToan);
            }
        },
    }
  });

  Invoice.associate = function(models) { 
    Invoice.belongsTo(models.Contract, { 
      foreignKey: 'MaHopDong', 
      as: 'contract' 
    });
    Invoice.hasMany(models.ElectricWaterUsage, {
      foreignKey: 'MaHoaDon',
      as: 'electricWaterUsages'
    });
    Invoice.hasMany(models.ServiceUsage, {
      as: 'serviceUsages'
    });
    Invoice.hasMany(models.InvoiceDetail, { 
      as: 'details'
    });
    Invoice.hasMany(models.PaymentDetail, { 
      foreignKey: 'MaHoaDon',
      as: 'paymentDetails'
    });
  };

  return Invoice;
};