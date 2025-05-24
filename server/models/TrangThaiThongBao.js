'use strict';
module.exports = (sequelize, DataTypes) => {
  const TrangThaiDocThongBao = sequelize.define('TrangThaiDocThongBao', {
    MaThongBao: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'ThongBao',
        key: 'MaThongBao'
      }
    },
    LoaiNguoiDoc: {
      type: DataTypes.ENUM('Chủ trọ', 'Khách thuê'),
      primaryKey: true,
      allowNull: false,
    },
    MaNguoiDoc: { // ID của ChuTro hoặc KhachThue
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    ThoiGianDoc: {
      type: DataTypes.DATE,
      allowNull: true, // SQL cho phép NULL, mặc định là CURRENT_TIMESTAMP khi tạo
      defaultValue: DataTypes.NOW,
    }
  }, {
    tableName: 'TrangThaiDocThongBao',
    timestamps: false // Vì có ThoiGianDoc
  });

  TrangThaiDocThongBao.associate = function(models) {
    TrangThaiDocThongBao.belongsTo(models.ThongBao, {
      foreignKey: 'MaThongBao',
      as: 'thongBao'
    });
    // Không thể tạo FK trực tiếp cho MaNguoiDoc.
  };

  return TrangThaiDocThongBao;
};