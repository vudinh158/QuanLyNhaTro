'use strict';
module.exports = (sequelize, DataTypes) => {
  const Room = sequelize.define('Room', {
    MaPhong: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    MaNhaTro: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    MaLoaiPhong: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    TenPhong: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    TrangThai: {
      type: DataTypes.ENUM('Còn trống', 'Đang thuê', 'Đang sửa chữa', 'Đặt cọc'),
      allowNull: false,
      defaultValue: 'Còn trống',
    },
    GhiChu: {
      type: DataTypes.TEXT,
    }
  }, {
    tableName: 'Phong',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['MaNhaTro', 'TenPhong'],
        name: 'idx_phong_nhatro_tenphong'
      }
    ]
  });

  Room.associate = function(models) {
    Room.belongsTo(models.Property, {
      foreignKey: 'MaNhaTro',
      as: 'property'
    });
    Room.belongsTo(models.RoomType, {
      foreignKey: 'MaLoaiPhong',
      as: 'roomType'
    });
    Room.hasMany(models.Contract, {
      foreignKey: 'MaPhong',
      as: 'contracts'
    });
    Room.hasMany(models.ElectricWaterUsage, {
      foreignKey: 'MaPhong',
      as: 'electricWaterUsages'
    });
    Room.hasMany(models.ServiceUsage, {
      foreignKey: 'MaPhong',
      as: 'serviceUsages'
    });
    Room.hasMany(models.Notification, {
        foreignKey: 'MaPhongNhan',
        as: 'receivedNotifications'
    });
  };
  return Room;
};