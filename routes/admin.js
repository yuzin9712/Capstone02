const express = require('express');
const db = require('../models');

const { isLoggedIn } = require('./middlewares');
const { ShopAdmin } = require('../models');

const router = express.Router();

/**제휴 신청 목록 조회 */
router.get('/', async (req, res, next) => {
    try {
        var query1 = "select * from shopAdmins where alianced = 1";
        var query2 = "select * from shopAdmins where alianced = 0 and deletedAt is null";

        const [alianced, metadata] = await db.sequelize.query(query1);
        const [notAlianced, metadata2] = await db.sequelize.query(query2);
        
        res.send({alianced: alianced, notAlianced: notAlianced});
    } catch (err) {
        console.error(err);
        next(err);
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
        next(err);
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
        next(err);
    }
});

module.exports = router;