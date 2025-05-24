'use strict';
module.exports = (sequelize, DataTypes) => {
  const DienNuoc = sequelize.define('DienNuoc', {
    MaDienNuoc: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    MaPhong: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Phong',
        key: 'MaPhong'
      }
    },
    Loai: {
      type: DataTypes.ENUM('Điện', 'Nước'),
      allowNull: false,
    },
    ChiSoDau: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ChiSoCuoi: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    SoLuongTieuThu: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    DonGia: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    ThanhTien: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    NgayGhi: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    MaHoaDon: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'HoaDon',
        key: 'MaHoaDon'
      }
    },
    TrangThai: {
      type: DataTypes.ENUM('Mới ghi', 'Đã tính tiền', 'Đã hủy'),
      allowNull: false,
      defaultValue: 'Mới ghi',
    },
    GhiChu: {
      type: DataTypes.TEXT,
    }
  }, {
    tableName: 'DienNuoc',
    timestamps: false,
    indexes: [
      {
        unique: true, // Sửa lại UNIQUE constraint theo SQL
        fields: ['MaHoaDon', 'Loai', 'NgayGhi'], // Hoặc một tổ hợp khác phù hợp hơn logic của bạn
        name: 'idx_unique_diennuoc_hoadon_loai_ngayghi' // Đổi tên index cho rõ ràng
      },
      { fields: ['MaPhong', 'Loai'], name: 'idx_diennuoc_phong_loai' }
    ]
  });

  DienNuoc.associate = function(models) {
    DienNuoc.belongsTo(models.Phong, {
      foreignKey: 'MaPhong',
      as: 'phong'
    });
    DienNuoc.belongsTo(models.HoaDon, {
      foreignKey: 'MaHoaDon',
      as: 'hoaDon'
    });
  };

  return DienNuoc;
};