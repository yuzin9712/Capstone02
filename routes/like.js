const express = require('express');

const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Post, User } = require('../models');

const router = express.Router();

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

/**좋아요 취소하기 -> 확인필요 */
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