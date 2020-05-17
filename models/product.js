module.exports = (sequelize, DataTypes) => (
    sequelize.define('product2', {
        pname: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        price: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        img: {
            type: DataTypes.STRING(200),
            allowNull: true,
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