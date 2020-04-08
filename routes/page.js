const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Post, User, Closet } = require('../models');

const router = express.Router();


/**회원가입 - 로그인 안했을시에만 */
router.get('/profile', isLoggedIn, (req, res) => {
    res.render('profile', { title: '내 정보', user: req.user });
});

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
        include: 
            {
                model: User,
                attributes: ['id', 'name'],
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
        // console.log('1번', JSON.stringify(posts));
        console.log(`posts= ${JSON.stringify(posts)}`);
    })
    .catch((err) => {
        console.error(err);
        next(err);
    });
    // console.log(JSON.stringify(req.user));
});

/**친구들 글 보기 - 내꺼도나와야하나?????
 * 최신순정렬로 어케하지 ㅠㅠ?
*/
router.get('/followpost', isLoggedIn, async(req, res, next) => {
    
    const follows = req.user.Followings;

    const result = await Promise.all(follows.map(follow => Post.findAll({ 
        include: { model: User, attributes: ['id', 'name']},
        where: { userId: follow.id },
        // where: {
        //     userId: {
        //         [Op.or]: [ follow.id, req.user.id ] //왜안됨 ㅡㅡ
        //     }
        // },
        order: [['createdAt', 'DESC']]
    })));

    console.log("이건뭘까요오~!~!~~!~~!~!~!~!: ", JSON.stringify(result.map(r=>r[0])));

    res.render('main', {
            title: 'example',
            twits: result.map(r=>r[0]).reverse(), //최신순 정렬이 안먹혀서 지금이렇게함 ㅠㅠ
            user: req.user,
            loginError: req.flash('loginError'),
        });

    // Post.findAll({
    //     include: [{
    //         model: User,
    //         attributes: ['id', 'name'],
    //         as: 'Followers',
    //     }],
    //     order: [['createdAt', 'DESC']]
    // })
    // .then((posts) => {
    //     // res.render('main', {
    //     //     title: 'example',
    //     //     twits: posts,
    //     //     user: req.user,
    //     //     loginError: req.flash('loginError'),
    //     // });
    //     console.log('ㅡㅡㅡㅡㅡㅡㅡㅡ이거ㅡㅡㅡㅡㅡㅡㅡㅡㅡ', JSON.stringify(posts));
    // })
    // .catch((err) => {
    //     console.error(err);
    //     next(err);
    // })

})

/**내가 올린 글 보기 */
router.get('/mypost', (req, res, next) => {
    Post.findAll({ 
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']],
    })
    .then((posts) => {
        res.render('post', {
            title: 'example',
            twits: posts,
            user: req.user,
            loginError: req.flash('loginError'),
        });
        // console.log(`posts= ${JSON.stringify(posts)}`);
    })
    .catch((err) => {
        console.error(err);
        next(err);
    });
    // console.log(JSON.stringify(req.user));
});

/**옷장테스트 */
router.get('/mycloset', (req, res, next) => {
    Closet.findAll({ 
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']],
    })
    .then((closets) => {
        res.render('closet', {
            title: 'example',
            twits: closets,
            user: req.user,
            loginError: req.flash('loginError'),
        });
        // console.log(`posts= ${JSON.stringify(posts)}`);
    })
    .catch((err) => {
        console.error(err);
        next(err);
    });
    // console.log(JSON.stringify(req.user));
});

module.exports = router;