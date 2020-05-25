require('dotenv').config();

module.exports = {
    development: {
        username: 'user',
        password: process.env.SEQUELIZE_PASSWORD,
        database: 'newcap',
        host: 'capstone-project.cojwntxe9hru.ap-northeast-2.rds.amazonaws.com',
        dialect: 'mysql',
        operatorAliases: 'false',
    },
    "production": {
        "username": "root",
        "password": null,
        "database": "database_production",
        "host": "127.0.0.1",
        "dialect": "mysql",
        "operatorsAliases": false
      }
}