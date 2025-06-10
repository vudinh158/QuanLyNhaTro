'use strict';
module.exports = (sequelize, DataTypes) => {
  const PropertyAppliedService = sequelize.define('PropertyAppliedService', {
    MaNhaTro: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    MaDV: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    }
  }, {
    tableName: 'NhaTro_DichVuApDung',
    timestamps: false
  });
  return PropertyAppliedService;
};