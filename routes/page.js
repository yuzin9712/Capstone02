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

/**친구들 + 나 올린글 보기 */
router.get('/followpost', (req, res, next) => {
    Post.findAll({
/**수정중 */
    })
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