const jwt = require('jsonwebtoken');
const SECRET_KEY = 'vat'; // Phải khớp với key trong server.js

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: "Bạn chưa đăng nhập!" });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: "Phiên làm việc hết hạn!" });
        req.user = user; // Lưu thông tin user để dùng ở Route tiếp theo
        next();
    });
};

module.exports = authenticateToken;