'use strict';
module.exports = (sequelize, DataTypes) => {
  const NguoiOCung = sequelize.define('NguoiOCung', {
    MaNOC: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    MaHopDong: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'HopDong',
        key: 'MaHopDong'
      }
    },
    MaKhachThue: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'KhachThue',
        key: 'MaKhachThue'
      }
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

  NguoiOCung.associate = function(models) {
    NguoiOCung.belongsTo(models.HopDong, {
      foreignKey: 'MaHopDong',
      as: 'hopDong'
    });
    NguoiOCung.belongsTo(models.KhachThue, {
      foreignKey: 'MaKhachThue',
      as: 'khachThue'
    });
  };

  return NguoiOCung;
};