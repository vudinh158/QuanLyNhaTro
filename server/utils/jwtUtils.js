const jwt = require('jsonwebtoken');
const serverConfig = require('../config/serverConfig');

const generateToken = (payload) => {
  return jwt.sign(payload, serverConfig.jwt.secret, {
    expiresIn: serverConfig.jwt.expiresIn,
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, serverConfig.jwt.secret);
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };