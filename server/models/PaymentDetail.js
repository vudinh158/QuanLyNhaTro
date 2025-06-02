'use strict';
module.exports = (sequelize, DataTypes) => {
  const PaymentDetail = sequelize.define('PaymentDetail', {
    MaThanhToan: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    MaHoaDon: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    SoTien: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    NgayThanhToan: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    MaPTTT: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    MaGiaoDich: {
      type: DataTypes.STRING(100),
    },
    MaNguoiNhanTK: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    GhiChu: {
      type: DataTypes.STRING(255),
    }
  }, {
    tableName: 'ChiTietThanhToan',
    timestamps: false,
    indexes: [
        { fields: ['MaHoaDon'], name: 'idx_chitietthanhtoan_hoadon' }
    ]
  });

  PaymentDetail.associate = function(models) {
    PaymentDetail.belongsTo(models.Invoice, {
      foreignKey: 'MaHoaDon',
      as: 'invoice'
    });
    PaymentDetail.belongsTo(models.PaymentMethod, {
      foreignKey: 'MaPTTT',
      as: 'paymentMethod'
    });
    PaymentDetail.belongsTo(models.Landlord, {
      foreignKey: 'MaNguoiNhanTK',
      as: 'receiver' // Người nhận tiền là Chủ Trọ
    });
  };
  return PaymentDetail;
};