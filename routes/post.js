const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');

const { Post, Hashtag, User } = require('../models');
const { isLoggedIn } = require('./middlewares');

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
            cb(null, `original/${Date.now()}${path.basename(file.originalname)}`);
        },
    }),
    limits: { fileSize: 25 * 1024 * 1024 }, //25MB
});

router.post('/img', isLoggedIn, upload.single('img'), (req, res, next) => {
    console.log('/img로 들어왔음!!!');
    console.log(req.file);
    res.json({ url: req.file.location }); //S3버킷에 이미지주소
});

const upload2 = multer();

router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => {
    try {
        const post = await Post.create({
            content: req.body.content,
            img: req.body.url,
            userId: req.user.id,
        });
        const hashtags = req.body.content.match(/#[^\s#]*/g);
        if(hashtags) {
            const result = await Promise.all(hashtags.map(tag => Hashtag.findOrCreate({
                where: { title: tag.slice(1).toLowerCase() },
            })));
            console.log("1번: " , result);
            await post.addHashtags(result.map(r => r[0]));
            console.log("2번: ", result.map(r => r[0]));
        }
        res.redirect('/');
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.get('/hashtag', async(req, res, next) => {
    const tags = req.query.hashtag; //url로 query문 보낼 때

    if (!tags)
    {
        return res.redirect('/'); //보내는 태그 없을 시 메인페이지로 리다이렉트
    }

    try {
        const hashtag = await Hashtag.findOne({ where: { title: tags } });

        let posts = [];

        if (hashtag) {
            posts = await hashtag.getPosts({ include: [{model: User}] });
        }
        return res.render('main', {
            title: `${tags} 찾기`,
            user: req.user,
            twits: posts,
        });
    } catch (err) {
        console.error(err);
        return next(err);
    }
});

module.exports = router;