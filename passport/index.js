const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const { User, ShopAdmin } = require('../models');

module.exports = (passport) => {
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    /**매 요청마다 deserializeUser가 실행되고 passport.session 미들웨어가 이 메서드를 호출함
     * serializeUser에서 세션에 저장했던 아이디를 받아서 데이터베이스에서 사용자 정보 조회
     * 그 후 정보를 req.user에 저장함 --> 앞으로 req.user를 통해 로그인한 사용자의 정보 얻을 수 있음
     */
    passport.deserializeUser((id, done) => {
        /**팔로우 팔로잉 사람들 배열 함께 저장 */
            User.findOne({ where: { id },
                include: [{
                    model: User,
                    attributes: ['id','name'],
                    as: 'Followers',
                }, {
                    model: User,
                    attributes: ['id','name'],
                    as: 'Followings',
                }],
            })
            .then((user) => {
                done(null, user)
            })
            .catch((err) => {
                done(err)
            });
    });

    local(passport);
    kakao(passport);
};