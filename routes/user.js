const express = require('express');

const { isLoggedIn } = require('./middlewares');
const { User } = require('../models');

const router = express.Router();

/**팔로우 맺기
 * 팔로우 맺고자 하는 대상의 아이디값을 파라미터로 얻기
 */
router.post('/:id/follow', isLoggedIn, async(req, res, next) => {
    try {
        const user = await User.findOne({ where: { id: req.user.id } });
        await user.addFollowing(parseInt(req.params.id, 10));
        res.send('success');
    } catch (err) {
        console.error(err);
        next(err);
    }
});

/**팔로우 끊기
 * 버튼을 눌렀을 때 끊고자하는 대상의 아이디를 내가 얻을 수 있는가?
*/
router.delete('/:id/follow', isLoggedIn, async(req, res, next) => {
    try {
        const user = await User.findOne({where: { id: req.user.id } });
        await user.removeFollowing(parseInt(req.params.id, 10)); //다대다 관계의 가운데 테이블은 직접 접근할 수 없음!!!!
        //DELETE FROM `Follow` WHERE `followerId` = 2 AND `followingId` IN (11) 2번이 11번을 팔로우하고 있었음!!!! 나.(지울애의아이디값)
        res.send('success');
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;