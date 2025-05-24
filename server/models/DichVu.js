'use strict';
module.exports = (sequelize, DataTypes) => {
  const DichVu = sequelize.define('DichVu', {
    MaDV: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    MaNhaTro: { 
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'NhaTro',
        key: 'MaNhaTro'
      }
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
        {
            fields: ['MaNhaTro', 'TenDV'],
            name: 'idx_dichvu_nhatro_ten'
        },
        {
            fields: ['TenDV'],
            name: 'idx_dichvu_ten'
        }
    ]
  });

  DichVu.associate = function(models) {
    DichVu.belongsTo(models.NhaTro, { // Nếu dịch vụ thuộc về một nhà trọ cụ thể
      foreignKey: 'MaNhaTro',
      as: 'nhaTroRieng',
      allowNull: true
    });
    DichVu.hasMany(models.LichSuGiaDichVu, {
      foreignKey: 'MaDV',
      as: 'lichSuGias'
    });
    DichVu.hasMany(models.SuDungDichVu, {
      foreignKey: 'MaDV',
      as: 'suDungDichVus'
    });
    DichVu.hasMany(models.ChiTietHoaDon, {
      foreignKey: 'MaDV',
      as: 'chiTietHoaDons'
    });
    DichVu.belongsToMany(models.NhaTro, { // Các nhà trọ áp dụng dịch vụ này (nếu là dịch vụ chung)
        through: models.NhaTro_DichVuApDung,
        foreignKey: 'MaDV',
        otherKey: 'MaNhaTro',
        as: 'nhaTrosApDung'
    });
    DichVu.belongsToMany(models.HopDong, { // Các hợp đồng đăng ký dịch vụ này
        through: models.HopDong_DichVuDangKy,
        foreignKey: 'MaDV',
        otherKey: 'MaHopDong',
        as: 'hopDongsDangKy'
    });
  };

  return DichVu;
};