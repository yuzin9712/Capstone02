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
            posts = await hashtag.getPosts({ include: [{ model: User }] });
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

/**게시물 수정할 때 정보 보내주기
 * 글 올린 사람과 요청한 사람이 같은지 확인해야하나?
 */
router.get('/:id', isLoggedIn, async(req, res, next) => {

    const post = await Post.findOne({ where: { id: parseInt(req.params.id, 10) } });

    try {
        if (req.user.id !== post.userId) {
            console.log('아냐 다른 사람이야@!!');
            alert('다른 사용자의 게시글 입니다.');
            res.redirect('/');
        }      
    } catch (err) {
        console.error(err);
        next(err);
    }
});

/**게시물의 글 수정 --> 사진 수정도 가능해야 할까? */
router.put('/:id', isLoggedIn, async(req, res, next) => {

})

/**게시글 좋아요 누르기 - 누른 사람, 누른 게시물, 좋아요 수 -- */


module.exports = router;