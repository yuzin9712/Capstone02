module.exports = (sequelize, DataTypes) => (
    sequelize.define('post', {
        content: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        field: {
            type: DataTypes.STRING(10),
            allowNull: false,
            defaultValue: 'design', //추천디자인 = design 케어 커뮤니티 = community
        },
        img: {
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