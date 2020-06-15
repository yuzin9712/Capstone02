const Sequelize = require('sequelize');
const env = process.env["NODE_ENV"] || 'development';
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
db.Closet = require('./closet')(sequelize, Sequelize);
db.PImg = require('./pimg')(sequelize, Sequelize);
db.PostLike = require('./postLike')(sequelize, Sequelize);
db.PostComment = require('./postComment')(sequelize, Sequelize);
db.Design = require('./design')(sequelize, Sequelize);
db.DesignLike = require('./designLike')(sequelize, Sequelize);
db.ImgByColor = require('./imgByColor')(sequelize, Sequelize);
db.Order = require('./order')(sequelize, Sequelize);
db.OrderDetail = require('./orderDetail')(sequelize, Sequelize);
db.Delivery = require('./delivery')(sequelize, Sequelize);
db.CImg = require('./Cimg')(sequelize, Sequelize);
db.Room = require('./room')(sequelize, Sequelize);
db.ChatLine = require('./chatLine')(sequelize, Sequelize);
db.ProductInfo = require('./productInfo')(sequelize, Sequelize);
db.ShopAdmin = require('./shopAdmin')(sequelize, Sequelize);
db.Comment = require('./comment')(sequelize, Sequelize);

/** 1:1 관계 */
db.User.hasOne(db.Profile, { foreignKey: 'userId', sourceKey: 'id' });
db.Profile.belongsTo(db.User, { foreignKey: 'userId', targetKey: 'id' });

/** N:M 관계 */
db.Design.belongsToMany(db.Hashtag, { through: 'DesignHashtag' });
db.Hashtag.belongsToMany(db.Design, { through: 'DesignHashtag' });

db.Post.belongsToMany(db.PImg, { through: 'PostImg' });
db.PImg.belongsToMany(db.Post, { through: 'PostImg' });

db.PostComment.belongsToMany(db.CImg, { through: 'CommentImg' });
db.CImg.belongsToMany(db.PostComment, { through: 'CommentImg' });

db.Closet.belongsToMany(db.Product, { through: 'ClosetProduct' });
db.Product.belongsToMany(db.Closet, { through: 'ClosetProduct' });

db.User.belongsToMany(db.User, {
  foreignKey: 'followingId',
  as: 'Followers', //흠?
  through: 'Follow',
});
db.User.belongsToMany(db.User, {
  foreignKey: 'followerId',
  as: 'Followings',
  through: 'Follow',
});

db.User.belongsToMany(db.User, {
  foreignKey: 'user1Id',
  as: 'User2',
  through: db.Room
});

db.User.belongsToMany(db.User, {
  foreignKey: 'user2Id',
  as: 'User1',
  through: db.Room
});

/**1:N 관계 */
db.User.hasMany(db.Comment);
db.Comment.belongsTo(db.User);

db.Review.hasMany(db.Comment);
db.Comment.belongsTo(db.Review);

db.User.hasMany(db.Review);
db.Review.belongsTo(db.User);

db.ShopAdmin.hasMany(db.Product);
db.Product.belongsTo(db.ShopAdmin);

db.Product.hasMany(db.ProductInfo);
db.ProductInfo.belongsTo(db.Product);

db.Order.hasMany(db.Delivery);
db.Delivery.belongsTo(db.Order);

db.Room.hasMany(db.ChatLine);
db.ChatLine.belongsTo(db.Room);

db.User.hasMany(db.ChatLine);
db.ChatLine.belongsTo(db.User);

db.User.hasMany(db.Order);
db.Order.belongsTo(db.User);

db.Order.hasMany(db.OrderDetail);
db.OrderDetail.belongsTo(db.Order);

db.Product.hasMany(db.OrderDetail);
db.OrderDetail.belongsTo(db.Product);

db.Closet.hasMany(db.CImg);
db.CImg.belongsTo(db.Closet);

db.Closet.hasMany(db.PImg);
db.PImg.belongsTo(db.Closet);

db.Product.hasMany(db.ImgByColor);
db.ImgByColor.belongsTo(db.Product);

db.Post.hasMany(db.PostLike);
db.PostLike.belongsTo(db.Post);

db.User.hasMany(db.Post);
db.Post.belongsTo(db.User);

db.User.hasMany(db.Design);
db.Design.belongsTo(db.User);

db.Closet.hasMany(db.Design);
db.Design.belongsTo(db.Closet);

db.Design.hasMany(db.DesignLike);
db.DesignLike.belongsTo(db.Design);

db.Category.hasMany(db.Product);
db.Product.belongsTo(db.Category);

db.Product.hasMany(db.Review);
db.Review.belongsTo(db.Product);

db.User.hasMany(db.Cart);
db.Cart.belongsTo(db.User);

db.Product.hasMany(db.Cart);
db.Cart.belongsTo(db.Product);

db.User.hasMany(db.Closet);
db.Closet.belongsTo(db.User);

db.Post.hasMany(db.PostComment);
db.PostComment.belongsTo(db.Post);

db.User.hasMany(db.PostComment);
db.PostComment.belongsTo(db.User);

module.exports = db;
