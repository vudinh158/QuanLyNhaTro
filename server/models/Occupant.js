'use strict';
module.exports = (sequelize, DataTypes) => {
  const Occupant = sequelize.define('Occupant', {
    MaNOC: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    MaHopDong: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    MaKhachThue: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    LaNguoiDaiDien: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    NgayVaoO: {
      type: DataTypes.DATEONLY,
    },
    NgayRoiDi: {
      type: DataTypes.DATEONLY,
    },
    QuanHeVoiNguoiDaiDien: {
      type: DataTypes.STRING(50),
    },
    GhiChu: {
      type: DataTypes.TEXT,
    }
  }, {
    tableName: 'NguoiOCung',
    timestamps: false,
    indexes: [
      { unique: true, fields: ['MaHopDong', 'MaKhachThue'], name: 'idx_nguoiocung_hopdong_khach' },
      { fields: ['MaHopDong', 'LaNguoiDaiDien'], name: 'idx_nguoiocung_hopdong_daidien' },
      { fields: ['MaKhachThue'], name: 'idx_nguoiocung_khachthue' }
    ]
  });

  Occupant.associate = function(models) {
    Occupant.belongsTo(models.Contract, {
      foreignKey: 'MaHopDong',
      as: 'contract'
    });
    Occupant.belongsTo(models.Tenant, {
      foreignKey: 'MaKhachThue',
      as: 'tenant'
    });
  };
  return Occupant;
};