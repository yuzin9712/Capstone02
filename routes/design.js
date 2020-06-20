const express = require('express');
const db = require('../models/index');
const { Op } = require('sequelize');

const { isLoggedIn } = require('./middlewares');
const { User, Closet, Design, DesignLike, Hashtag, Product, ImgByColor } = require('../models');

const router = express.Router();

/**태그로 추천 디자인 게시물 검색*/ //
router.post('/hashtag', isLoggedIn, async (req, res, next) => {
    const tags = req.body.hashtag;

    if (!tags)
    {
        return res.redirect('/'); //보내는 태그 없을 시 메인페이지로 리다이렉트
    }

    try {

        const hashtag = await Hashtag.findOne({ where: { title: tags } });

        console.log('해시태그 찾을때는!?!?!!!', hashtag);

        let designs = [];

        if(hashtag == undefined) {
            console.log('그런거없음!!');
            res.send('no tag!!');
        } else {
            await hashtag.getDesigns({
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
                }, //DesignHashtag 에서 뽑히는 것 지우는 법 알아보깅..
                order: [[db.sequelize.literal('likecount'), 'DESC']],
            })
            .then((designs) => {
                res.send(designs);
            })

        }
    } catch (err) {
        console.error(err);
        res.status(403).send('Error');
    }
});

/**좋아요 많이 받은 순 게시물 조회 */
router.get('/best', isLoggedIn, async(req, res, next) => {

    try {
        await Design.findAll({
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
            order: [[db.sequelize.literal('likecount'), 'DESC']],
        })
        .then((designs) => {
            res.send(designs);
        })

    } catch(err) {
        console.error(err);
        res.status(403).send('Error');
    }
});

/**팔로우 맺은 게시물 조회 */
router.get('/followpost', isLoggedIn, async(req, res, next) => {

    try {

        const follows = req.user.Followings; //팔로우하는 애들의 아이디값 배열이여야함[{"id":10,"name":"유저1","Follow":{"createdAt":"2020-04-07T11:00:10.000Z","updatedAt":"2020-04-07T11:00:10.000Z","followingId":10,"followerId":2}},{"id":11,"name":"user2","Follow":{"createdAt":"2020-04-07T11:18:18.000Z","updatedAt":"2020-04-07T11:18:18.000Z","followingId":11,"followerId":2}}]
        console.log('이게무ㅓ냐??????????', follows.map(r=>Number(r.id))); //팔로우하는 애들의 아이디 값을 배열로 만듬!!!!!
        // console.log('follow는????',follows);

        await Design.findAll({
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
        where: { userId: follows.map(r=>Number(r.id)) },
        })
        .then((designs) => {
            res.send(designs);
        })

    } catch (err) {
        console.error(err);
        res.status(403).send('Error');
    }
});

/**좋아요한 게시물 조회 */
router.get('/like', isLoggedIn, async (req, res, next) => {

    const likes = await DesignLike.findAll({ where: { userId: req.user.id }});
    console.log('이게무ㅓ냐??????????', likes.map(r=>Number(r.designId)));

    await Design.findAll({
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
    where: { id: likes.map(r => Number(r.designId)) },
    })
    .then((designs) => {
        res.send(designs);
    })
    .catch((err) => {
        console.error(err);
        res.status(403).send('Error');
    })
});

/**사용자가 올린 게시물 조회!!!! */
router.get('/user/:id', isLoggedIn, async (req, res, next) => {
    Design.findAll({
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
    where: { userId: parseInt(req.params.id, 10) }
    })
    .then((designs) => {
        res.send(designs);
    })
    .catch((err) => {
        console.error(err);
        res.status(403).send('Error');
    })
});

/**추천코디 수정 전에 특정 게시물 내용 보내주는 부분 */
router.get('/:id', isLoggedIn,  async (req, res, next) => {
    
    Design.findOne({
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
                attributes: ['id', 'name']
            }],
        order: [['createdAt', 'DESC']],
        where: { id: parseInt(req.params.id, 10), userId: 2 },
        })
        .then((design) => {
            res.send(design);
        })
        .catch((err) => {
            console.error(err);
            res.status(403).send('Error');
        })
});

/**추천코디 태그 수정하는 부분!!!! */
router.put('/:id', isLoggedIn,  async (req, res, next) => {
    try{
        const design = await Design.findOne({ 
            include: [{
                model: Hashtag,
                attributes: ['id'],
                through: {
                    attributes: []
                }
            }],
            where: { id: parseInt(req.params.id,10), userId: req.user.id }});

        console.log('이게무슨값일까?????',design.hashtags.map(r=>Number(r.id))); //사용된 상품들의 아이디를 배열로 만들어버리기
        
        await design.removeHashtags(design.hashtags.map(r=>Number(r.id))); //태그 없애기

        const hashtags = req.body.content;
        console.log('이게해시태그임!!!!!!!!!!!!!!!!!!! ', hashtags); //[ '#토끼', '#귀여웡' ] 이렇게출력되네

        if(hashtags) {
        const result = await Promise.all(hashtags.map(tag => Hashtag.findOrCreate({
            where: { title: tag.toLowerCase() },
        })));
        // console.log("1번: ", result);
        await design.addHashtags(result.map(r => r[0])); //2차원 배열에서 1차원 배열로 만들어줌?
        // console.log("2번: ", result.map(r => r[0]));
        res.send('success');
    }} catch (err) {
        console.error(err);
        res.status(403).send('Error');
    }
});

/**추천코디에 등록된 게시물 삭제 - 관련 태그도 삭제하겠음~!~*/
router.delete('/:id',  async (req, res, next) => {
    try {

        //플랫폼 관리자면 그냥 삭제
        if(req.user.id == 17) {
            const design = await Design.findOne({ 
                include: [{
                    model: Hashtag,
                    attributes: ['id'],
                    through: {
                        attributes: []
                    }
                }],
                where: { id: parseInt(req.params.id,10) }});


            await design.removeHashtags(design.hashtags.map(r=>Number(r.id))); //다대다 관계의 가운데 테이블은 직접 접근할 수 없음!!!!
            await design.destroy({});

        } else {

            const design = await Design.findOne({ 
                include: [{
                    model: Hashtag,
                    attributes: ['id'],
                    through: {
                        attributes: []
                    }
                }],
                where: { id: parseInt(req.params.id,10), userId: req.user.id }});
    
            console.log('이게무슨값일까?????',design.hashtags.map(r=>Number(r.id))); //사용된 상품들의 아이디를 배열로 만들어버리기
            
            await design.removeHashtags(design.hashtags.map(r=>Number(r.id))); //다대다 관계의 가운데 테이블은 직접 접근할 수 없음!!!!
            await design.destroy({});

        }
        res.send('success');

    } catch (err) {
        console.error(err);
        res.status(403).send('Error');
    }

});

/**추천 코디 업로드 */
router.post('/:id', isLoggedIn, async (req, res, next) => { //이렇게 보낼 수가 있는지 물어보기
    //선택한 옷장의 아이디 값, 작성한 해시태그 내용
    //해시태그내용은 어떻게 보낼거임? 배열로 ['1번태그,'2번'] 인지 아니면 #으로 보낼건지 현재 후자로 진행중..
    try {
        const closet = await Closet.findOne({ where: { id: parseInt(req.params.id, 10)} });

        if(!closet) {
            res.send('없는 게시물인데..?');
        } else {
            const design = await Design.create({
                img: closet.img,
                userId: req.user.id,
                closetId: parseInt(req.params.id, 10)
            });

            // const hashtags = req.body.content.match(/#[^\s#]*/g);
            const hashtags = req.body.content;
            console.log('이게해시태그임!!!!!!!!!!!!!!!!!!! ', hashtags); //[ '#토끼', '#귀여웡' ] 이렇게출력되네

            if(hashtags) {
            const result = await Promise.all(hashtags.map(tag => Hashtag.findOrCreate({
                // where: { title: tag.slice(1).toLowerCase() },
                where: { title: tag.toLowerCase() },
            })));
            // console.log("1번: ", result);
            await design.addHashtags(result.map(r => r[0])); //2차원 배열에서 1차원 배열로 만들어줌?
            // console.log("2번: ", result.map(r => r[0]));
            res.send('success');
        }}
    } catch (err) {
        console.error(err);
        res.status(403).send('Error');
    }

});

module.exports = router;