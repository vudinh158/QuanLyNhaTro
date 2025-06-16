const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Token gửi qua header Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Bạn chưa đăng nhập' });
  }
  const token = authHeader.split(' ')[1];
  try {
    // Giả sử dùng secret là 'your_jwt_secret'
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.userId = decoded.id; // userId hoặc tên trường đã lưu khi tạo token
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }
};