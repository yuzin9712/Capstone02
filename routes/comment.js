const express = require('express');
const multer = require('multer');
const path = require('path');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');

const { PostComment, Post, CImg, Closet } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

/**수정필요!!!!! 사진여러개 올릴 수 있도록 수정해야함 */

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
            cb(null, `comment/${Date.now()}${path.basename(file.originalname)}`);
        },
    }),
    limits: { fileSize: 25 * 1024 * 1024 }, //25MB
});

/**댓글 이미지 S3에 업로드 */
router.post('/img', isLoggedIn, upload.array('img', 3), async (req, res, next) => {
    console.log('/img로 들어왔음!!!!');
    console.log(req.file);

    const s3Imgs = req.files;
    const imgs = s3Imgs.map(img => img.location);

    console.log('보내는 데이터는???', imgs);

    res.json(imgs);
});

const upload2 = multer();

/**나의 옷장에 사진과 함께 사용된 제품 아이디 저장 - 게시물 아이디가 파라미터로*/
router.post('/post/:id', isLoggedIn, async (req, res, next) => {

    try {
        const post = await Post.findOne({ where: { id: parseInt(req.params.id, 10) } }); //게시물의 아이디값

        if(post == undefined) {
            res.send('게시물이 없다!!');
        } else {
            const localImgs = req.body.imgs; //로컬에서 올린 이미지들 ..
        
        //req.body.closet로 접근
        const closetImgs = req.body.closet; //s3에서 선택한 옷장 이미지의 아이디 값들이 배열로 들어올 예정!

        const postComment = await PostComment.create({
            content: req.body.content, //이미지가 업로드 됐으면 그 이미지 주소도 req.body.url로 옴
            userId: req.user.id,
            postId: parseInt(req.params.id, 10)
        });

        //로컬 사진 url 저장하는 부분 -> 확인 필요!!!
        if(localImgs !== undefined) {

            console.log(localImgs); //확인할때사용

            const locals = await Promise.all(localImgs.map(img => CImg.create({
                img: img,
                //closetId에는 null값이겠쥬
            })));
    
            await postComment.addCimgs(locals.map(r=>Number(r.id))); //relation 테이블에 방금 저장한 로컬 이미지 값 아이디를 넣겠음!
        }

        if(closetImgs !== undefined) {
        //옷장 사진 url 저장하는 부분
        const closets = await Promise.all(closetImgs.map(img => Closet.findOne({
            where: { id: img },
        }))); //id 맞는 옷장 정보들을 조회하겠다!!

        const nonlocals = await Promise.all(closets.map(closet => CImg.create({
            img: closet.img,
            closetId: closet.id
        })));

        await postComment.addCimgs(nonlocals.map(r=>Number(r.id)));
        }

        res.send('댓글 등록 성공!!!');
        }

    } catch (err) {
        console.error(err);
        res.status(403).send('Error');
    }
    
});

/**게시물 댓글 삭제 - 댓글 아이디가 파라미터로 온다.*/
router.delete('/post/:id', isLoggedIn, async (req, res, next) => {
    
    try {
        const postComment = await PostComment.findOne({ 
            include: [{
                model: CImg,
                attributes: ['id'],
                through: {
                    attributes: []
                }
            }],
            where: { id: parseInt(req.params.id, 10), userId: req.user.id }});

            if(postComment == undefined) {
                console.log('없는건데??')
                res.send('없는 댓글!!');
            } else {
                console.log(postComment.Cimgs.map(r=>Number(r.id)));

                //연결된 사진도 삭제해버림
                await postComment.removeCimgs(postComment.Cimgs.map(r=>Number(r.id))); //다대다 관계의 가운데 테이블은 직접 접근할 수 없음!!!!
                await postComment.destroy({});
                res.send('success');
            }
    } catch (err) {
        console.error(err);
        res.status(403).send('Error');
    }
    
});

/**댓글 내용 수정하기 - 댓글의 아이디값이 파라미터로 와야함!!*/
router.put('/post/:id', isLoggedIn, async (req, res, next) => {
    const postComment = await PostComment.findOne({ where: { id: parseInt(req.params.id, 10), userId: req.user.id }});

    try {
        if(postComment == undefined) {
            res.send('댓글이없음~!~!~!~');
        } else {
            postComment.update({
                content: req.body.content
            });

            res.send('success');
        }
    } catch (err) {
        console.error(err);
        res.status(403).send('Error');
    }
});

module.exports = router;