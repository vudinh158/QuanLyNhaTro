'use strict';
module.exports = (sequelize, DataTypes) => {
  const NhaTro_DichVuApDung = sequelize.define('NhaTro_DichVuApDung', {
    MaNhaTro: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'NhaTro',
        key: 'MaNhaTro'
      }
    },
    MaDV: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'DichVu',
        key: 'MaDV'
      }
    }
  }, {
    tableName: 'NhaTro_DichVuApDung',
    timestamps: false
  });
  return NhaTro_DichVuApDung;
};