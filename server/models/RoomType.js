'use strict';
module.exports = (sequelize, DataTypes) => {
  const RoomType = sequelize.define('RoomType', {
    MaLoaiPhong: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    TenLoai: {
      type: DataTypes.STRING(50),
      allowNull: false,
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
    },
    MaNhaTro: {
        type: DataTypes.INTEGER,
        allowNull: false,
      }
    }, {
      tableName: 'LoaiPhong',
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ['MaNhaTro', 'TenLoai']
        }
      ]
    });
  
    RoomType.associate = function(models) {
      RoomType.belongsTo(models.Property, {
        foreignKey: 'MaNhaTro',
        as: 'property'
      });
      RoomType.hasMany(models.Room, {
        foreignKey: 'MaLoaiPhong',
        as: 'rooms'
      });
    };
    return RoomType;
  };