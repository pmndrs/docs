const withPWA = require('next-pwa');

module.exports = withPWA({
  crossOrigin: 'anonymous',
  pwa: {
    disable: process.env.NODE_ENV === 'development',
    dest: 'public',
  },
});
