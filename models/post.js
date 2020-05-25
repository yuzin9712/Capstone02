module.exports = (sequelize, DataTypes) => (
    sequelize.define('post', {
        title: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: true,
        }
    }, {
        timestamps: true,
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
    })
);