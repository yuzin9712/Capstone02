const express = require('express');

const { isLoggedIn } = require('./middlewares');
const { Post, PostLike, Design, DesignLike } = require('../models');

const router = express.Router();

/**커뮤니티 게시글 좋아요 누르기 */
router.get('/post/:id',  async(req, res, next) => {
    try {
        console.log('---------좋아요 누르기------------');

        const post = await Post.findOne({ where: {id: parseInt(req.params.id, 10)}});

        if(post) {
            await PostLike.create({
                userId: 2,
                postId: parseInt(req.params.id, 10)
            });
        }

        res.redirect('/');
    } catch (err) {
        console.error(err);
        next(err);
    }
});

/**커뮤니티 게시글 좋아요 취소하기 */
router.delete('/post/:id', async(req, res, next) => {
    try {
        console.log('---------좋아요 취소하기------------');

        await PostLike.destroy({
            where: {
                userId: 2,
                postId: parseInt(req.params.id, 10),
            }
        });

        res.redirect('/');
    } catch (err) {
        console.error(err);
        next(err);
    }
});

/**커뮤니티 게시글 좋아요 누르기 */
// router.get('/design/:id', isLoggedIn, async(req, res, next) => {
//     try {
//         console.log('---------좋아요 누르기------------');

//         const design = await Design.findOne({ where: {id: parseInt(req.params.id, 10)}});

//         if(post) {
//             await Like.create({
//                 userId: req.user.id,
//                 designId: parseInt(req.params.id, 10)
//             });
//         }

//         res.redirect('/');
//     } catch (err) {
//         console.error(err);
//         next(err);
//     }
// });

// /**커뮤니티 게시글 좋아요 취소하기 */
// router.delete('/design/:id', async(req, res, next) => {
//     try {
//         console.log('---------좋아요 취소하기------------');

//         await Like.destroy({
//             where: {
//                 userId: 2,
//                 postId: parseInt(req.params.id, 10),
//             }
//         });

//         res.send('success');
//     } catch (err) {
//         console.error(err);
//         next(err);
//     }
// });

module.exports = router;