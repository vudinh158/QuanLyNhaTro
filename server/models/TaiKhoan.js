'use strict';
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const TaiKhoan = sequelize.define('TaiKhoan', {
    MaTK: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    TenDangNhap: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    MatKhau: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    MaVaiTro: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { // Khai báo khóa ngoại
        model: 'VaiTro', // Tên bảng tham chiếu
        key: 'MaVaiTro'
      }
    },
    TrangThai: {
      type: DataTypes.ENUM('Kích hoạt', 'Vô hiệu hóa', 'Tạm khóa'),
      allowNull: false,
      defaultValue: 'Kích hoạt',
    },
    NgayTao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    }
  }, {
    tableName: 'TaiKhoan',
    timestamps: true, // Sequelize sẽ quản lý NgayTao (createdAt) và thêm updatedAt nếu không có cột NgayCapNhatCuoi
    createdAt: 'NgayTao', // Ánh xạ cột NgayTao
    updatedAt: false, // Tắt updatedAt nếu không có cột tương ứng
    hooks: {
      beforeCreate: async (taiKhoan) => {
        if (taiKhoan.MatKhau) {
          const salt = await bcrypt.genSalt(10);
          taiKhoan.MatKhau = await bcrypt.hash(taiKhoan.MatKhau, salt);
        }
      },
      beforeUpdate: async (taiKhoan) => {
        if (taiKhoan.changed('MatKhau') && taiKhoan.MatKhau) {
          const salt = await bcrypt.genSalt(10);
          taiKhoan.MatKhau = await bcrypt.hash(taiKhoan.MatKhau, salt);
        }
      },
    },
  });

  TaiKhoan.prototype.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.MatKhau);
  };

  TaiKhoan.associate = function(models) {
    TaiKhoan.belongsTo(models.VaiTro, {
      foreignKey: 'MaVaiTro',
      as: 'vaiTro'
    });
    TaiKhoan.hasOne(models.ChuTro, { // Liên kết 1-1 với ChuTro
      foreignKey: 'MaTK',
      as: 'chuTroInfo'
    });
    TaiKhoan.hasOne(models.KhachThue, { // Liên kết 1-1 với KhachThue (có thể null)
      foreignKey: 'MaTK',
      as: 'khachThueInfo'
    });
  };

  return TaiKhoan;
};