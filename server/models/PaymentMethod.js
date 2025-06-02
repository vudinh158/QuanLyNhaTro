'use strict';
module.exports = (sequelize, DataTypes) => {
  const PaymentMethod = sequelize.define('PaymentMethod', {
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

  PaymentMethod.associate = function(models) {
    PaymentMethod.hasMany(models.PaymentDetail, {
      foreignKey: 'MaPTTT',
      as: 'paymentDetails'
    });
  };
  return PaymentMethod;
};