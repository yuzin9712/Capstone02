module.exports = (sequelize, DataTypes) => (
    sequelize.define('productInfo', {
        color: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
        size: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        cnt: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
        }
    }, {
        timestamps: true,
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
    })
);