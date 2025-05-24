'use strict';
module.exports = (sequelize, DataTypes) => {
  const KhachThue = sequelize.define('KhachThue', {
    MaKhachThue: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    MaTK: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: true,
      references: {
        model: 'TaiKhoan',
        key: 'MaTK'
      }
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
    Email: {
      type: DataTypes.STRING(100),
      unique: true,
      validate: {
        isEmail: true,
      }
    },
    NgaySinh: {
      type: DataTypes.DATEONLY,
    },
    GioiTinh: {
      type: DataTypes.ENUM('Nam', 'Nữ', 'Khác'),
    },
    QueQuan: {
      type: DataTypes.STRING(255),
    },
    GhiChu: {
      type: DataTypes.TEXT,
    },
    AnhGiayTo: {
      type: DataTypes.STRING(255),
    },
    TrangThai: {
      type: DataTypes.ENUM('Đang thuê', 'Đã rời đi'),
      allowNull: false,
      defaultValue: 'Đang thuê',
    }
  }, {
    tableName: 'KhachThue',
    timestamps: false
  });

  KhachThue.associate = function(models) {
    KhachThue.belongsTo(models.TaiKhoan, {
      foreignKey: 'MaTK',
      as: 'taiKhoan',
      allowNull: true
    });
    KhachThue.hasMany(models.NguoiOCung, {
      foreignKey: 'MaKhachThue',
      as: 'cacLanOCung' // Một khách thuê có thể ở nhiều hợp đồng khác nhau
    });
  };

  return KhachThue;
};