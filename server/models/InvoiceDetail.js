'use strict';
module.exports = (sequelize, DataTypes) => {
  const InvoiceDetail = sequelize.define('InvoiceDetail', {
    MaChiTietHD: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    MaHoaDon: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    MaDV: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    MoTaChiTiet: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    SoLuong: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    DonGia: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    ThanhTien: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    }
  }, {
    tableName: 'ChiTietHoaDon',
    timestamps: false,
    indexes: [
        { fields: ['MaHoaDon'], name: 'idx_chitiethd_hoadon' }
    ]
  });

  InvoiceDetail.associate = function(models) {
    InvoiceDetail.belongsTo(models.Invoice, {
      foreignKey: 'MaHoaDon',
      as: 'invoice'
    });
    InvoiceDetail.belongsTo(models.Service, {
      foreignKey: 'MaDV',
      as: 'service',
      allowNull: true
    });
  };
  return InvoiceDetail;
};