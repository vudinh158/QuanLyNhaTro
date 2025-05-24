'use strict';
module.exports = (sequelize, DataTypes) => {
  const NhaTro = sequelize.define('NhaTro', {
    MaNhaTro: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    MaChuTro: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ChuTro',
        key: 'MaChuTro'
      }
    },
    TenNhaTro: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    DiaChi: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    GhiChu: {
      type: DataTypes.TEXT,
    }
  }, {
    tableName: 'NhaTro',
    timestamps: false
  });

  NhaTro.associate = function(models) {
    NhaTro.belongsTo(models.ChuTro, {
      foreignKey: 'MaChuTro',
      as: 'chuTro'
    });
    NhaTro.hasMany(models.Phong, {
      foreignKey: 'MaNhaTro',
      as: 'phongs'
    });
    NhaTro.hasMany(models.LichSuGiaDienNuoc, {
      foreignKey: 'MaNhaTro',
      as: 'lichSuGiaDienNuocs'
    });
    NhaTro.hasMany(models.DichVu, { // Một nhà trọ có thể có nhiều dịch vụ riêng
      foreignKey: 'MaNhaTro',
      as: 'dichVusRieng'
    });
    NhaTro.belongsToMany(models.DichVu, { // Các dịch vụ áp dụng cho nhà trọ
        through: models.NhaTro_DichVuApDung,
        foreignKey: 'MaNhaTro',
        otherKey: 'MaDV',
        as: 'dichVusApDung'
    });
  };

  return NhaTro;
};