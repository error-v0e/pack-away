const { Sequelize } = require('sequelize');

// Připojení k databázi PostgreSQL
const sequelize = new Sequelize('packaway', 'postgres', '123', {
  host: 'localhost',
  port: 5432, // Výchozí port PostgreSQL
  dialect: 'postgres',
  logging: false, // Povolení logování SQL dotazů
  pool: {
    max: 5, // Maximální počet připojení
    min: 0,
    acquire: 30000, // Čas na získání připojení (ms)
    idle: 10000, // Čas nečinnosti před uzavřením připojení (ms)
  },
});

// Test připojení k databázi
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Připojení k databázi bylo úspěšné!');
  } catch (error) {
    console.error('Nepodařilo se připojit k databázi:', error.message);
  }
})();

module.exports = sequelize;