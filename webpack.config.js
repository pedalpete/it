var path = require('path');

module.exports = {
  entry: './index.js',
  target: 'node',
  output: {
    path:__dirname,
    filename: 'favor_le.js'
  }
}