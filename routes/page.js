const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Post, User } = require('../models');

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

router.get('/', (req, res, next) => {
    Post.findAll({
        include: [{
            model: User,
            attributes: ['id', 'name'],
        }],
        order: [['createdAt', 'DESC']],
    })
    .then((posts) => {
        // res.render('main', {
        //     title: 'example',
        //     twits: posts,
        //     user: req.user,
        //     loginError: req.flash('loginError'),
        // });
        // console.log('1번', posts);
        console.log(`posts= ${JSON.stringify(posts)}`);
        res.send(posts);
    })
    .catch((err) => {
        console.error(err);
        next(err);
    });
});

// router.get('/', (req, res, next) => {
//     res.render('main', {
//         title: 'zz',
//         twits:[],
//         user: req.user,
//         loginError: req.flash('loginError'),
//     });
// });

module.exports = router;