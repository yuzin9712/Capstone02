module.exports = (sequelize, DataTypes) => (
    sequelize.define('imgByColor', {
        img: {
            type: DataTypes.TEXT(),
            allowNull: true,
        },
        color: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
    }, {
        timestamps: false,
        paranoid: false,
        charset: 'utf8',
        collate: 'utf8_general_ci',
    })
);