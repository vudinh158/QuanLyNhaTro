'use strict';
module.exports = (sequelize, DataTypes) => {
  const ChuTro = sequelize.define('ChuTro', {
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

  ChuTro.associate = function(models) {
    ChuTro.belongsTo(models.TaiKhoan, {
      foreignKey: 'MaTK',
      as: 'taiKhoan'
    });
    ChuTro.hasMany(models.NhaTro, {
      foreignKey: 'MaChuTro',
      as: 'nhaTros'
    });
    ChuTro.hasMany(models.LichSuGiaDienNuoc, { // Chủ trọ cập nhật giá điện nước
        foreignKey: 'MaNguoiCapNhat',
        as: 'lichSuCapNhatGiaDienNuoc'
    });
    ChuTro.hasMany(models.LichSuGiaDichVu, { // Chủ trọ cập nhật giá dịch vụ
        foreignKey: 'MaNguoiCapNhat',
        as: 'lichSuCapNhatGiaDichVu'
    });
    ChuTro.hasMany(models.ChiTietThanhToan, { // Chủ trọ là người nhận tiền
        foreignKey: 'MaNguoiNhanTK',
        as: 'thanhToansDaNhan'
    });
  };

  return ChuTro;
};