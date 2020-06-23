const express = require('express');
const db = require('../models');

const { isLoggedIn } = require('./middlewares');
const { User, ShopAdmin } = require('../models');

const router = express.Router();

/**제휴 신청 목록 조회 */
router.get('/shops', isLoggedIn, async (req, res, next) => {

    try {
        if(req.user.id == 17) {
            var query1 = "select * from users, shopAdmins where shopAdmins.alianced = 1 and users.id = shopAdmins.userId";
            var query2 = "select * from users, shopAdmins where shopAdmins.alianced = 0 and shopAdmins.deletedAt is null and users.id = shopAdmins.userId";
            
            const [alianced, metadata] = await db.sequelize.query(query1);
            const [notAlianced, metadata2] = await db.sequelize.query(query2);
    
            console.dir(alianced);
            console.dir(notAlianced);
    
            res.send({alianced: alianced, notAlianced: notAlianced});
        } else {
            throw new Error('관리자가 아닌 사용자');
        }

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

//일반유저조회
router.get('/users',isLoggedIn, async (req, res, next) => {
    
    //var query1 = "select * from users where deletedAt is null";
    var query1 = "select id,email,name, phone, provider, snsId, createdAt, updatedAt, deletedAt from users WHERE users.id NOT IN (SELECT userId FROM shopAdmins);";
    var deletedUsers = [];
    var normalUsers = [];

    try{
        if (req.user.id == 17) {
            await db.sequelize.query(query1)
            .spread(function(result){
                for(let i=0; i<result.length; i++){
                    if(result[i].deletedAt == null){
                        normalUsers.push(result[i]);
                    }else{
                        deletedUsers.push(result[i]);
                    }
                }
            });    
    
            res.send({normalUsers : normalUsers, deletedUsers : deletedUsers});
        } else {
            throw new Error('관리자가 아닌 사용자');
        }


    }catch(err){
        console.error(err);
        res.status(500).send('server_error');
    }
});

//일반유저삭제
router.post('/deleteUser', isLoggedIn, async(req, res, next) => {
    var uid = req.body.uid;
    var query1 = "UPDATE users SET deletedAt = NOW() WHERE id = ?";

    try{
        if(req.user.id == 17) {
            db.sequelize.query(query1, {replacements : [uid]})
            .spread(function(updated){
                console.dir(updated);
                res.send('user delete success');
            }, function(err){
                console.error(err);
                res.send('user delete fail');
            });
        } else {
            throw new Error('관리자가 아닌 사용자');
        }


    }catch(err){
        console.error(err);
        res.status(500).send('server_error');
    }

});

/**제휴 승인 - shopadmin의 id 값이 파라미터로 온다. */
router.get('/shops/:id', isLoggedIn, async (req, res, next) => {

    try {
        if(req.user.id == 17) {
            var query = "update shopAdmins set alianced=1 where id=?";

            await db.sequelize.query(query, {
                replacements: [parseInt(req.params.id, 10)]
            })
            .spread(function () {
                res.send('success');
            }, function (err) {
                console.error(err);
                next(err);
            })
        } else {
            throw new Error('관리자가 아닌 사용자');
        }


    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


/**제휴 끊기 - shopadmin id가 파라미터로 온다 */
router.post('/shops/:id', isLoggedIn, async (req, res, next) => {
    try {

        if(req.user.id == 17) {
            var query = "UPDATE shopAdmins SET deletedAt = NOW(), alianced = 0 WHERE id = ?";

            await db.sequelize.query(query, {
                replacements: [parseInt(req.params.id, 10)]
            })
            .spread(function () {
                res.send('success');
            }, function (err) {
                console.error(err);
                next(err);
            })
        } else {
            throw new Error('관리자가 아닌 사용자');
        }


    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;