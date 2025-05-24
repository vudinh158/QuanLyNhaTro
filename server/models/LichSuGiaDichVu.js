'use strict';
module.exports = (sequelize, DataTypes) => {
  const LichSuGiaDichVu = sequelize.define('LichSuGiaDichVu', {
    MaLichSuDV: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    MaDV: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'DichVu',
        key: 'MaDV'
      }
    },
    DonGiaMoi: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    NgayApDung: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    MaNguoiCapNhat: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    tableName: 'LichSuGiaDichVu',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['MaDV', 'NgayApDung'],
        name: 'idx_unique_gia_dichvu_apdung'
      }
    ]
  });

  LichSuGiaDichVu.associate = function(models) {
    LichSuGiaDichVu.belongsTo(models.DichVu, {
      foreignKey: 'MaDV',
      as: 'dichVu'
    });
    LichSuGiaDichVu.belongsTo(models.ChuTro, {
      foreignKey: 'MaNguoiCapNhat',
      as: 'nguoiCapNhat'
    });
  };

  return LichSuGiaDichVu;
};