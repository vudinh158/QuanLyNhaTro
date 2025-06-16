'use strict';
module.exports = (sequelize, DataTypes) => {
  const Landlord = sequelize.define('Landlord', {
    MaChuTro: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    MaTK: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    HoTen: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    CCCD: {
      type: DataTypes.STRING(20),
      unique: true,
    },
    SoDienThoai: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: true,
    },
    NgaySinh: {
      type: DataTypes.DATEONLY,
    },
    GioiTinh: {
      type: DataTypes.ENUM('Nam', 'Nữ', 'Khác'),
    },
    Email: {
      type: DataTypes.STRING(100),
      unique: true,
      validate: {
        isEmail: true,
      }
    }
  }, {
    tableName: 'ChuTro',
    timestamps: false
  });

  Landlord.associate = function(models) {
    Landlord.belongsTo(models.UserAccount, {
      foreignKey: 'MaTK',
      as: 'userAccount'
    });
    Landlord.hasMany(models.Property, { 
      foreignKey: 'MaChuTro',
      as: 'properties'
    });
    Landlord.hasMany(models.ElectricWaterPriceHistory, {
        foreignKey: 'MaNguoiCapNhat',
        as: 'electricWaterPriceUpdates'
    });
    Landlord.hasMany(models.ServicePriceHistory, {
        foreignKey: 'MaNguoiCapNhat',
        as: 'servicePriceUpdates'
    });
    Landlord.hasMany(models.PaymentDetail, {
        foreignKey: 'MaNguoiNhan',
        as: 'receivedPayments'
    });
    Landlord.hasMany(models.Service, {
        foreignKey: 'MaChuTro',
        as: 'services'
    });
  };
  return Landlord;
};