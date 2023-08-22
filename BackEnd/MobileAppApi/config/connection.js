const Sequelize = require('sequelize')
require('dotenv-safe').config();

const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: process.env.ENV != 'production' ? console.log : false
});

module.exports = sequelize