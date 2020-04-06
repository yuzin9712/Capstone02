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
        console.log('이게해시태그임!!!!!!!!!!!!!!!!!!! ', hashtags); //[ '#토끼', '#귀여웡' ] 이렇게출력되네

        if(hashtags) {
            const result = await Promise.all(hashtags.map(tag => Hashtag.findOrCreate({
                where: { title: tag.slice(1).toLowerCase() },
            })));
            // console.log("1번: ", result);
            await post.addHashtags(result.map(r => r[0])); //2차원 배열에서 1차원 배열로 만들어줌?
            // console.log("2번: ", result.map(r => r[0]));
        }
        res.redirect('/');
    } catch (err) {
        console.error(err);
        next(err);
    }
});

/**태그 검색 */
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
            res.redirect('/');
        }
        res.send(post);      
    } catch (err) {
        console.error(err);
        next(err);
    }
});

/**게시물의 글 수정 --> 사진 수정도 가능해야 할까? */
/**put vs patch 
 * put 은 자원의 전체 교체, 자원내 모든 필드 필요
 * patch 는 자원의 부분교체, 자원 내 일부 필드 필요 -- 사진은 수정안되니까 patch로 하겠음
 */
router.patch('/:id', isLoggedIn, async(req, res, next) => {

    const post = await findOne({ where: { id: req.params.id }});

    try {
        Post.update({ content: req.body.content }, { where: { id: req.params.id }});

        const hashtags = req.body.content.match(/#[^\s#]*/g);
        if(hashtags) {
            const result = await Promise.all(hashtags.map(tag => Hashtag.findOrCreate({
                where: { title: tag.slice(1).toLowerCase() },
            })));

            //해시태그 수정 --> 원래있던 태그와의 관계를 삭제하고 새로운 태그 재생성하는 방식??
            //태그를 수정하지 않으면 낭비아닌가?
            await post.removeHashtags({ where: { postId: post.id }});
            await post.addHashtags(result.map(r => r[0]));
        }
        res.redirect('/');
} catch (err) {
    console.error(err);
    next(err);
}
});

/**게시물 삭제 - 게시물 아이디를 파라미터로 보냄 //확인필요
 * 교차테이블과 포스트테이블에 있는걸 삭제해야 ... 해시태그 테이블은 냅둬도될까?
*/
router.delete('/:id', async(req, res, next) => {

    const post = Post.findOne({ where: { id: req.params.id }});

    if (post.userId !== req.user.id) {
        console.error('다른 사람 게시물이야!!');
        res.redirect('/'); //메인화면으로 리다이렉트
    }
    
    Post.destroy({ where: { id: req.params.id } })
    .then((result) => {
        res.redirect('/');
    })
    .catch((err) => {
        console.error(err);
        next(err);
    })
});

/**게시글 좋아요 누르기 - 누른 사람, 누른 게시물, 좋아요 수 -- */


module.exports = router;