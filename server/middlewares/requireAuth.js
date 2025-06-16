const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Token gửi qua header Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Bạn chưa đăng nhập' });
  }

  const token = authHeader.split(' ')[1];
  try {
    // Dùng SECRET từ env hoặc fallback
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    // Lấy trường id/userId/MaTK bất kỳ có trong payload
    req.userId = decoded.id || decoded.userId || decoded.MaTK;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }
};