module.exports = (sequelize, DataTypes) => (
    sequelize.define('product', {
        pname: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        img: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
        price: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
        },
        gender: {
            type: DataTypes.STRING(10),
            allowNull: false,
        }
    }, {
        timestamps: true,
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
    })
);