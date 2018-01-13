const Sequelize = require('sequelize');
const db = require('../index');

const Challenge = db.define('challenge', {
  title: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: Sequelize.STRING,
  },
  startDate: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
  endDate: {
    type: Sequelize.DATE,
  },
  value: {
    type: Sequelize.INTEGER,
    defaultValue: 5,
  },
});

module.exports = Challenge;