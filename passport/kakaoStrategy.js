const KakaoStrategy = require('passport-kakao').Strategy;

const { User } = require('../models');

module.exports = (passport) => {
    passport.use(new KakaoStrategy({
        clientID: process.env["KAKAO_ID"],
        callbackURL: 'http://www.softjs2.com/api/auth/kakao/callback',
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const exUser = await User.findOne({ where: { snsId: profile.id, provider: 'kakao' } });

            if(exUser) {
                done(null, exUser);
            } else {
                const newUser = await User.create ({
                    email: profile._json && profile._json.kaccount_email,
                    name: profile.displayName,
                    snsId: profile.id,
                    provider: 'kakao',
                });
                done(null, newUser);
            }
        } catch(err) {
            console.error(err);
            done(err);
        }
    }));
};