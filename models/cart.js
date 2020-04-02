module.exports = (sequelize, DataTypes) => (
    sequelize.define('cart', {
        pname: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        cnt: {
            type: DataTypes.INTEGER.UNSIGNED,
            defaultValue: 1,
        },
    }, {
        timestamps: true,
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
    })
);