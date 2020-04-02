module.exports = (sequelize, DataTypes) => (
    sequelize.define('category', {
        cname: {
            type: DataTypes.STRING(255),
            allowNull: false,
        }, 
    }, {
        charset: 'utf8',
        collate: 'utf8_general_ci',
    })
);