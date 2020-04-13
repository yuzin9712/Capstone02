const express = require('express');

const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Post, User } = require('../models');

const router = express.Router();

/**좋아요 누른 게시물만 나와!!!!!! */
router.get('/', isLoggedIn, async(req, res, next) => {
    
    try {
        const user = await User.findOne({where: { id: req.user.id } });

        let likes = [];
    
        if(user) {
            likes = await user.getPosts({});
        }
        return res.send(likes);
    } catch (err) {
        console.error(err);
        next(err);
    }

});

/**좋아요 수 세기 찾아봐 ㅠㅠㅠㅠㅠㅠ 미쳣어 */

/**좋아요 누르기 */
router.get('/:id', isLoggedIn, async(req, res, next) => {
    try {
        console.log('---------좋아요 누르기------------');
        const user = await User.findOne({ where: { id: req.user.id } });

        await user.addPosts(parseInt(req.params.id, 10));

        res.send('success');
    } catch (err) {
        console.error(err);
        next(err);
    }
});

/**좋아요 취소하기 */
router.delete('/:id', isLoggedIn, async(req, res, next) => {
    try {
        console.log('---------좋아요 취소하기------------');
        const user = await User.findOne({ where: { id: req.user.id } });

        await user.removePosts(parseInt(req.params.id, 10));
        res.send('success');
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;