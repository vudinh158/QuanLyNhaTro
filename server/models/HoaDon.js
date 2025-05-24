'use strict';
module.exports = (sequelize, DataTypes) => {
  const HoaDon = sequelize.define('HoaDon', {
    MaHoaDon: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    MaHopDong: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'HopDong',
        key: 'MaHopDong'
      }
    },
    NgayLap: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    KyThanhToan_TuNgay: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    KyThanhToan_DenNgay: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    TienPhong: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    TongTienDien: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    TongTienNuoc: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    TongTienDichVu: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    TongTienPhaiTra: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    DaThanhToan: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    ConLai: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      // This should be a calculated field, or updated via hooks/services
      // get() {
      //   return this.TongTienPhaiTra - this.DaThanhToan;
      // }
    },
    TrangThaiThanhToan: {
      type: DataTypes.ENUM('Chưa thanh toán', 'Đã thanh toán một phần', 'Đã thanh toán đủ', 'Quá hạn'),
      allowNull: false,
      defaultValue: 'Chưa thanh toán',
    },
    NgayHanThanhToan: {
      type: DataTypes.DATEONLY,
    },
    GhiChu: {
      type: DataTypes.TEXT,
    }
  }, {
    tableName: 'HoaDon',
    timestamps: false, // Nếu không có cột createdAt/updatedAt
    indexes: [
      { unique: true, fields: ['MaHopDong', 'KyThanhToan_DenNgay'], name: 'idx_unique_hoadon_ky' },
      { fields: ['TrangThaiThanhToan'], name: 'idx_hoadon_trangthai' },
      { fields: ['NgayHanThanhToan'], name: 'idx_hoadon_hanthanhtoan' }
    ],
    hooks: {
        beforeValidate: (hoaDon, options) => {
            if (hoaDon.TongTienPhaiTra && typeof hoaDon.DaThanhToan !== 'undefined') {
                 hoaDon.ConLai = parseFloat(hoaDon.TongTienPhaiTra) - parseFloat(hoaDon.DaThanhToan);
            }
        },
        // Có thể thêm afterUpdate để cập nhật lại ConLai nếu DaThanhToan thay đổi
    }
  });

  HoaDon.associate = function(models) {
    HoaDon.belongsTo(models.HopDong, {
      foreignKey: 'MaHopDong',
      as: 'hopDong'
    });
    HoaDon.hasMany(models.DienNuoc, {
      foreignKey: 'MaHoaDon',
      as: 'dienNuocs'
    });
    HoaDon.hasMany(models.SuDungDichVu, {
      foreignKey: 'MaHoaDon',
      as: 'suDungDichVus'
    });
    HoaDon.hasMany(models.ChiTietHoaDon, {
      foreignKey: 'MaHoaDon',
      as: 'chiTietHoaDons'
    });
    HoaDon.hasMany(models.ChiTietThanhToan, {
      foreignKey: 'MaHoaDon',
      as: 'chiTietThanhToans'
    });
  };

  return HoaDon;
};