'use strict';
module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define('Permission', {
    MaQuyen: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    TenQuyen: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    MoTa: {
      type: DataTypes.TEXT,
    }
  }, {
    tableName: 'Quyen',
    timestamps: false
  });

  Permission.associate = function(models) {
    Permission.belongsToMany(models.Role, {
      through: models.RolePermission,
      foreignKey: 'MaQuyen',
      otherKey: 'MaVaiTro',
      as: 'roles'
    });
  };
  return Permission;
};