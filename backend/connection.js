const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('packaway', 'root', '', {
  host: 'localhost',
  dialect: 'postgresql',
});



module.exports = sequelize;