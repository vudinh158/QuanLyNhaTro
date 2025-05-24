'use strict';
module.exports = (sequelize, DataTypes) => {
  const Quyen = sequelize.define('Quyen', {
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

  Quyen.associate = function(models) {
    Quyen.belongsToMany(models.VaiTro, {
      through: models.VaiTro_Quyen, // Sử dụng model trung gian
      foreignKey: 'MaQuyen',
      otherKey: 'MaVaiTro',
      as: 'vaiTros'
    });
  };

  return Quyen;
};