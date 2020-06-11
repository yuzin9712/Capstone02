const express = require('express');

const { isLoggedIn } = require('./middlewares');
const { Post, PostLike, Design, DesignLike } = require('../models');

const router = express.Router();

/**커뮤니티 게시글 좋아요 누르기 */
router.get('/post/:id', isLoggedIn,  async(req, res, next) => {
    try {
        console.log('---------좋아요 누르기------------');

        const post = await Post.findOne({ where: {id: parseInt(req.params.id, 10)}});

        if(post) {
            await PostLike.create({
                userId: req.user.id,
                postId: parseInt(req.params.id, 10)
            });
        }

        res.send('success');
    } catch (err) {
        console.error(err);
        res.status(403).send('Error');
    }
});

/**커뮤니티 게시글 좋아요 취소하기 */
router.delete('/post/:id', isLoggedIn, async(req, res, next) => {
    try {
        console.log('---------좋아요 취소하기------------');

        await PostLike.destroy({
            where: {
                userId: req.user.id,
                postId: parseInt(req.params.id, 10),
            }
        });

        res.send('success');
    } catch (err) {
        console.error(err);
        res.status(403).send('Error');
    }
});

/**추천코디 게시글 좋아요 누르기 - 게시물 아이디 값이 파라미터로 옴*/
router.get('/design/:id', isLoggedIn, async(req, res, next) => {
    try {
        console.log('---------추천 코디 좋아요 누르기------------');

        const design = await Design.findOne({ where: {id: parseInt(req.params.id, 10)}});

        if(design) {
            await DesignLike.create({
                userId: req.user.id,
                designId: parseInt(req.params.id, 10)
            });
        }

        res.send('추천 코디 게시물 좋아요 누르기 성공');
    } catch (err) {
        console.error(err);
        res.status(403).send('Error');
    }
});

// /**커뮤니티 게시글 좋아요 취소하기 */
router.delete('/design/:id', isLoggedIn, async(req, res, next) => {
    try {
        console.log('---------좋아요 취소하기------------');

        await DesignLike.destroy({
            where: {
                userId: req.user.id,
                designId: parseInt(req.params.id, 10),
            }
        });

        res.send('추천 코디 게시물 좋아요 취소하기 성공');
    } catch (err) {
        console.error(err);
        res.status(403).send('Error');
    }
});

module.exports = router;