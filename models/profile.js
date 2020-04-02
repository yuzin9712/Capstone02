module.exports = (sequelize, DataTypes) => (
    sequelize.define('profile', {
        img: {
            type: DataTypes.STRING(200),
            allowNull: true,
        }
    }, {
        charset: 'utf8',
        collate: 'utf8_general_ci',
    })
);