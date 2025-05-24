require('dotenv').config();

module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET || 'YOUR_DEFAULT_FALLBACK_SECRET_KEY_HERE', 
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },

};