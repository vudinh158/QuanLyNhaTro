'use strict';
module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    MaThongBao: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    LoaiNguoiGui: {
      type: DataTypes.ENUM('Chủ trọ', 'Khách thuê'),
      allowNull: false,
    },
    MaNguoiGui: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    MaNhaTroNhan: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    MaPhongNhan: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    LoaiNguoiNhan: {
      type: DataTypes.ENUM('Chủ trọ', 'Khách thuê'),
      allowNull: false,
    },
    MaNguoiNhan: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    TieuDe: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    NoiDung: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    ThoiGianGui: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    }
  }, {
    tableName: 'ThongBao',
    timestamps: false
  });

  Notification.associate = function(models) {
    Notification.belongsTo(models.Property, {
      foreignKey: 'MaNhaTroNhan',
      as: 'targetProperty',
      allowNull: true
    });
    Notification.belongsTo(models.Room, {
      foreignKey: 'MaPhongNhan',
      as: 'targetRoom',
      allowNull: true
    });
    Notification.hasMany(models.NotificationReadStatus, {
        foreignKey: 'MaThongBao',
        as: 'readStatuses'
    });
  };
  return Notification;
};