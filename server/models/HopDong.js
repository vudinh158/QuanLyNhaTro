'use strict';
module.exports = (sequelize, DataTypes) => {
  const HopDong = sequelize.define('HopDong', {
    MaHopDong: {
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
    timestamps: false, // Nếu không có cột createdAt/updatedAt trong SQL
    indexes: [
      { fields: ['MaPhong', 'NgayBatDau', 'NgayKetThuc'], name: 'idx_hopdong_phong_thoigian' },
      { fields: ['MaPhong', 'TrangThai'], name: 'idx_hopdong_phong_trangthai' }
    ]
  });

  HopDong.associate = function(models) {
    HopDong.belongsTo(models.Phong, {
      foreignKey: 'MaPhong',
      as: 'phong'
    });
    HopDong.hasMany(models.NguoiOCung, {
      foreignKey: 'MaHopDong',
      as: 'nguoiOCungs'
    });
    HopDong.hasMany(models.HoaDon, {
      foreignKey: 'MaHopDong',
      as: 'hoaDons'
    });
    HopDong.belongsToMany(models.DichVu, {
      through: models.HopDong_DichVuDangKy,
      foreignKey: 'MaHopDong',
      otherKey: 'MaDV',
      as: 'dichVusDangKy'
    });
  };

  return HopDong;
};