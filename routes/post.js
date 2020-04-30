const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const db = require('../models');
const Op = db.sequelize.Op;

const { Post, PImg, User, PostLike, PostComment, Closet } = require('../models');
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
    limits: { fileSize: 125 * 1024 * 1024 }, //25MB
});

/**사용자가 올린 게시물 조회!!!! */

// router.post('/img', upload.single('img'), (req, res, next) => {
//     console.log('/img로 들어왔음!!!');
//     console.log(req.file); // single일때: 이미지 하나는 req.file로 나머지 정보는 req.body로 옴 // 속성 하나에 이미지 여러개 올렸음 --> array == 이미지들은 req.files로 나머지는 req.body로 접근!!
//                           // 속성 여러 개에 이미지를 하나씩 업로드했다면 fields를 사용
//     // const originalUrl = req.file.location;
//     // const url = originalUrl.replace(/\/original\//, '/thumb/');
//     // res.json({ url : originalUrl })
//     console.log('success');
//     // res.json({ url: req.file.location }); //S3버킷에 이미지주소
// });
 
const upload2 = multer();

/**패션 케어 커뮤니티에 게시물 올리기 */
router.post('/', upload.array('img', 3), async (req, res, next) => {
    try {
        const localImgs = req.files; //로컬에서 올린 이미지들 ..
        
        const closetImgs = [8, 14]; //s3에서 선택한 옷장 이미지의 아이디 값들이 배열로 들어올 예정!

        const post = await Post.create({
            title: req.body.title,
            content: req.body.content, //이미지가 업로드 됐으면 그 이미지 주소도 req.body.url로 옴
            userId: 2
        });

        //로컬 사진 url 저장하는 부분 -> 확인 필요!!!
        if(localImgs !== undefined) {
            const locals = await Promise.all(localImgs.map(img => PImg.create({
                img: img.location,
                //closetId에는 null값이겠쥬
            })));
    
            await post.addPImgs(locals.map(r=>Number(r.id))); //relation 테이블에 방금 저장한 로컬 이미지 값 아이디를 넣겠음!
        }

        if(closetImgs !== undefined) {
        //옷장 사진 url 저장하는 부분
        const closets = await Promise.all(closetImgs.map(img => Closet.findOne({
            where: { id: img },
        }))); //id 맞는 옷장 정보들을 조회하겠다!!

        const nonlocals = await Promise.all(closets.map(closet => PImg.create({
            img: closet.img,
            closetId: closet.id
        })));

        await post.addPimgs(nonlocals.map(r=>Number(r.id)));
        }

        res.send('success');

    } catch (err) {
        console.error(err);
        next(err);
    }
});

/**팔로우 맺은 게시물 조회*/
router.get('/followpost', isLoggedIn, async(req, res, next) => {
    
    const follows = req.user.Followings; //팔로우하는 애들의 아이디값 배열이여야함[{"id":10,"name":"유저1","Follow":{"createdAt":"2020-04-07T11:00:10.000Z","updatedAt":"2020-04-07T11:00:10.000Z","followingId":10,"followerId":2}},{"id":11,"name":"user2","Follow":{"createdAt":"2020-04-07T11:18:18.000Z","updatedAt":"2020-04-07T11:18:18.000Z","followingId":11,"followerId":2}}]
    console.log('이게무ㅓ냐??????????', follows.map(r=>Number(r.id))); //팔로우하는 애들의 아이디 값을 배열로 만듬!!!!!
    // console.log('follow는????',follows);

    Post.findAll({
        include: [
        {
            model: User,
            attributes: ['id', 'name'],
        },{
            model: PImg,
            // limit: 1,
        }
    ],
    order: [['createdAt', 'DESC']],
    where: { userId: follows.map(r=>Number(r.id)) },
    })
    .then((posts) => {
        res.send(posts);
    })
    .catch((err) => {
        console.error(err);
        next(err);
    })
});

/**좋아요한 게시물 조회 */
router.get('/like', isLoggedIn, async (req, res, next) => {

    const likes = await PostLike.findAll({ where: { userId: req.user.id }});
    console.log('이게무ㅓ냐??????????', likes.map(r=>Number(r.postId)));

    Post.findAll({
        include: [
        {
            model: User,
            attributes: ['id', 'name'],
        },
    ],
    order: [['createdAt', 'DESC']],
    where: { id: likes.map(r => Number(r.postId)) },
    })
    .then((posts) => {
        res.send(posts);
    })
    .catch((err) => {
        console.error(err);
        next(err);
    })
});

/**게시물 내용 상세 조회 */
router.get('/:id', isLoggedIn, async(req, res, next) => { //게시물 아이디

    Post.findOne({ 
        include: [{
            model: User,
            attributes: ['id', 'name'],
        },{
            //댓글과 함께
            model: PostComment,
            attributes: ['id','img','content'],
            include: {
                model: User,
                attributes: ['id', 'name'],
            },
            order: [['createdAt', 'DESC']],
        },],
        order: [['createdAt', 'DESC']],
        where: { id: parseInt(req.params.id, 10)}
    })
    .then((post) => {
        res.send(post);
    })
    .catch((err) => {
        console.error(err);
        next(err);
    })
});

/**게시물의 글 수정 --> 사진 수정도 가능해야 할까? */
/**put vs patch 
 * put 은 자원의 전체 교체, 자원내 모든 필드 필요
 * patch 는 자원의 부분교체, 자원 내 일부 필드 필요 -- 사진은 수정안되니까 patch로 하겠음
 */
// router.patch('/:id', isLoggedIn, async(req, res, next) => {

//     const post = await findOne({ where: { id: req.params.id }});

//     try {
//         Post.update({ content: req.body.content }, { where: { id: req.params.id }});

//         const hashtags = req.body.content.match(/#[^\s#]*/g);
//         if(hashtags) {
//             const result = await Promise.all(hashtags.map(tag => Hashtag.findOrCreate({
//                 where: { title: tag.slice(1).toLowerCase() },
//             })));

//             // //해시태그 수정 --> 원래있던 태그와의 관계를 삭제하고 새로운 태그 재생성하는 방식??
//             // //태그를 수정하지 않으면 낭비아닌가?
//             await post.removeHashtags({ where: { postId: post.id }});
//             // await post.addHashtags(result.map(r => r[0]));
//         }
//         res.redirect('/');
// } catch (err) {
//     console.error(err);
//     next(err);
// }
// });

/**커뮤니티에 등록된 게시물 삭제*/
router.delete('/:id', isLoggedIn, async (req, res, next) => {

    const post = await Post.findOne({ where: { id: req.params.id, userId: req.user.id }});

    try {
        if(!post) {
            console.log('그런거 없으니까 메인화면으로 돌아가');
            res.redirect('/');
        }

        post.destroy({}); //deletedAt에 시간 표시됨
        res.send('success');

    } catch (err) {
        console.error(err);
        next(err);
    }
});



module.exports = router;