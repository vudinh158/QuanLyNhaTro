'use strict';
module.exports = (sequelize, DataTypes) => {
  const Property = sequelize.define('Property', {
    MaNhaTro: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    MaChuTro: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    TenNhaTro: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    DiaChi: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    GhiChu: {
      type: DataTypes.TEXT,
    }
  }, {
    tableName: 'NhaTro',
    timestamps: false
  });

  Property.associate = function(models) {
    Property.belongsTo(models.Landlord, {
      foreignKey: 'MaChuTro',
      as: 'landlord'
    });
    Property.hasMany(models.Room, {
      foreignKey: 'MaNhaTro',
      as: 'rooms'
    });
    Property.hasMany(models.RoomType, { 
        foreignKey: 'MaNhaTro',
        as: 'roomTypes'
      });
    Property.hasMany(models.ElectricWaterPriceHistory, {
      foreignKey: 'MaNhaTro',
      as: 'electricWaterPriceHistories'
    });
    Property.hasMany(models.Service, { // Dịch vụ riêng của nhà trọ
      foreignKey: 'MaNhaTro',
      as: 'specificServices'
    });
    Property.belongsToMany(models.Service, { // Các dịch vụ áp dụng chung cho nhà trọ
        through: models.PropertyAppliedService,
        foreignKey: 'MaNhaTro',
        otherKey: 'MaDV',
        as: 'appliedServices'
    });
     Property.hasMany(models.Notification, { // Thông báo gửi cho cả nhà trọ
        foreignKey: 'MaNhaTroNhan',
        as: 'receivedNotifications'
    });
  };
  return Property;
};