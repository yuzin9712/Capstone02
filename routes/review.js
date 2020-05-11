const express = require('express');
const db = require('../models');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const multer = require('multer');

const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

const router = express.Router();

AWS.config.update({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: 'ap-northeast-2',
});

const upload = multer({
    storage: multerS3({
        s3: new AWS.S3(),
        bucket: 'swcap02',
        key(req, file, cb) {
            cb(null, `review/${Date.now()}${path.basename(file.originalname)}`);
        },
    }),
    limits: { fileSize: 125 * 1024 * 1024 }, //25MB
});

/**리뷰 답글 작성하기 - 리뷰 아이디 값이 파라미터로 온다 */
router.post('/comment/:id', async (req, res, next) => {
    var reviewId = parseInt(req.params.id, 10);
    var writer = 2;
    var content = req.body.content;
    var query = "insert into comments(content, writer, reviewId) values (?)";
    var data = [content, writer, reviewId];

    await db.sequelize.query(query, {
        replacements: [data]
    })
    .spread(function (newComment) {
        res.sendStatus(200);
    }, function (err) {
        console.error(err);
        next(err);
    })

});

/**리뷰 펼쳐보기..? - 리뷰아이디값이 파라미터*/
router.get('/:id', async (req, res, next) => {
    var reviewId = parseInt(req.params.id, 10);
    var query = "select * from reviews where id =?";
    var query2 = "select * from comments where reviewId=?";

    const [reviews, metadata] = await db.sequelize.query(query, {
        replacements: [reviewId]
    });

    await db.sequelize.query(query2, {
        replacements: [reviewId]
    })
    .spread(function (comments) {
        res.send({ rows: reviews, comments: comments })
    }, function (err) {
        console.error(err);
        next(err);
    })

});

/**리뷰 작성하기 - 상품 아이디값이 파라미터로 옴 */
router.post('/:id', upload.array('photo', 3), async (req, res, next) => {
    var reviewId = parseInt(req.params.id, 10);
    var content = req.body.content;

    var query = "select * from users where id=?";
    var query2 = "insert into reviews(content, user_email, img, img2, img3, reviewId, userId) values (?)";
    
    const [userInfo, metadata] = await db.sequelize.query(query, {
        replacements: req.user.id
    });

    var data = [ content, userInfo.email, req.files[0], req.files[1], req.files[2] ];

    await db.sequelize.query(query2, {
        replacements: [data]
    })
    .spread(function () {
        res.sendStatus(200);
    }, function (err) {
        console.error(err);
        next(err);
    })
})

module.exports = router;