const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

const sequelize = new Sequelize(
  config.database, config.username, config.password, config,
  );

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = require('./user')(sequelize, Sequelize);
db.Profile = require('./profile')(sequelize, Sequelize);
db.Category = require('./category')(sequelize, Sequelize);
db.Product = require('./product')(sequelize, Sequelize);
db.Hashtag = require('./hashtag')(sequelize, Sequelize);
db.Post = require('./post')(sequelize, Sequelize);
db.Review = require('./review')(sequelize, Sequelize);
db.Cart = require('./cart')(sequelize, Sequelize);

/** 1:1 관계 */
db.User.hasOne(db.Profile, { foreignKey: 'user_id', sourceKey: 'id' });
db.Profile.belongsTo(db.User, { foreignKey: 'user_id', targetKey: 'id' });

/** N:M 관계 */
db.Post.belongsToMany(db.Hashtag, { through: 'PostHashtag' });
db.Hashtag.belongsToMany(db.Post, { through: 'PostHashtag' });

// db.Post.belongsToMany(db.User, { through: 'Like' });
// db.User.belongsToMany(db.Post, { through: 'Like' });

db.User.belongsToMany(db.User, {
  foreignKey: 'followingId',
  as: 'Followers',
  through: 'Follow',
});
db.User.belongsToMany(db.User, {
  foreignKey: 'followerId',
  as: 'Followings',
  through: 'Follow',
});

/**1:N 관계 */
db.User.hasMany(db.Post);
db.Post.belongsTo(db.User);

db.Category.hasMany(db.Product);
db.Product.belongsTo(db.Category);

db.Product.hasMany(db.Review);
db.Review.belongsTo(db.Product);

db.User.hasMany(db.Cart);
db.Cart.belongsTo(db.User);

db.Product.hasMany(db.Cart);
db.Cart.belongsTo(db.Product);

module.exports = db;
