'use strict';
module.exports = (sequelize, DataTypes) => {
  const LoaiPhong = sequelize.define('LoaiPhong', {
    MaLoaiPhong: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    TenLoai: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    Gia: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    DienTich: {
      type: DataTypes.DECIMAL(5, 2),
    },
    SoNguoiToiDa: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    MoTa: {
      type: DataTypes.TEXT,
    }
  }, {
    tableName: 'LoaiPhong',
    timestamps: false
  });

  LoaiPhong.associate = function(models) {
    LoaiPhong.hasMany(models.Phong, {
      foreignKey: 'MaLoaiPhong',
      as: 'phongs'
    });
  };

  return LoaiPhong;
};