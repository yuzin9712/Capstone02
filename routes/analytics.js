const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Product, ShopAdmin, OrderDetail, Order, User } = require('../models');
const db = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

/**통계 1번  -> 상품 판매 수*/
router.get('/category', async (req, res, next) => {
    try {
        const shopInfo = await ShopAdmin.findOne({
            where: { userId: 1, alianced: 1 }
        });

        await OrderDetail.findAll({
            attributes: [[db.sequelize.fn('sum', db.sequelize.col('orderDetail.cnt')), 'sales']],
            include: [{
                model: Product,
                attributes: ['categoryId'],
                where: { shopAdminId: shopInfo.id }
            }],
            group: ['product.categoryId']
        })
        .then((data) => {
            res.send(data);
        })
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

/**통계 2번  -> 상품 판매 수*/
router.get('/category/detail', async (req, res, next) => {
    try {
        const shopInfo = await ShopAdmin.findOne({
            where: { userId: 1, alianced: 1 }
        });

        const category1 = await OrderDetail.findAll({
            attributes: [[db.sequelize.fn('sum', db.sequelize.col('orderDetail.cnt')), 'sales']],
            include: [{
                model: Product,
                attributes: ['pname'],
                where: { shopAdminId: shopInfo.id, categoryId: 1 }
            }],
            group: ['product.id']
        });

        const category2 = await OrderDetail.findAll({
            attributes: [[db.sequelize.fn('sum', db.sequelize.col('orderDetail.cnt')), 'sales']],
            include: [{
                model: Product,
                attributes: ['pname'],
                where: { shopAdminId: shopInfo.id, categoryId: 2 }
            }],
            group: ['product.id']
        });

        res.send({category1, category2});

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

/**통계3  -> x 수정예정*/
//status 상관 안하고 일단 다뽑았음 .. 무슨데이터가 필요한지 모르겠음
// router.get('/sales', async (req, res, next) => {
//     try {
//         const shopInfo = await ShopAdmin.findOne({
//             where: { userId: 1, alianced: 1 }
//         });

//         await OrderDetail.findAll({
//             include: [{
//                 model: Order,
//                 attributes: ['userId'],
//                 include: {
//                     model: User,
//                     attributes: ['id', 'name']
//                 }
//             },{
//                 model: Product,
//                 where: { shopAdminId: shopInfo.id }
//             }],
//             order: [['createdAt', 'DESC']]
//         })
//         .then((sales) => {
//             res.send(sales);
//         })

//     } catch (err) {
//         console.error(err);
//         res.status(403).send('Error');
//     }
// });

/**통계 4번째  -> 상품 판매 수*/
router.get('/month', async (req, res, next) => {
    try {
        const shopInfo = await ShopAdmin.findOne({
            where: { userId: 1, alianced: 1 }
        });

        await OrderDetail.findAll({
            attributes: [
                [db.sequelize.fn("concat", db.sequelize.fn('year',db.sequelize.col('orderDetail.createdAt')),'-', db.sequelize.fn('month',db.sequelize.col('orderDetail.createdAt'))), 'ym'],
                [db.sequelize.fn('sum', db.sequelize.col('orderDetail.cnt')), 'sales']],
            include: [{
                model: Product,
                attributes: [],
                where: { shopAdminId: shopInfo.id }
            }],
            group: ['ym']
        })
        .then((data) => {
            res.send(data);
        })


    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

/**플랫폼 관리자 통계 1 -> 상품 판매 수*/
router.get('/shop', async (req, res, next) => {
    try {
        await OrderDetail.findAll({
            attributes: [[db.sequelize.fn('sum', db.sequelize.col('orderDetail.cnt')), 'sales']],
            include: [{
                model: Product,
                attributes: ['shopAdminId'],
                include: [{
                    model: ShopAdmin,
                    attributes: ['shopname']
                }]
            }],
            group: ['product.shopAdminId']
        })
        .then((data) => {
            res.send(data);
        })
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

/**플랫폼 관리자 통계 2 -> Order detail에 결제 수? Order에 결제 수? .. */
router.get('/growth/sales', async (req, res, next) => {
    try {
        await Order.findAll({
            attributes: [
                [db.sequelize.fn('concat', db.sequelize.fn('year',db.sequelize.col('order.createdAt')),'-', db.sequelize.fn('month',db.sequelize.col('order.createdAt'))), 'ym'],
                [db.sequelize.fn('count', db.sequelize.col('order.id')), 'sales']],
            group: ['ym']
        })
        .then((data) => {
            res.send(data);
        })
    } catch (err){
        console.error(err);
        res.status(500).send('Server Error');
    }
});

/**플랫폼 관리자 통계 3 -> 가입 수 구하는거 맞음?  */
router.get('/growth/users', async (req, res, next) => {
    try {
        await User.findAll({
            attributes: [
                [db.sequelize.fn('concat', db.sequelize.fn('year',db.sequelize.col('user.createdAt')),'-', db.sequelize.fn('month',db.sequelize.col('user.createdAt'))), 'ym'],
                [db.sequelize.fn('count', db.sequelize.col('user.id')), 'users']],
            group: ['ym']
        })
        .then((data) => {
            res.send(data);
        })
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
})

module.exports = router;