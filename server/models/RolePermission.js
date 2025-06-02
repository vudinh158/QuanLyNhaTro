'use strict';
module.exports = (sequelize, DataTypes) => {
  const RolePermission = sequelize.define('RolePermission', {
    MaVaiTro: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    MaQuyen: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    }
  }, {
    tableName: 'VaiTro_Quyen',
    timestamps: false
  });

  RolePermission.associate = function(models) {
    RolePermission.belongsTo(models.Role, { foreignKey: 'MaVaiTro', as: 'role' });
    RolePermission.belongsTo(models.Permission, { foreignKey: 'MaQuyen', as: 'permission' });
  };
  return RolePermission;
};