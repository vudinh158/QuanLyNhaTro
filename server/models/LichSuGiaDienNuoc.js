'use strict';
module.exports = (sequelize, DataTypes) => {
  const LichSuGiaDienNuoc = sequelize.define('LichSuGiaDienNuoc', {
    MaLichSuDN: {
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
    Loai: {
      type: DataTypes.ENUM('Điện', 'Nước'),
      allowNull: false,
    },
    DonGiaMoi: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    NgayApDung: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    MaNguoiCapNhat: {
      type: DataTypes.INTEGER,
      allowNull: true, // SQL cho phép NULL
      references: {
        model: 'ChuTro',
        key: 'MaChuTro'
      }
    },
    ThoiGianCapNhat: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    }
  }, {
    tableName: 'LichSuGiaDienNuoc',
    timestamps: false, // Vì đã có ThoiGianCapNhat
    indexes: [
      {
        unique: true,
        fields: ['MaNhaTro', 'Loai', 'NgayApDung'],
        name: 'idx_unique_gia_diennuoc_apdung'
      }
    ]
  });

  LichSuGiaDienNuoc.associate = function(models) {
    LichSuGiaDienNuoc.belongsTo(models.NhaTro, {
      foreignKey: 'MaNhaTro',
      as: 'nhaTro'
    });
    LichSuGiaDienNuoc.belongsTo(models.ChuTro, {
      foreignKey: 'MaNguoiCapNhat',
      as: 'nguoiCapNhat'
    });
  };

  return LichSuGiaDienNuoc;
};