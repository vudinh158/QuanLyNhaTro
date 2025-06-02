'use strict';
module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    MaVaiTro: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    TenVaiTro: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    }
  }, {
    tableName: 'VaiTro',
    timestamps: false
  });

  Role.associate = function(models) {
    Role.hasMany(models.UserAccount, {
      foreignKey: 'MaVaiTro',
      as: 'userAccounts'
    });
    Role.belongsToMany(models.Permission, {
      through: models.RolePermission, 
      foreignKey: 'MaVaiTro',
      otherKey: 'MaQuyen',
      as: 'permissions'
    });
  };
  return Role;
};