'use strict';
module.exports = (sequelize, DataTypes) => {
  const InvoiceDetail = sequelize.define('InvoiceDetail', {
    MaChiTietHD: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    MaHoaDon: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    LoaiChiPhi: {
      type: DataTypes.ENUM('Tiền phòng', 'Tiền điện', 'Tiền nước', 'Dịch vụ cố định', 'Dịch vụ sử dụng', 'Khác'),
      allowNull: false,
    },
    MoTaChiTiet: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    MaDV_LienQuan: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    SoLuong: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 1,
    },
    DonViTinh: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    DonGia: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    ThanhTien: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    }
  }, {
    tableName: 'ChiTietHoaDon',
    timestamps: false,
    indexes: [
      {
        name: 'idx_chitiet_hoadon_mahoadon',
        fields: ['MaHoaDon']
      }
    ]
  });

  InvoiceDetail.associate = function(models) {
    InvoiceDetail.belongsTo(models.Invoice, {
      foreignKey: 'MaHoaDon',
      as: 'invoice'
    });
    InvoiceDetail.belongsTo(models.Service, {
      foreignKey: 'MaDV_LienQuan',
      as: 'service'
    });
  };

  return InvoiceDetail;
};
