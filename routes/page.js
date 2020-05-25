const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Post, User, Closet, Design, Product, PostComment, Hashtag, PImg, DesignLike, PostLike } = require('../models');
const db = require('../models');
const { Op } = require('sequelize');

const router = express.Router();


/**마이 페이지 이동 - 어떤 내용이 나와야하나? */
router.get('/profile', isLoggedIn, (req, res) => {
});

/**회원가입 페이지 이동*/
router.get('/join', isNotLoggedIn, (req, res) => {
});

/**전체 사람들 글 조회하기 */
// router.get('/', (req, res, next) => {
//     Post.findAll({
//         include: [
//             {
//                 model: User,
//                 attributes: ['id', 'name'],
//             },
//             {
//                 model: PImg,
//                 attributes: ['img'],
//                 through: {
//                     attributes: [],
//                 }
//             },
//             // {
//             //     model: PostComment,
//             //     attributes: ['id','img','content'],
//             //     include: {
//             //         model: User,
//             //         attributes: ['id', 'name'],
//             //     },
//             //     order: [['createdAt', 'DESC']],
//             // },
//         ],
//         attributes: {
//             include: [
//                 [
//                     db.sequelize.literal(`(
//                         SELECT COUNT(*) FROM postLikes AS reaction WHERE reaction.postId = post.id AND reaction.deletedAt IS NULL)`), //좋아요 수 구하기!!!!
//                     'likecount'
//                 ]
//             ]
//         },
//         order: [['createdAt', 'DESC']],
//     })
//     .then((posts) => {
//         //     res.render('main', {
//         //     title: 'example',
//         //     twits: posts,
//         //     user: req.user,
//         //     loginError: req.flash('loginError'),
//         // });
//         res.send(posts);
//         // console.log('1번', JSON.stringify(posts));
//         console.log(`posts= ${JSON.stringify(posts)}`);
//     })
//     .catch((err) => {
//         console.error(err);
//         next(err);
//     });
//     // console.log(JSON.stringify(req.user));
// });

router.get('/design',isLoggedIn, async (req, res, next) => {

    // try {

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
            attributes: {
                include: [
                    [
                        db.sequelize.literal(`(
                            SELECT COUNT(*) FROM designLikes AS reaction WHERE reaction.designId = design.id AND reaction.deletedAt IS NULL)`), //좋아요 수 구하기!!!!
                        'likecount'
                    ]
                ]
            },
            order: [['createdAt', 'DESC']],
        })
        .then((designs) => {
            res.send(designs);
        })
        .catch((err) => {
            console.error(err);
            next(err);
        })

    //     res.send(designs);
    // } catch (err) {
    //     console.error(err);
    //     next(err);
    // }
});

router.get('/bestdesign',isLoggedIn, async (req, res, next) => {
    try {
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

        res.send(bestDesigns);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

/**패션 케어 커뮤니티 페이지 메인 화면*/
router.get('/post', isLoggedIn, async (req, res, next) => {
    
    try {

        await Post.findAll({ 
            include: [
                {
                    model: User,
                    attributes: ['id', 'name'],
                },
                { //대표이미지하나가 안 뽑히고 다나옴,,,,
                    model: PImg,
                    attributes: ['id','img'],
                    through: {
                        attributes: []
                    },
                    // limit: 1
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
    } catch(err) {
        console.error(err);
        next(err);
    }

});

/*나의 옷장 페이지*/
router.get('/closet', isLoggedIn, async (req, res, next) => {
    await Closet.findAll({
        include: {
            model: Product, //사용된 제품 정보도 같이 나온다.
            attributes: ['id', 'pname', 'img', 'price', 'description'],
            through: {
                 attributes: []//relation table의 attribute는 안뽑히게함!
            }
        },
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']],
    })
    .then((closets) => {
        res.send(closets);

        // console.log(`posts= ${JSON.stringify(posts)}`);
    })
    .catch((err) => {
        console.error(err);
        next(err);
    });
    // console.log(JSON.stringify(req.user));
});

module.exports = router;