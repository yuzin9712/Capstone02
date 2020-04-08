const express = require('express');

const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { User, Follow } = require('../models');

const router = express.Router();

/**팔로우 맺기 */
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
        await user.removeFollowing(parseInt(req.params.id, 10));
        res.send('success');
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;