const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { User } = require('../models');

const router = express.Router();

/**회원가입 */
router.post('/join', isNotLoggedIn, async (req, res, next) => {
    const { email, name, password, phone} = req.body;

    try {
        const exUser = await User.findOne({ where: { email } });

        /**이미 가입된 이메일인 경우 리다이렉트 */
        if(exUser) {
            req.flash('joinError', '이미 가입된 이메일입니다.');
            return res.redirect('/join');
        }

        const hash = await bcrypt.hash(password, 12);

        await User.create({
            email,
            name,
            password: hash,
        });
        return res.redirect('/');
    } catch(err) {
        console.error(err);
        return next(err);
    }
});

/**로그인  - 로컬*/
router.post('/login', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local', (authErr, user, info) => {
        if(authErr) {
            console.error(authErr);
            return next(authErr);
        }
        if(!user) {
            req.flash('loginError', info.message);
            console.log('유저가 없음');
        }
        return req.login(user, (loginErr) => {
            if(loginErr) {
                console.error(loginErr);
                console.log('로그인 에러?');
            }
            const designlikes = await DesignLike.findAll({
                attributes: ['designId'],
                where: { userId: req.user.id }
            });
            const designLike = likes.map(r=>Number(r.designId));
        
            const postlikes = await PostLike.findAll({
                attributes: ['postId'],
                where: { userId: req.user.id }
            });
            const postLike = likes.map(r=>Number(r.designId));
        
            const follows = req.user.Followings;
            const followingInfo = follows.map(r=>Number(r.id));
        
            res.send({
                loginStatus: true,
                name: req.user.name,
                id: req.user.id,
                designLike,
                postLike,
                followingInfo
            });
        });
    })(req, res, next);
});

/**로그아웃 */
router.get('/logout', isLoggedIn, (req, res) => {
    req.logout();
    req.session.destroy();
    res.send({
        loginStatus: false,
        name: '',
        id: ''
    });
});

/**로그인 확인 */
router.get('/status', isLoggedIn, async (req, res) => {
    const designlikes = await DesignLike.findAll({
        attributes: ['designId'],
        where: { userId: req.user.id }
    });
    const designLike = likes.map(r=>Number(r.designId));

    const postlikes = await PostLike.findAll({
        attributes: ['postId'],
        where: { userId: req.user.id }
    });
    const postLike = likes.map(r=>Number(r.designId));

    const follows = req.user.Followings;
    const followingInfo = follows.map(r=>Number(r.id));

    res.send({
        loginStatus: true,
        name: req.user.name,
        id: req.user.id,
        designLike,
        postLike,
        followingInfo
    });
});

/**로그인 - 카카오 */
router.get('/kakao', passport.authenticate('kakao'));

router.get('/kakao/callback', passport.authenticate('kakao', {
    failureRedirect: '/',
}), (req, res) => {
    res.redirect('/');
});

module.exports = router;