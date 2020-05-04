module.exports = (sequelize, DataTypes) => (
    sequelize.define('delivery', {
        email: {
            type: DataTypes.STRING(40),
            allowNull: true,
            unique: false,
        },
        name: {
            type: DataTypes.STRING(15),
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        addr1: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        addr2: {
            type: DataTypes.STRING(10),
            allowNull: false,
            defaultValue: 'local',
        },
        zipCode: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        message: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
    }, {
        timestamps: true,
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
    })
);