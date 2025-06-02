'use strict';
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const UserAccount = sequelize.define('UserAccount', {
    MaTK: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    TenDangNhap: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    MatKhau: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    MaVaiTro: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    TrangThai: {
      type: DataTypes.ENUM('Kích hoạt', 'Vô hiệu hóa', 'Tạm khóa'),
      allowNull: false,
      defaultValue: 'Kích hoạt',
    },
  }, {
    tableName: 'TaiKhoan',
    timestamps: true,
    createdAt: 'NgayTao',
    updatedAt: false,
    hooks: {
      beforeCreate: async (userAccount) => {
        if (userAccount.MatKhau) {
          const salt = await bcrypt.genSalt(10);
          userAccount.MatKhau = await bcrypt.hash(userAccount.MatKhau, salt);
        }
      },
      beforeUpdate: async (userAccount) => {
        if (userAccount.changed('MatKhau') && userAccount.MatKhau) {
          const salt = await bcrypt.genSalt(10);
          userAccount.MatKhau = await bcrypt.hash(userAccount.MatKhau, salt);
        }
      },
    },
  });

  UserAccount.prototype.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.MatKhau);
  };

  UserAccount.associate = function(models) {
    UserAccount.belongsTo(models.Role, {
      foreignKey: 'MaVaiTro',
      as: 'role'
    });
    UserAccount.hasOne(models.Landlord, {
      foreignKey: 'MaTK',
      as: 'landlordProfile'
    });
    UserAccount.hasOne(models.Tenant, {
      foreignKey: 'MaTK',
      as: 'tenantProfile'
    });
  };
  return UserAccount;
};