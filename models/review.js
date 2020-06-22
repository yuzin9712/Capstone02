module.exports = (sequelize, DataTypes) => (
    sequelize.define('review', {
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        img: {
            type: DataTypes.TEXT(),
            allowNull: true,
        },
        img2: {
            type: DataTypes.TEXT(),
            allowNull: true,
        },
        img3: {
            type: DataTypes.TEXT(),
            allowNull: true,
        },
        user_email: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
    }, {
        timestamps: true,
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
    })
);