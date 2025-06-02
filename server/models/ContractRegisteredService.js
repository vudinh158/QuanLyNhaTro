'use strict';
module.exports = (sequelize, DataTypes) => {
  const ContractRegisteredService = sequelize.define('ContractRegisteredService', {
    MaHopDong: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    MaDV: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    GhiChu: {
      type: DataTypes.TEXT,
    },
    NgayDangKy: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    }
  }, {
    tableName: 'HopDong_DichVuDangKy',
    timestamps: false
  });
  return ContractRegisteredService;
};