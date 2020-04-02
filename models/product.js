module.exports = (sequelize, DataTypes) => (
    sequelize.define('product', {
        seller: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
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
        cnt: {
            type: DataTypes.INTEGER.UNSIGNED,
            defaultValue: 0,
        }
    }, {
        timestamps: true,
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
    })
);