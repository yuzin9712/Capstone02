module.exports = (sequelize, DataTypes) => (
    sequelize.define('chatLine', {
        lines: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    }, {
        timestamps: true,
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
    })
);