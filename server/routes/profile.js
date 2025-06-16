
const express = require('express')
const router = express.Router()
const { Landlord, Tenant, UserAccount } = require('../models')

/**
 * GET /api/profile
 * - Nếu là chủ trọ (Landlord), trả về profile của landlord
 * - Nếu là khách thuê (Tenant), trả về profile của tenant
 * - Ngược lại 404
 */
router.get('/', async (req, res) => {
  const userId = req.userId

  // 1) Thử tìm landlord
  const landlord = await Landlord.findOne({
    where: { MaTK: userId },
    include: [{ model: UserAccount, as: 'userAccount' }]
  })
  if (landlord && landlord.MaChuTro) {
    return res.json({
      HoTen: landlord.HoTen,
      CCCD: landlord.CCCD,
      SoDienThoai: landlord.SoDienThoai,
      NgaySinh: landlord.NgaySinh,
      GioiTinh: landlord.GioiTinh,
      Email: landlord.Email,
      createdAt: landlord.userAccount.NgayTao,
      userAccount: landlord.userAccount,
    })
  }

  // 2) Nếu không phải landlord, thử tìm tenant
  const tenant = await Tenant.findOne({
    where: { MaTK: userId },
    include: [{ model: UserAccount, as: 'userAccount' }]
  })
  if (tenant && tenant.MaKhachThue) {
    return res.json({
      HoTen: tenant.HoTen,
      CCCD: tenant.CCCD,
      SoDienThoai: tenant.SoDienThoai,
      NgaySinh: tenant.NgaySinh,
      GioiTinh: tenant.GioiTinh,
      Email: tenant.Email,
      QueQuan: tenant.QueQuan,
      createdAt: tenant.userAccount.NgayTao,
      userAccount: tenant.userAccount,
    })
  }

  // Không tìm thấy profile nào
  return res.status(404).json({ message: "Not found" })
})

/**
 * PUT /api/profile
 * - Chỉ landlord mới được cập nhật profile
 * - Tenant luôn nhận 403
 */
router.put('/', async (req, res) => {
  const userId = req.userId
  const { HoTen, CCCD, SoDienThoai, NgaySinh, GioiTinh, Email } = req.body

  // 1) Chỉ landlord được quyền cập nhật
  const landlord = await Landlord.findOne({ where: { MaTK: userId } })
  if (landlord && landlord.MaChuTro) {
    landlord.HoTen = HoTen
    landlord.CCCD = CCCD
    landlord.SoDienThoai = SoDienThoai
    landlord.NgaySinh = NgaySinh
    landlord.GioiTinh = GioiTinh
    landlord.Email = Email
    try {
      await landlord.save()
      return res.json({ message: "Updated" })
    } catch (err) {
      return res.status(500).json({ message: "Update failed" })
    }
  }

  // 2) Tenant không được quyền
  return res.status(403).json({ message: "Bạn không có quyền cập nhật hồ sơ cá nhân." })
})

module.exports = router
