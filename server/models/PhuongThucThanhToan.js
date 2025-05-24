'use strict';
module.exports = (sequelize, DataTypes) => {
  const PhuongThucThanhToan = sequelize.define('PhuongThucThanhToan', {
    MaPTTT: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    TenPTTT: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    MoTa: {
      type: DataTypes.STRING(255),
    },
    HoatDong: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    }
  }, {
    tableName: 'PhuongThucThanhToan',
    timestamps: false
  });

  PhuongThucThanhToan.associate = function(models) {
    PhuongThucThanhToan.hasMany(models.ChiTietThanhToan, {
      foreignKey: 'MaPTTT',
      as: 'chiTietThanhToans'
    });
  };

  return PhuongThucThanhToan;
};