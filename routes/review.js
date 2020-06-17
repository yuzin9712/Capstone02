const express = require('express');
const db = require('../models');
const path = require('path');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const multer = require('multer');

const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

const router = express.Router();

AWS.config.update({
    accessKeyId: process.env["S3_ACCESS_KEY_ID"],
    secretAccessKey: process.env["S3_SECRET_ACCESS_KEY"],
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
    var query = "insert into comments(content, writer, reviewId, userId, createdAt) values (?)"; //timestamp가 없네...
    var data = [content, writer, reviewId, req.user.id, new Date()];

    await db.sequelize.query(query, {
        replacements: [data]
    })
        .spread(function (newComment) {
            res.sendStatus(200);
        }, function (err) {
            console.error(err);
            res.status(403).send('Error');
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
            res.status(403).send('Error');
        })

});

/**리뷰 작성하기 - 상품 아이디값이 파라미터로 옴 */
router.post('/post/:id', isLoggedIn, async (req, res, next) => {
    console.log('------------들어옴-------------');

    var content = req.body.content;
    var imgs = req.body.imgs;

    var query = "insert into reviews(content, user_email, img, img2, img3, userId, productId, createdAt) values (?)";

    var data = [content, req.user.name, req.body.imgs[0], req.body.imgs[1], req.body.imgs[2], req.user.id, parseInt(req.params.id, 10), new Date()];

    try {
        await db.sequelize.query(query, {
            replacements: [data]
        })
            .spread(function () {
                res.sendStatus(200);
            }, function (err) {
                console.error(err);
            })
    } catch (err) {
        console.error(err);
        res.status(403).send('Error');
    }
});

//리뷰 삭제하기 
router.post('/deleteReview', isLoggedIn, async (req, res, next) => {
    var rid = req.body.reviewId;
    var query1 = "delete from reviews where id = ?";
    var query2 = "delete from comments where reviewId = ?";
    var query0 = "select * from reviews where id = ?";
    var uid = req.user.id;
    var id;

    try {

        await db.sequelize.query(query0, { replacements: [rid] })
            .spread(function (review) {
                console.log(review);
                id = review[0].userId;
            }, function (err) {
                console.log(err);
            });

        if (uid == id || uid == 17) {
            await db.sequelize.query(query2, { replacements: [rid] })
                .spread(function (deleted1) {
                    console.log(deleted1);
                }, function (err) {
                    console.log(err);
                });

            await db.sequelize.query(query1, { replacements: [rid] })
                .spread(function (deleted2) {
                    console.log(deleted2);
                    res.send('delete review done');
                }, function (err) {
                    console.log(err);
                });

        } else {
            res.send('delete review fail');
        }

    } catch (err) {
        console.error(err);
        res.status(403).send('Error');
    }
});

//리뷰에 달린 답글 삭제하기
router.post('/deleteComment', isLoggedIn, async (req, res, next) => {
    var comid = req.body.commentId;
    var query = "delete from comments where id = ?";
    var query2 = "select * from comments where id = ?";
    var uid = req.user.id;
    var id;

    try {

        await db.sequelize.query(query2, { replacements: [comid] })
            .spread(function (comment) {
                console.log(comment);
                id = comment[0].userId;
            }, function (err) {
                console.error(err);
            });

        if (uid == id || uid == 17) {
            await db.sequelize.query(query, { replacements: [comid] })
                .spread(function (deleted) {
                    console.log(deleted);
                    res.send('delete comment done');
                }, function (err) {
                    console.log(err);
                });
        }else {
            res.send('delete comment fail');
        }

    } catch (err) {
        console.error(err);
        res.status(403).send('Error');
    }
});

//리뷰 수정하기 
router.post('/updateReview', isLoggedIn, async(req, res, next) => {
    var content = req.body.comment;
    var uid = req.user.id;
    var rid = req.body.reviewId;
    var id;
    var query1 = "select * from reviews where id = ?";
    var query2 = "update reviews set content = ? where id = ?";

    try{
        await db.sequelize.query(query1, { replacements : [rid] })
        .spread(function(review){
            console.dir(review);
            id = review[0].userId;
        }, function(err){
            console.error(err);
        });
        if (id == uid) {
            await db.sequelize.query(query2, { replacements: [content, rid] })
                .spread(function (updated) {
                    console.dir(updated);
                    res.send('update review complete');
                }, function (err) {
                    console.error(err);
                });
        }else{
            res.send('update review fail');
        }
    }catch(err){
        console.error(err);
        res.status(403).send('Error');
    }
    
});

//답글 수정하기
router.post('/updateComment', isLoggedIn, async(req, res, next) => {
    var content = req.body.comment;
    var uid = req.user.id;
    var comid = req.body.commentId;
    var id;

    var query1 = "select * from comments where id = ?";
    var query2 = "update comments set content = ? where id = ?";

    try{
        await db.sequelize.query(query1, {replacements : [comid] })
        .spread(function(comment){
            console.dir(comment);
            id = comment[0].userId;
        }, function(err){
            console.error(err);
        });

        if (id == uid) {
            await db.sequelize.query(query2, { replacements: [content, comid] })
                .spread(function (updated) {
                    console.dir(updated);
                    res.send('update comment success');
                }, function (err) {
                    console.error(err);
                });
        }else{
            res.send('update comment fail');
        }

    }catch(err){
        console.error(err);
        res.status(403).send('Error');
    }

});

module.exports = router;