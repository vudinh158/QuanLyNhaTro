'use strict';
module.exports = (sequelize, DataTypes) => {
  const ChiTietThanhToan = sequelize.define('ChiTietThanhToan', {
    MaThanhToan: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    MaHoaDon: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'HoaDon',
        key: 'MaHoaDon'
      }
    },
    SoTien: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    NgayThanhToan: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    MaPTTT: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'PhuongThucThanhToan',
        key: 'MaPTTT'
      }
    },
    MaGiaoDich: {
      type: DataTypes.STRING(100),
    },
    MaNguoiNhanTK: { 
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'ChuTro',
        key: 'MaChuTro'
      }
    },
    GhiChu: {
      type: DataTypes.STRING(255),
    }
  }, {
    tableName: 'ChiTietThanhToan',
    timestamps: false,
    indexes: [
        { fields: ['MaHoaDon'], name: 'idx_chitietthanhtoan_hoadon' }
    ]
  });

  ChiTietThanhToan.associate = function(models) {
    ChiTietThanhToan.belongsTo(models.HoaDon, {
      foreignKey: 'MaHoaDon',
      as: 'hoaDon'
    });
    ChiTietThanhToan.belongsTo(models.PhuongThucThanhToan, {
      foreignKey: 'MaPTTT',
      as: 'phuongThucThanhToan'
    });
    ChiTietThanhToan.belongsTo(models.ChuTro, {
      foreignKey: 'MaNguoiNhanTK',
      as: 'nguoiNhan'
    });
  };

  return ChiTietThanhToan;
};