const express = require('express');

const { isLoggedIn } = require('./middlewares');
const { User, ShopAdmin } = require('../models');
const db = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

/**팔로우 맺기 테스트용 팔로우 맺고자 하는 대상의 아이디값을 파라미터로 얻기
 */
router.post('/:id/follow', isLoggedIn, async(req, res, next) => {
    try {
        const user = await User.findOne({ where: { id: req.user.id } });
        const newFollower = await User.findOne({ where: { id: parseInt(req.params.id, 10) }});
        if(newFollower == undefined) {
            res.status(403).send('삭제된유저');
        } else {
            await user.addFollowing(parseInt(req.params.id, 10));
            res.send('success');
        }
    } catch (err) {
        console.error(err);
        res.status(403).send('Error');
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
        res.status(403).send('Error');
    }
});

/**각 유저의 팔로잉 팔로우 수 구하기 */
router.get('/:id', isLoggedIn, async (req, res, next) => {
    try {
        const userInfo =  await User.findOne({
            paranoid: false,
            attributes: [
                        'id','name', 'deletedAt',
                        [
                            db.sequelize.literal(`(
                                SELECT COUNT(*) FROM Follow AS Followers WHERE Followers.followingId = user.id)`), //좋아요 수 구하기!!!!
                            'Followernum' //파라미터로 주어진 사용자를 팔로잉하는 팔로워들
                        ],
                        [
                            db.sequelize.literal(`(
                                SELECT COUNT(*) FROM Follow AS Followings WHERE Followings.followerId = user.id)`), //좋아요 수 구하기!!!!
                            'Followingnum' //파라미터로 주어진 사용자가 팔로우하는 사람들
                        ],
            ],
            where: { id: parseInt(req.params.id, 10) },
            include: [{
                model: User,
                attributes: ['id','name'],
                as: 'Followers',
                through: {
                    attributes: []
                },
            }, {
                model: User,
                attributes: ['id','name'],
                as: 'Followings',
                through: {
                    attributes: []
                },
            }],
        });

        if(userInfo.deletedAt != undefined) {
            res.send({type: 'deleted', userInfo});
        } else if (await ShopAdmin.findOne({
            where: { userId: parseInt(req.params.id, 10), alianced: 1 }
        })) {
            res.send({type: 'shop', userInfo});
        } else if (await userInfo.id == 17) {
            res.send({type: 'admin', userInfo});
        } else {
            res.send({type: 'user', userInfo});
        }
    } catch (err) {
        console.error(err);
        res.status(403).send('Error');
    }
})

module.exports = router;