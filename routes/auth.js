const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { User, DesignLike, PostLike, ShopAdmin } = require('../models');

const router = express.Router();

/**회원가입 */
router.post('/join', isNotLoggedIn, async (req, res, next) => {
    const { email, name, password } = req.body;

    try {
        const exUser = await User.findOne({ where: { email } });

        /**이미 가입된 이메일인 경우 리다이렉트 */
        if(exUser) {
            req.flash('joinError', '이미 가입된 이메일입니다.');
            return res.status(403).send('이미 가입된 이메일 입니다!');
        }

        const hash = await bcrypt.hash(password, 12);

        await User.create({
            email,
            name,
            password: hash,
        });
        return res.send('success');
    } catch(err) {
        console.error(err);
        return res.status(403).send('Error');
    }
});

/**쇼핑몰이 제휴 신청 가입 */
router.post('/shop', isNotLoggedIn, async (req, res, next) => {
    const { shopname, shopurl, email, password, phone } = req.body;

    try {
        const exUser = await User.findOne({ where: { email } });

        /**이미 가입된 이메일인 경우 리다이렉트 */
        if(exUser) {
            req.flash('joinError', '이미 가입된 이메일입니다.');
            return res.status(403).send('이미 가입된 이메일 입니다!');
        }

        const hash = await bcrypt.hash(password, 12);

        const user = await User.create({
            email,
            name: shopname,
            password: hash,
            phone: phone
        });

        await ShopAdmin.create({
            shopurl,
            shopname,
            userId: user.id
        });

        return res.send('success');
    } catch(err) {
        console.error(err);
        return res.status(403).send('Error');
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
            return res.status(403).send({
              loginStatus: false,
              shopStatus: '',
              name: '존재하지 않는 유저',
              id: '',
              designLike: '',
              postLike: '',
              followingInfo: ''
          });
        }
        return req.login(user, async (loginErr) => {
            if(loginErr) {
                console.error(loginErr);
                return res.status(403).send({
                  loginStatus: false,
                  shopStatus: '',
                  name: '로그인 에러',
                  id: '',
                  designLike: '',
                  postLike: '',
                  followingInfo: ''
              });
            }
            const designlikes = await DesignLike.findAll({
                attributes: ['designId'],
                where: { userId: req.user.id }
            });
            const designLike = designlikes.map(r=>Number(r.designId));
        
            const postlikes = await PostLike.findAll({
                attributes: ['postId'],
                where: { userId: req.user.id }
            });
            const postLike = postlikes.map(r=>Number(r.postId));

            const id = req.user.id;

            const userInfo = await User.findOne({ where: { id },
                include: [{
                    model: User,
                    attributes: ['id','name'],
                    as: 'Followers',
                }, {
                    model: User,
                    attributes: ['id','name'],
                    as: 'Followings',
                }],
             });
        
            const follows = userInfo.Followings;
            const followingInfo = follows.map(r=>Number(r.id));

            if(await ShopAdmin.findOne({ //제휴 승인된 애들만 관리자로 보내줄거임.
                where: { userId: req.user.id, alianced: 1 }
            })) {
                return res.send({
                    loginStatus: true,
                    shopStatus: "shopadmin",
                    name: req.user.name,
                    id: req.user.id,
                    designLike,
                    postLike,
                    followingInfo
                });
            } else {

                if(req.user.email == "admin@naver.com") {
                    console.log('관리자');
                    return res.send({
                        loginStatus: true,
                        shopStatus: "admin",
                        name: req.user.name,
                        id: req.user.id,
                        designLike,
                        postLike,
                        followingInfo
                    });
                } else {
                    return res.send({
                        loginStatus: true,
                        shopStatus: "user",
                        name: req.user.name,
                        id: req.user.id,
                        designLike,
                        postLike,
                        followingInfo
                    });
                }
            }
        });
    })(req, res, next);
});

/**로그아웃 */
router.get('/logout', isLoggedIn, (req, res) => {
    req.logout();
    req.session.destroy();
    res.send({
        loginStatus: false,
        shopStatus: '',
        name: '',
        id: '',
        designLike: '',
        postLike: '',
        followingInfo: ''
    });
});

/**로그인 확인 */
router.get('/status', isLoggedIn, async (req, res) => {
    const designlikes = await DesignLike.findAll({
        attributes: ['designId'],
        where: { userId: req.user.id }
    });
    const designLike = designlikes.map(r=>Number(r.designId));

    const postlikes = await PostLike.findAll({
        attributes: ['postId'],
        where: { userId: req.user.id }
    });
    const postLike = postlikes.map(r=>Number(r.postId));

    const follows = req.user.Followings;
    const followingInfo = follows.map(r=>Number(r.id));

    if(await ShopAdmin.findOne({
        where: { userId: req.user.id, alianced: 1 }
    })) {
        return res.send({
            loginStatus: true,
            shopStatus: "shopadmin",
            name: req.user.name,
            id: req.user.id,
            designLike,
            postLike,
            followingInfo
        });
    } else {
        if(req.user.email == "admin@naver.com") {
            console.log('관리자');
            return res.send({
                loginStatus: true,
                shopStatus: "admin",
                name: req.user.name,
                id: req.user.id,
                designLike,
                postLike,
                followingInfo
            });
        } else {
            return res.send({
                loginStatus: true,
                shopStatus: "user",
                name: req.user.name,
                id: req.user.id,
                designLike,
                postLike,
                followingInfo
            });
        }
    }
});

/**로그인 - 카카오 */
router.get('/kakao', passport.authenticate('kakao'));

router.get('/kakao/callback', passport.authenticate('kakao', {
    failureRedirect: '/',
}), (req, res) => {
    res.redirect('/');
});

module.exports = router;