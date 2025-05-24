'use strict';
module.exports = (sequelize, DataTypes) => {
  const VaiTro_Quyen = sequelize.define('VaiTro_Quyen', {
    MaVaiTro: {
      type: DataTypes.INTEGER,
      primaryKey: true, // Part of composite PK
      allowNull: false,
      references: {
        model: 'VaiTro',
        key: 'MaVaiTro'
      }
    },
    MaQuyen: {
      type: DataTypes.INTEGER,
      primaryKey: true, // Part of composite PK
      allowNull: false,
      references: {
        model: 'Quyen',
        key: 'MaQuyen'
      }
    }
  }, {
    tableName: 'VaiTro_Quyen',
    timestamps: false
  });


  return VaiTro_Quyen;
};