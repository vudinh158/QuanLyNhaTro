'use strict';
module.exports = (sequelize, DataTypes) => {
  const Contract = sequelize.define('Contract', {
    MaHopDong: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    MaPhong: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    NgayLap: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    NgayBatDau: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    NgayKetThuc: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    TienCoc: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    TienThueThoaThuan: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    KyThanhToan: {
      type: DataTypes.ENUM('Đầu kỳ', 'Cuối kỳ'),
      allowNull: false,
      defaultValue: 'Cuối kỳ',
    },
    HanThanhToan: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
    },
    TrangThai: {
      type: DataTypes.ENUM('Mới tạo', 'Có hiệu lực', 'Hết hiệu lực', 'Đã thanh lý'),
      allowNull: false,
      defaultValue: 'Mới tạo',
    },
    FileHopDong: {
      type: DataTypes.STRING(255),
    },
    GhiChu: {
      type: DataTypes.TEXT,
    }
  }, {
    tableName: 'HopDong',
    timestamps: false,
    indexes: [
      { fields: ['MaPhong', 'NgayBatDau', 'NgayKetThuc'], name: 'idx_hopdong_phong_thoigian' },
      { fields: ['MaPhong', 'TrangThai'], name: 'idx_hopdong_phong_trangthai' }
    ]
  });

  Contract.associate = function(models) {
    Contract.belongsTo(models.Room, {
      foreignKey: 'MaPhong',
      as: 'room'
    });
    Contract.hasMany(models.Occupant, {
      foreignKey: 'MaHopDong',
      as: 'occupants'
    });
    Contract.hasMany(models.Invoice, {
      foreignKey: 'MaHopDong',
      as: 'invoices'
    });
    Contract.belongsToMany(models.Service, {
      through: models.ContractRegisteredService,
      foreignKey: 'MaHopDong',
      otherKey: 'MaDV',
      as: 'registeredServices'
    });
  };
  return Contract;
};