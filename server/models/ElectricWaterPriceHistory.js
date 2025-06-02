'use strict';
module.exports = (sequelize, DataTypes) => {
  const ElectricWaterPriceHistory = sequelize.define('ElectricWaterPriceHistory', {
    MaLichSuDN: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    MaNhaTro: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    Loai: {
      type: DataTypes.ENUM('Điện', 'Nước'),
      allowNull: false,
    },
    DonGiaMoi: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    NgayApDung: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    MaNguoiCapNhat: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ThoiGianCapNhat: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    }
  }, {
    tableName: 'LichSuGiaDienNuoc',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['MaNhaTro', 'Loai', 'NgayApDung'],
        name: 'idx_unique_gia_diennuoc_apdung'
      }
    ]
  });

  ElectricWaterPriceHistory.associate = function(models) {
    ElectricWaterPriceHistory.belongsTo(models.Property, {
      foreignKey: 'MaNhaTro',
      as: 'property'
    });
    ElectricWaterPriceHistory.belongsTo(models.Landlord, {
      foreignKey: 'MaNguoiCapNhat',
      as: 'updatedBy'
    });
  };
  return ElectricWaterPriceHistory;
};