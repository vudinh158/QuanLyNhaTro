'use strict';
module.exports = (sequelize, DataTypes) => {
  const ServicePriceHistory = sequelize.define('ServicePriceHistory', {
    MaLichSuDV: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    MaDV: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    DonGiaMoi: {
      type: DataTypes.DECIMAL(12, 2),
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
    tableName: 'LichSuGiaDichVu',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['MaDV', 'NgayApDung'],
        name: 'idx_unique_gia_dichvu_apdung'
      }
    ]
  });

  ServicePriceHistory.associate = function(models) {
    ServicePriceHistory.belongsTo(models.Service, {
      foreignKey: 'MaDV',
      as: 'service'
    });
    ServicePriceHistory.belongsTo(models.Landlord, {
      foreignKey: 'MaNguoiCapNhat',
      as: 'updatedBy'
    });
  };
  return ServicePriceHistory;
};