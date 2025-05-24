'use strict';
module.exports = (sequelize, DataTypes) => {
  const HopDong_DichVuDangKy = sequelize.define('HopDong_DichVuDangKy', {
    MaHopDong: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'HopDong',
        key: 'MaHopDong'
      }
    },
    MaDV: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'DichVu',
        key: 'MaDV'
      }
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
    timestamps: false // NgayDangKy đã được định nghĩa
  });
  return HopDong_DichVuDangKy;
};