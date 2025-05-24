'use strict';
module.exports = (sequelize, DataTypes) => {
  const Phong = sequelize.define('Phong', {
    MaPhong: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    MaNhaTro: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'NhaTro',
        key: 'MaNhaTro'
      }
    },
    MaLoaiPhong: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'LoaiPhong',
        key: 'MaLoaiPhong'
      }
    },
    TenPhong: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    TrangThai: {
      type: DataTypes.ENUM('Còn trống', 'Đang thuê', 'Đang sửa chữa', 'Khác'),
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

  Phong.associate = function(models) {
    Phong.belongsTo(models.NhaTro, {
      foreignKey: 'MaNhaTro',
      as: 'nhaTro'
    });
    Phong.belongsTo(models.LoaiPhong, {
      foreignKey: 'MaLoaiPhong',
      as: 'loaiPhong'
    });
    Phong.hasMany(models.HopDong, {
      foreignKey: 'MaPhong',
      as: 'hopDongs'
    });
    Phong.hasMany(models.DienNuoc, {
      foreignKey: 'MaPhong',
      as: 'dienNuocs'
    });
    Phong.hasMany(models.SuDungDichVu, {
      foreignKey: 'MaPhong',
      as: 'suDungDichVus'
    });
    Phong.hasMany(models.ThongBao, { // Phòng có thể là đối tượng nhận thông báo
        foreignKey: 'MaPhongNhan',
        as: 'thongBaosNhan'
    });
  };

  return Phong;
};