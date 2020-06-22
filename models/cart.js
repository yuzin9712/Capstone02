module.exports = (sequelize, DataTypes) => (
    sequelize.define('cart', {
        pname: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        img: {
            type: DataTypes.TEXT(),
            allowNull: false,
        },
        color: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        size: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        cnt: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
    }, {
        timestamps: true,
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
    })
);