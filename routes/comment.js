const express = require('express');
const multer = require('multer');
const path = require('path');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');

const { PostComment, Post } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

/**수정필요!!!!! 사진여러개 올릴 수 있도록 수정해야함 */

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
            cb(null, `comment/${Date.now()}${path.basename(file.originalname)}`);
        },
    }),
    limits: { fileSize: 25 * 1024 * 1024 }, //25MB
});

/**댓글 이미지 S3에 업로드 */
router.post('/img', isLoggedIn, upload.single('img'), (req, res, next) => {
    console.log('/img로 들어왔음!!!');
    console.log(req.file);
    res.json({ url: req.file.location }); //S3버킷에 이미지주소
});

const upload2 = multer();

/**나의 옷장에 사진과 함께 사용된 제품 아이디 저장*/
router.post('/post/:id', isLoggedIn, upload2.none(), async (req, res, next) => {

    const post = await Post.findOne({ where: { id: parseInt(req.params.id, 10) } }); //게시물의 아이디값

    try {
        if(post) {
            const comment = await PostComment.create({
                userId: req.user.id,
                content: req.body.content,
                img: req.body.url,
                postId: parseInt(req.params.id, 10),
            });
        } else {
            console.log('없는 글이니까 메인페이지로 이동하셈');
        }
        res.redirect('/'); //커뮤니티 메인 페이지로 이동
    } catch (err) {
        console.error(err);
        next(err);
    }
    
});

/**게시물 댓글 삭제 */
router.delete('/post/:id', async (req, res, next) => {
    
    const postcomment = await PostComment.findOne({ where: { id: parseInt(req.params.id, 10), userId: req.user.id } }); //댓글의 아이디값

    try {
        if(postcomment) {

            postcomment.destroy({});
            res.send('success');

        } else {
            console.log('없는 댓글이니까 메인페이지로 이동하셈');
            res.redirect('/');
        }
    } catch (err) {
        console.error(err);
        next(err);
    }
    
});

module.exports = router;