'use strict';
module.exports = (sequelize, DataTypes) => {
  const VaiTro = sequelize.define('VaiTro', {
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
    timestamps: false // Không có cột timestamp trong bảng này
  });

  VaiTro.associate = function(models) {
    VaiTro.hasMany(models.TaiKhoan, {
      foreignKey: 'MaVaiTro',
      as: 'taiKhoans'
    });
    VaiTro.belongsToMany(models.Quyen, {
      through: models.VaiTro_Quyen, // Sử dụng model trung gian đã định nghĩa
      foreignKey: 'MaVaiTro',
      otherKey: 'MaQuyen',
      as: 'quyens'
    });
  };

  return VaiTro;
};