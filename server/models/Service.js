'use strict';
module.exports = (sequelize, DataTypes) => {
  const Service = sequelize.define('Service', {
    MaDV: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    MaNhaTro: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    TenDV: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    LoaiDichVu: {
      type: DataTypes.ENUM('Cố định hàng tháng', 'Theo số lượng sử dụng', 'Sự cố/Sửa chữa'),
      allowNull: false,
    },
    DonViTinh: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    HoatDong: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    NgayNgungCungCap: {
      type: DataTypes.DATEONLY,
    }
  }, {
    tableName: 'DichVu',
    timestamps: false,
    indexes: [
        { fields: ['MaNhaTro', 'TenDV'], name: 'idx_dichvu_nhatro_ten' },
        { fields: ['TenDV'], name: 'idx_dichvu_ten' }
    ]
  });

  Service.associate = function(models) {
    Service.belongsTo(models.Property, {
      foreignKey: 'MaNhaTro',
      as: 'propertySpecific', // Dịch vụ này là riêng cho một nhà trọ
      allowNull: true
    });
    Service.hasMany(models.ServicePriceHistory, {
      foreignKey: 'MaDV',
      as: 'priceHistories'
    });
    Service.hasMany(models.ServiceUsage, {
      foreignKey: 'MaDV',
      as: 'usages'
    });
    Service.hasMany(models.InvoiceDetail, {
      foreignKey: 'MaDV',
      as: 'invoiceDetails'
    });
    Service.belongsToMany(models.Property, {
        through: models.PropertyAppliedService,
        foreignKey: 'MaDV',
        otherKey: 'MaNhaTro',
        as: 'appliedToProperties'
    });
    Service.belongsToMany(models.Contract, {
        through: models.ContractRegisteredService,
        foreignKey: 'MaDV',
        otherKey: 'MaHopDong',
        as: 'registeredInContracts'
    });
  };
  return Service;
};