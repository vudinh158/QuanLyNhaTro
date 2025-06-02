'use strict';
module.exports = (sequelize, DataTypes) => {
  const ServiceUsage = sequelize.define('ServiceUsage', {
    MaSuDungDV: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    MaPhong: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    MaDV: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    NgaySuDung: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    SoLuong: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    DonGia: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    ThanhTien: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    MaHoaDon: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    TrangThai: {
      type: DataTypes.ENUM('Mới ghi', 'Đã tính tiền', 'Đã hủy'),
      allowNull: false,
      defaultValue: 'Mới ghi',
    },
    GhiChu: {
      type: DataTypes.TEXT,
    }
  }, {
    tableName: 'SuDungDichVu',
    timestamps: false,
    indexes: [
        { fields: ['MaHoaDon'], name: 'idx_sudungdv_hoadon' },
        { fields: ['MaPhong', 'MaDV', 'NgaySuDung'], name: 'idx_sudungdv_phong_dichvu_ngay' }
    ]
  });

  ServiceUsage.associate = function(models) {
    ServiceUsage.belongsTo(models.Room, {
      foreignKey: 'MaPhong',
      as: 'room'
    });
    ServiceUsage.belongsTo(models.Service, {
      foreignKey: 'MaDV',
      as: 'service'
    });
    ServiceUsage.belongsTo(models.Invoice, {
      foreignKey: 'MaHoaDon',
      as: 'invoice'
    });
  };
  return ServiceUsage;
};