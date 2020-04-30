const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Post, User, Closet, Design, Product, PostComment, Hashtag } = require('../models');
const db = require('../models');

const router = express.Router();


/**마이 페이지 이동 - 어떤 내용이 나와야하나? */
router.get('/profile', isLoggedIn, (req, res) => {
    res.render('profile', { title: '내 정보', user: req.user });
});

/**회원가입 페이지 이동*/
router.get('/join', isNotLoggedIn, (req, res) => {
    res.render('join', {
        title: '회원가입',
        user: req.user,
        joinError: req.flash('joinError'),
    });
});

/**전체 사람들 글 조회하기 */
router.get('/', (req, res, next) => {
    Post.findAll({
        include: [
            {
                model: User,
                attributes: ['id', 'name'],
            },
            {
                model: PostComment,
                attributes: ['id','img','content'],
                include: {
                    model: User,
                    attributes: ['id', 'name'],
                },
                order: [['createdAt', 'DESC']],
            },
        ],
        attributes: {
            include: [
                [
                    db.sequelize.literal(`(
                        SELECT COUNT(*) FROM postLikes AS reaction WHERE reaction.postId = post.id AND reaction.deletedAt IS NULL)`), //좋아요 수 구하기!!!!
                    'likecount'
                ]
            ]
        },
        order: [['createdAt', 'DESC']],
    })
    .then((posts) => {
            res.render('main', {
            title: 'example',
            twits: posts,
            user: req.user,
            loginError: req.flash('loginError'),
        });
        // res.send({posts});
        // console.log('1번', JSON.stringify(posts));
        console.log(`posts= ${JSON.stringify(posts)}`);
    })
    .catch((err) => {
        console.error(err);
        next(err);
    });
    // console.log(JSON.stringify(req.user));
});

router.get('/design', async (req, res, next) => {

    try {
        const designs = await Design.findAll({
            include: [{
                model: Hashtag,
                attributes: ['title'],
                through: {
                    attributes: []
                }
            },{
                model: Closet,
                attributes: ['id'],
                include: [{
                    model: Product,
                    through: {
                        attributes: []
                    }
                }]
            },{
                model: User,
                attributes: ['id', 'name']
            }],
            // attributes: {
            //     include: [
            //         [
            //             db.sequelize.literal(`(
            //                 SELECT COUNT(*) FROM designLikes AS reaction WHERE reaction.postId = post.id AND reaction.deletedAt IS NULL)`), //좋아요 수 구하기!!!!
            //             'likecount'
            //         ]
            //     ]
            // },
            order: [['createdAt', 'DESC']],
        });

        const bestDesigns = await Design.findAll({
            include: [{
                model: Hashtag,
                attributes: ['title'],
                through: {
                    attributes: []
                }
            },{
                model: Closet,
                attributes: ['id'],
                include: [{
                    model: Product,
                    through: {
                        attributes: []
                    }
                }]
            },{
                model: User,
                attributes: ['id', 'name']
            }],
            attributes: {
                include: [
                    [
                        db.sequelize.literal(`(
                            SELECT COUNT(*) FROM designLikes AS reaction WHERE reaction.designId = design.id AND reaction.deletedAt IS NULL)`), //좋아요 수 구하기!!!!
                        'likecount'
                    ]
                ]
            },
            order: [[db.sequelize.literal('likecount'), 'DESC']],
            limit: 3, //best상단 3개 고정!!
        });

        res.send({designs, bestDesigns});
    } catch (err) {
        console.error(err);
        next(err);
    }
});

/**패션 케어 커뮤니티 페이지 메인 화면 -> 현재 좋아요 수는 구현 x */
router.get('/post', (req, res, next) => {
    Post.findAll({ 
        include: [
            {
                model: User,
                attributes: ['id', 'name'],
            },
            {
                model: PostComment,
                attributes: ['id','img','content'],
                include: {
                    model: User,
                    attributes: ['id', 'name'],
                },
                order: [['createdAt', 'DESC']],
            },
        ],
        order: [['createdAt', 'DESC']],
    })
    .then((posts) => {
        // res.render('post', {
        //     title: 'example',
        //     twits: posts,
        //     user: req.user,
        //     loginError: req.flash('loginError'),
        // });
        res.send(posts);
        // console.log(`posts= ${JSON.stringify(posts)}`);
    })
    .catch((err) => {
        console.error(err);
        next(err);
    });
    // console.log(JSON.stringify(req.user));
});

/*나의 옷장 페이지*/
router.get('/closet', isLoggedIn, (req, res, next) => {
    Closet.findAll({
        include: {
            model: Product, //사용된 제품 정보도 같이 나온다.
            attributes: ['id', 'seller', 'pname', 'img', 'price', 'description'],
            through: {
                 attributes: []//relation table의 attribute는 안뽑히게함!
            }
        },
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']],
    })
    .then((closets) => {
        // res.send(closets);
            res.render('closet', {
            title: 'example',
            twits: closets,
            user: req.user,
            loginError: req.flash('loginError'),
        });
        console.log(`posts= ${JSON.stringify(posts)}`);
    })
    .catch((err) => {
        console.error(err);
        next(err);
    });
    // console.log(JSON.stringify(req.user));
});

module.exports = router;