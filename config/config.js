require('dotenv').config();

module.exports = {
    development: {
        username: 'user',
        password: process.env["SEQUELIZE_PASSWORD"],
        database: 'newcap',
        host: 'capstone-project.cojwntxe9hru.ap-northeast-2.rds.amazonaws.com',
        dialect: 'mysql',
        operatorAliases: 'false',
        logging: false
    },
    production: {
        username: "user",
        password: process.env["SEQUELIZE_PASSWORD"],
        database: "newcap",
        host: "capstone-project.cojwntxe9hru.ap-northeast-2.rds.amazonaws.com",
        dialect: "mysql",
        operatorsAliases: false,
        logging: false
      },
};