const express = require('express');
const db = require('../models');

const { isLoggedIn } = require('./middlewares');
const { ShopAdmin } = require('../models');

const router = express.Router();

/**제휴 신청 목록 조회 */
router.get('/', async (req, res, next) => {


    try {
        var query1 = "select * from shopAdmins, users where shopAdmins.alianced = 1 and users.id = shopAdmins.userId";
        var query2 = "select * from shopAdmins, users where shopAdmins.alianced = 0 and shopAdmins.deletedAt is null and users.id = shopAdmins.userId";

        const [alianced, metadata] = await db.sequelize.query(query1);
        const [notAlianced, metadata2] = await db.sequelize.query(query2);

        console.dir(alianced);
        console.dir(notAlianced);

        res.send({alianced: alianced, notAlianced: notAlianced});
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

/**제휴 승인 - shopadmin의 id 값이 파라미터로 온다. */
router.get('/:id', async (req, res, next) => {

    try {
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

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

/**제휴 끊기 - shopadmin id가 파라미터로 온다 */
router.post('/:id', async (req, res, next) => {
    try {
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

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;