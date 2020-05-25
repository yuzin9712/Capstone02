module.exports = (sequelize, DataTypes) => (
    sequelize.define('shopAdmin', {
        shopurl: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        shopname: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        alianced: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
        },
        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
        },
    }, {
        timestamps: true,
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
    })
);