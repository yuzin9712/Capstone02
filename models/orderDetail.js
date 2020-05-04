module.exports = (sequelize, DataTypes) => (
    sequelize.define('orderDetail', {
        price: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
        },
        cnt: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 1,
        },
        size: {
            type: DataTypes.STRING(200),
            allowNull: false,
            //defaultValue: 1,
        },
        color: {
            type: DataTypes.STRING(200),
            allowNull: false,
            //defaultValue: 1,
        },
        t_invoice: { //운송장번호
            type: DataTypes.STRING(200),
            allowNull: true,
            //defaultValue: 1,
        },
    }, {
        timestamps: true,
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
    })
);