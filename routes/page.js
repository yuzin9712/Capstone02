const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Post, User, Closet, Design, Product, PostComment, Hashtag, PImg, DesignLike, PostLike, ImgByColor } = require('../models');
const db = require('../models');
const { Op } = require('sequelize');

const router = express.Router();


/**마이 페이지 이동 - 어떤 내용이 나와야하나? */
router.get('/profile', isLoggedIn, (req, res) => {
});

/**회원가입 페이지 이동*/
router.get('/join', isNotLoggedIn, (req, res) => {
});

router.get('/design',  async (req, res, next) => {

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
            },{
                model: User,
                attributes: ['id', 'name'],
                paranoid: false,
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
            res.status(403).send('Error');
        })
});

router.get('/bestdesign',  async (req, res, next) => {
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
                paranoid: false,
                include: [{
                    model: Product,
                    paranoid: false,
                    through: {
                        attributes: []
                    }
                }]
            },{
                model: User,
                attributes: ['id', 'name'],
                paranoid: false,
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
        res.status(403).send('Error');
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
                    paranoid: false,
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
            res.send(posts);
        })

    } catch(err) {
        console.error(err);
        res.status(403).send('Error');
    }

});

/*나의 옷장 페이지*/
router.get('/closet/:id', isLoggedIn, async (req, res, next) => {
    await Closet.findAll({
        include: {
            model: Product, //사용된 제품 정보도 같이 나온다.
            attributes: ['id', 'pname', 'img', 'price', 'description'],
            paranoid: false,
            through: {
                 attributes: []//relation table의 attribute는 안뽑히게함!
            }
        },
        where: { userId: parseInt(req.params.id, 10) },
        order: [['createdAt', 'DESC']],
    })
    .then((closets) => {
        res.send(closets);
    })
    .catch((err) => {
        console.error(err);
        res.status(403).send('Error');
    });

});

module.exports = router;