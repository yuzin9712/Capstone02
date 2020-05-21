const express = require('express');
const db = require('../models');
const path = require('path');
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

/**이미지 올리기 */
router.post('/img', isLoggedIn, upload.array('img', 3), async (req, res, next) => {
    console.log('/img로 들어왔음!!!!');
    console.log(req.file);

    const s3Imgs = req.files;
    const imgs = s3Imgs.map(img => img.location);

    console.log('보내는 데이터는???', imgs);

    res.json(imgs);
});

/**리뷰 답글 작성하기 - 리뷰 아이디 값이 파라미터로 온다 */
router.post('/comment/:id', isLoggedIn, async (req, res, next) => {
    var reviewId = parseInt(req.params.id, 10);
    var writer = req.user.name;
    var content = req.body.content;
    var query = "insert into comments(content, writer, reviewId) values (?)"; //timestamp가 없네...
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
router.get('/:id', isLoggedIn, async (req, res, next) => {
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
        res.send({ reviews: reviews, comments: comments })
    }, function (err) {
        console.error(err);
        next(err);
    })

});

/**리뷰 작성하기 - 상품 아이디값이 파라미터로 옴 */
router.post('/:id', isLoggedIn, async (req, res, next) => {
    console.log('------------들어옴-------------');
    var reviewId = parseInt(req.params.id, 10);
    var content = req.body.content;
    var imgs = req.body.imgs;

    var query = "insert into reviews(content, user_email, img, img2, img3, userId, productId, createdAt) values (?)";
    
    var data = [ content, req.user.email, req.body.imgs[0], req.body.imgs[1], req.body.imgs[2], req.user.id, parseInt(req.params.id, 10), new Date() ];

    try {
        await db.sequelize.query(query, {
            replacements: [data]
        })
        .spread(function () {
            res.sendStatus(200);
        }, function (err) {
            console.error(err);
            next(err);
        })
    } catch (err) {
        console.error(err);
    }
});

module.exports = router;