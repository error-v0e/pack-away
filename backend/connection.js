const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('packaway', 'postgres', '123', {
  host: 'localhost',
  port: 5432, 
  dialect: 'postgres',
  logging: false, 
  pool: {
    max: 5, 
    min: 0,
    acquire: 30000, 
    idle: 10000, 
  },
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Připojení k databázi bylo úspěšné!');
  } catch (error) {
    console.error('Nepodařilo se připojit k databázi:', error.message);
  }
})();

module.exports = sequelize;