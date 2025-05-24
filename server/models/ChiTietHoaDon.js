'use strict';
module.exports = (sequelize, DataTypes) => {
  const ChiTietHoaDon = sequelize.define('ChiTietHoaDon', {
    MaChiTietHD: {
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
    MaDV: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'DichVu',
        key: 'MaDV'
      }
    },
    MoTaChiTiet: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    SoLuong: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    DonGia: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    ThanhTien: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    }
  }, {
    tableName: 'ChiTietHoaDon',
    timestamps: false,
    indexes: [
        { fields: ['MaHoaDon'], name: 'idx_chitiethd_hoadon' }
    ]
  });

  ChiTietHoaDon.associate = function(models) {
    ChiTietHoaDon.belongsTo(models.HoaDon, {
      foreignKey: 'MaHoaDon',
      as: 'hoaDon'
    });
    ChiTietHoaDon.belongsTo(models.DichVu, {
      foreignKey: 'MaDV',
      as: 'dichVu',
      allowNull: true
    });
  };

  return ChiTietHoaDon;
};