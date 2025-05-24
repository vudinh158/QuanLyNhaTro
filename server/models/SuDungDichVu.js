'use strict';
module.exports = (sequelize, DataTypes) => {
  const SuDungDichVu = sequelize.define('SuDungDichVu', {
    MaSuDungDV: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    MaPhong: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Phong',
        key: 'MaPhong'
      }
    },
    MaDV: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'DichVu',
        key: 'MaDV'
      }
    },
    NgaySuDung: {
      type: DataTypes.DATEONLY,
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
    },
    MaHoaDon: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'HoaDon',
        key: 'MaHoaDon'
      }
    },
    TrangThai: {
      type: DataTypes.ENUM('Mới ghi', 'Đã tính tiền', 'Đã hủy'),
      allowNull: false,
      defaultValue: 'Mới ghi',
    },
    GhiChu: {
      type: DataTypes.TEXT,
    }
  }, {
    tableName: 'SuDungDichVu',
    timestamps: false,
    indexes: [
        { fields: ['MaHoaDon'], name: 'idx_sudungdv_hoadon' },
        { fields: ['MaPhong', 'MaDV', 'NgaySuDung'], name: 'idx_sudungdv_phong_dichvu_ngay' } // Thêm NgaySuDung vào index
    ]
  });

  SuDungDichVu.associate = function(models) {
    SuDungDichVu.belongsTo(models.Phong, {
      foreignKey: 'MaPhong',
      as: 'phong'
    });
    SuDungDichVu.belongsTo(models.DichVu, {
      foreignKey: 'MaDV',
      as: 'dichVu'
    });
    SuDungDichVu.belongsTo(models.HoaDon, {
      foreignKey: 'MaHoaDon',
      as: 'hoaDon'
    });
  };

  return SuDungDichVu;
};