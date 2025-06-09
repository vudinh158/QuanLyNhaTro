require("dotenv").config();
const mysql = require("mysql2");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const authRoutes = require("./routes/auth");
const propertyRoutes = require("./routes/propertyRoutes");
const roomRoutes = require("./routes/roomRoutes");
const tenantRoutes = require("./routes/tenantRoutes");
const contractRoutes = require("./routes/contractRoutes");
const chiTietHoaDonRoutes = require("./routes/chiTietHoaDon");
const chiTietThanhToanRoutes = require("./routes/chiTietThanhToan");
const hoaDonRoutes = require("./routes/hoaDon");
const dichVuRoutes = require("./routes/dichVu");
const dienNuocRoutes = require("./routes/dienNuoc");
const lichSuGiaDichVuRoutes = require("./routes/lichSuGiaDichVu");
const lichSuGiaDienNuocRoutes = require("./routes/lichSuGiaDienNuoc");
const phuongThucThanhToanRoutes = require("./routes/phuongThucThanhToan");
const suDungDichVuRoutes = require("./routes/suDungDichVu");
const notificationRoutes = require("./routes/notificationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const db = require("./models");
const {
  Invoice,
  InvoiceDetail,
  PaymentDetail,
  Service,
  ElectricWaterUsage,
  ServicePriceHistory,
  ElectricWaterPriceHistory,
  PaymentMethod,
  ServiceUsage,
} = db;

const app = express();
const isTest = process.env.NODE_ENV === "test";

// Middleware chung
const corsOptions = {
    origin: 'http://localhost:3000', // Chỉ định chính xác origin của frontend
    credentials: true, // Cho phép request gửi kèm cookie/credentials
    optionsSuccessStatus: 200 // Dành cho một số trình duyệt cũ
  };
  
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Đăng ký các route
app.use("/api/properties", propertyRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/chi-tiet-hoa-don", chiTietHoaDonRoutes);
app.use("/api/chi-tiet-thanh-toan", chiTietThanhToanRoutes);
app.use("/api/hoa-don", hoaDonRoutes);
app.use("/api/dich-vu", dichVuRoutes);
app.use("/api/dien-nuoc", dienNuocRoutes);
app.use("/api/lich-su-gia-dich-vu", lichSuGiaDichVuRoutes);
app.use("/api/lich-su-gia-dien-nuoc", lichSuGiaDienNuocRoutes);
app.use("/api/phuong-thuc-thanh-toan", phuongThucThanhToanRoutes);
app.use("/api/su-dung-dich-vu", suDungDichVuRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Phục vụ static files cho client và uploads
app.use("/api/auth", require("./routes/auth"));
app.use(express.static(path.join(__dirname, "../client/build")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

// Chỉ chạy scheduler, sync DB và start server khi không phải test
if (!isTest) {
  // Kiểm tra kết nối đến RDS (MySQL)
  const connection = mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "admin",
    password: process.env.DB_PASSWORD || "quanlynhatro",
    database: process.env.DB_NAME || "QuanLyNhaTro",
  });

  connection.connect((err) => {
    if (err) {
      console.error("❌ Kết nối RDS thất bại:", err);
      return;
    }
    console.log("✅ Kết nối thành công đến RDS!");
    connection.end();
  });

  // Sync các bảng
  Promise.all([
    Invoice.sync(),
    InvoiceDetail.sync(),
    PaymentDetail.sync(),
    Service.sync(),
    ElectricWaterUsage.sync(),
    ServicePriceHistory.sync(),
    ElectricWaterPriceHistory.sync(),
    PaymentMethod.sync(),
    ServiceUsage.sync(),
  ])
    .then(() => {
      console.log(
        "✅ Đã sync các bảng hóa đơn, dịch vụ, thanh toán, giá, và sử dụng dịch vụ..."
      );
      app.listen(5000, () => {
        console.log("✅ Server đang chạy tại http://localhost:5000");
      });
    })
    .catch((err) => {
      console.error("❌ Lỗi khi sync bảng:", err);
    });
}

// Xuất app để test (nếu cần)
module.exports = app;
