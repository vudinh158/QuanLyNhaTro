'use strict';
module.exports = (sequelize, DataTypes) => {
  const NotificationReadStatus = sequelize.define('NotificationReadStatus', {
    MaThongBao: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    LoaiNguoiDoc: {
      type: DataTypes.ENUM('Chủ trọ', 'Khách thuê'),
      primaryKey: true,
      allowNull: false,
    },
    MaNguoiDoc: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    ThoiGianDoc: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    }
  }, {
    tableName: 'TrangThaiDocThongBao',
    timestamps: false
  });

  NotificationReadStatus.associate = function(models) {
    NotificationReadStatus.belongsTo(models.Notification, {
      foreignKey: 'MaThongBao',
      as: 'notification'
    });
  };
  return NotificationReadStatus;
};