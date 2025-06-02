'use strict';
module.exports = (sequelize, DataTypes) => {
  const ElectricWaterUsage = sequelize.define('ElectricWaterUsage', {
    MaDienNuoc: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    MaPhong: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    Loai: {
      type: DataTypes.ENUM('Điện', 'Nước'),
      allowNull: false,
    },
    ChiSoDau: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ChiSoCuoi: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    SoLuongTieuThu: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    DonGia: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    ThanhTien: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    NgayGhi: {
      type: DataTypes.DATEONLY,
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
    tableName: 'DienNuoc',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['MaHoaDon', 'Loai', 'NgayGhi'], 
        name: 'idx_unique_diennuoc_hoadon_loai_ngayghi'
      },
      { fields: ['MaPhong', 'Loai'], name: 'idx_diennuoc_phong_loai' }
    ]
  });

  ElectricWaterUsage.associate = function(models) {
    ElectricWaterUsage.belongsTo(models.Room, {
      foreignKey: 'MaPhong',
      as: 'room'
    });
    ElectricWaterUsage.belongsTo(models.Invoice, {
      foreignKey: 'MaHoaDon',
      as: 'invoice'
    });
  };
  return ElectricWaterUsage;
};