const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const db = require('../models');
const Op = db.sequelize.Op;

const { Post, PImg, User, PostLike, PostComment, Closet, Product, CImg, ImgByColor } = require('../models');
const { isLoggedIn } = require('./middlewares');

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
            cb(null, `original/${Date.now()}${path.basename(file.originalname)}`);
        },
    }),
    limits: { fileSize: 125 * 1024 * 1024 }, //25MB
});

router.post('/img',isLoggedIn, upload.array('img', 3), async (req, res, next) => {
    console.log('/img로 들어왔음!!!!');
    console.log(req.file);

    const s3Imgs = req.files;
    const imgs = s3Imgs.map(img => img.location);

    console.log('보내는 데이터는???', imgs);

    res.json(imgs);
});
 
const upload2 = multer();

/**패션 케어 커뮤니티에 게시물 올리기 */
router.post('/', isLoggedIn, async (req, res, next) => {
    try {
        const localImgs = req.body.imgs; //로컬에서 올린 이미지들 ..
        const closetImgs = req.body.closet; //s3에서 선택한 옷장 이미지의 아이디 값들이 배열로 들어올 예정!

        console.log('이거!!!!!!!',req.body.closet);

        const post = await Post.create({
            title: req.body.title,
            content: req.body.content, //이미지가 업로드 됐으면 그 이미지 주소도 req.body.url로 옴
            userId: req.user.id
        });

        //로컬 사진 url 저장하는 부분
        if(localImgs !== undefined) {

            console.log(localImgs);

            const locals = await Promise.all(localImgs.map(img => PImg.create({
                img: img
                //closetId에는 null값이겠쥬
            })));
    
            await post.addPimgs(locals.map(r=>Number(r.id))); //relation 테이블에 방금 저장한 로컬 이미지 값 아이디를 넣겠음!
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

        console.log('?????', post.id);
        res.send({postId: post.id});

    } catch (err) {
        console.error(err);
        res.status(403).send('Error');
    }
});

/**팔로우 맺은 게시물 조회*/
router.get('/followpost', isLoggedIn, async(req, res, next) => {

    try {
        const follows = req.user.Followings; //팔로우하는 애들의 아이디값 배열이여야함[{"id":10,"name":"유저1","Follow":{"createdAt":"2020-04-07T11:00:10.000Z","updatedAt":"2020-04-07T11:00:10.000Z","followingId":10,"followerId":2}},{"id":11,"name":"user2","Follow":{"createdAt":"2020-04-07T11:18:18.000Z","updatedAt":"2020-04-07T11:18:18.000Z","followingId":11,"followerId":2}}]
        console.log('이게무ㅓ냐??????????', follows.map(r=>Number(r.id))); //팔로우하는 애들의 아이디 값을 배열로 만듬!!!!!
        // console.log('follow는????',follows);

        Post.findAll({
            include: [
                {
                    model: User,
                    attributes: ['id', 'name'],
                    paranoid: false,
                },
                { //대표이미지하나가 안 뽑히고 다나옴,,,,
                    model: PImg,
                    attributes: ['id','img'],
                    through: {
                        attributes: []
                    },
                    // limit: 1 //안먹히넴
                },
            ],
            attributes: {
                include: [
                    [
                        db.sequelize.literal(`(
                            SELECT COUNT(*) FROM postLikes AS reaction WHERE reaction.postId = post.id AND reaction.deletedAt IS NULL)`), //좋아요 수 구하기!!!!
                        'likecount'
                    ],
                    [
                        db.sequelize.literal(`(
                            SELECT COUNT(*) FROM postComments AS comment WHERE comment.postId = post.id AND comment.deletedAt IS NULL)`), //댓글 수 구하기!!!!
                        'commentcount'
                    ]
                ]
            },
            order: [['createdAt', 'DESC']],
            where: { userId: follows.map(r=>Number(r.id)) },
        })
        .then((posts) => {
            res.send(posts);
        })

    } catch (err) {
        console.error(err);
        res.status(403).send('Error');
    }
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
                paranoid: false,
            },
            { //대표이미지하나가 안 뽑히고 다나옴,,,,
                model: PImg,
                attributes: ['id','img'],
                through: {
                    attributes: []
                },
                // limit: 1 //안먹히넴
            },
        ],
        attributes: {
            include: [
                [
                    db.sequelize.literal(`(
                        SELECT COUNT(*) FROM postLikes AS reaction WHERE reaction.postId = post.id AND reaction.deletedAt IS NULL)`), //좋아요 수 구하기!!!!
                    'likecount'
                ],
                [ 
                    db.sequelize.literal(`(
                        SELECT COUNT(*) FROM postComments AS comment WHERE comment.postId = post.id AND comment.deletedAt IS NULL)`), //댓글 수 구하기!!!!
                    'commentcount'
                ]
            ]
        },
        order: [['createdAt', 'DESC']],
        where: { id: likes.map(r => Number(r.postId)) },
    })
    .then((posts) => {
        res.send(posts);
    })
    .catch((err) => {
        console.error(err);
        res.status(403).send('Error');
    })
});

/**사용자가 올린 커뮤니티 게시글 조회 */
router.get('/user/:id', isLoggedIn, async (req, res, next) => {

    await Post.findAll({ 
        include: [
            {
                model: User,
                attributes: ['id', 'name'],
                paranoid: false,
            },
            { //대표이미지하나가 안 뽑히고 다나옴,,,,
                model: PImg,
                attributes: ['id','img'],
                through: {
                    attributes: []
                },
                // limit: 1 //안먹히넴
            },
        ],
        attributes: {
            include: [
                [
                    db.sequelize.literal(`(
                        SELECT COUNT(*) FROM postLikes AS reaction WHERE reaction.postId = post.id AND reaction.deletedAt IS NULL)`), //좋아요 수 구하기!!!!
                    'likecount'
                ],
                [ //댓글수?
                    db.sequelize.literal(`(
                        SELECT COUNT(*) FROM postComments AS comment WHERE comment.postId = post.id AND comment.deletedAt IS NULL)`), //댓글 수 구하기!!!!
                    'commentcount'
                ]
            ]
        },
        order: [['createdAt', 'DESC']],
        where: { userId: parseInt(req.params.id, 10) }
    })
    .then((posts) => {
        res.send(posts);
    })
    .catch((err) => {
        console.error(err);
        res.status(403).send('Error');
    });

})

/**게시물 내용 상세 조회 - 게시물 아이디가 파라미터로 */
router.get('/:id', async(req, res, next) => { //게시물 아이디

   await Post.findOne({ 
        include: [{
            model: User,
            attributes: ['id', 'name'],
            paranoid: false,
        },{
            model: PImg,
            attributes: ['img', 'closetId'],
            through: {
                attributes: []
            },
            include: {
                model: Closet,
                attributes: ['id'],
                paranoid: false,
                include: [{
                    model: Product,
                    paranoid: false,
                    include: [{
                        model: ImgByColor,
                        paranoid: false,
                    }],
                    through: {
                        attributes: []
                    },
                }]
            }
        },
        {
            model: PostComment,
            attributes: ['id', 'content','createdAt','updatedAt'],
            include: [{
                model: User,
                attributes: ['id', 'name'],
                paranoid: false,
            },{
                model: CImg,
                attributes: ['img', 'closetId'],
                through: {
                    attributes: []
                },
                include: {
                    model: Closet,
                    attributes: ['id'],
                    paranoid: false,
                    include: [{
                        model: Product,
                        paranoid: false,
                        include: [{
                            model: ImgByColor,
                            paranoid: false,
                        }],
                        through: {
                            attributes: []
                        }
                    }]
                }
            },],
            order: [['createdAt', 'DESC']],
        },
    ],
    attributes: {
        include: [
            [
                db.sequelize.literal(`(
                    SELECT COUNT(*) FROM postLikes AS reaction WHERE reaction.postId = post.id AND reaction.deletedAt IS NULL)`), //좋아요 수 구하기!!!!
                'likecount'
            ],
            [ 
                db.sequelize.literal(`(
                    SELECT COUNT(*) FROM postComments AS comment WHERE comment.postId = post.id AND comment.deletedAt IS NULL)`), //댓글 수 구하기!!!!
                'commentcount'
            ]
        ]
    },
        order: [['createdAt', 'DESC']],
        where: { id: parseInt(req.params.id, 10)}
    })
    .then((post) => {
        res.send(post);
    })
    .catch((err) => {
        console.error(err);
        res.status(403).send('Error');
    })
});

/**게시물의 글 수정 */
/**put vs patch 
 * put 은 자원의 전체 교체, 자원내 모든 필드 필요
 * patch 는 자원의 부분교체, 자원 내 일부 필드 필요 -- 사진은 수정안되니까 patch로 하겠음
 */
router.put('/:id', isLoggedIn, async(req, res, next) => {

    const post = await Post.findOne({ where: { id: parseInt(req.params.id, 10), userId: req.user.id  }});

    try {
        if(post == undefined) {
            res.send('없는 게시물!');
        }
        else {
            post.update({ title: req.body.title, content: req.body.content });
            res.send('수정완료');
        }
} catch (err) {
    console.error(err);
    res.status(403).send('Error');
}
});

/**커뮤니티에 등록된 게시물 삭제*/
router.delete('/:id', isLoggedIn, async (req, res, next) => {

    try {
        if(req.user.id == 17) {
            const post = await Post.findOne({ 
                include: [{
                    model: PImg,
                    attributes: ['id'],
                    through: {
                        attributes: []
                    }
                }],
                where: { id: parseInt(req.params.id,10) }});

                await post.removePimgs(post.Pimgs.map(r=>Number(r.id))); //다대다 관계의 가운데 테이블은 직접 접근할 수 없음!!!!
                await post.destroy({});

        } else {
            
            const post = await Post.findOne({ 
            include: [{
                model: PImg,
                attributes: ['id'],
                through: {
                    attributes: []
                }
            }],
            where: { id: parseInt(req.params.id,10), userId: req.user.id }});

            if(post == undefined) {
                res.send('없는 게시물');
            } else {
                console.log(post.Pimgs.map(r=>Number(r.id)));

                //연결된 사진도 삭제해버림
                //테이블이름의 맨 앞글자를 대문자로한거 + 진짜 테이블 이름
                await post.removePimgs(post.Pimgs.map(r=>Number(r.id))); //다대다 관계의 가운데 테이블은 직접 접근할 수 없음!!!!
                await post.destroy({});
            }
        }

        res.send('success');

    } catch (err) {
        console.error(err);
        res.status(403).send('Error');
    }
});

module.exports = router;