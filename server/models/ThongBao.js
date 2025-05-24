'use strict';
module.exports = (sequelize, DataTypes) => {
  const ThongBao = sequelize.define('ThongBao', {
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
    MaNguoiGui: { // ID của ChuTro hoặc KhachThue
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    MaNhaTroNhan: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'NhaTro',
        key: 'MaNhaTro'
      }
    },
    MaPhongNhan: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Phong',
        key: 'MaPhong'
      }
    },
    LoaiNguoiNhan: {
      type: DataTypes.ENUM('Chủ trọ', 'Khách thuê', 'Tất cả Khách thuê', 'Tất cả Chủ trọ'),
      allowNull: false,
    },
    MaNguoiNhan: { // ID của ChuTro hoặc KhachThue (nếu gửi cá nhân)
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
    timestamps: false // Vì có ThoiGianGui
  });

  ThongBao.associate = function(models) {
    ThongBao.belongsTo(models.NhaTro, {
      foreignKey: 'MaNhaTroNhan',
      as: 'nhaTroNhan',
      allowNull: true
    });
    ThongBao.belongsTo(models.Phong, {
      foreignKey: 'MaPhongNhan',
      as: 'phongNhan',
      allowNull: true
    });
    // Không thể tạo FK trực tiếp cho MaNguoiGui, MaNguoiNhan vì tính đa hình.
    // Sẽ cần xử lý logic này ở service layer để lấy thông tin người gửi/nhận.

    ThongBao.hasMany(models.TrangThaiDocThongBao, {
        foreignKey: 'MaThongBao',
        as: 'trangThaiDocs'
    });
  };

  return ThongBao;
};