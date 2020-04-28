module.exports = (sequelize, DataTypes) => (
    sequelize.define('postComment', {
        img: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
        content: {
            type: DataTypes.STRING(200),
            allowNull: true,
        }
    }, {
        timestamps: true,
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
    })
);