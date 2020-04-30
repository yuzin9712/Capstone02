const express = require('express');
const db = require('../models');

const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

const router = express.Router();

/**상품 목록 조회 */
router.get('/', async (req, res, next) => {

    var query = "select * from products";

    db.sequelize.query(query)
    .spread(function (list) {
        res.send(list);
    },function (err) {
        console.error(err);
        next(err);
    });

});

/**상의 조회 */
router.get('/top', async (req, res, next) => {

    var query = "select * from products where categoryId = 1";

    const [results, metadata] = await db.sequelize.query(query);
    res.send(results);

});

/**하의 조회 */
router.get('/bottom', async (req, res, next) => {

    var query = "select * from products where categoryId = 2";

    const [results, metadata] = await db.sequelize.query(query);
    res.send(results);

});

/**검색 */
router.post('/search', async (req, res, next) => {
    var query = "select * from products where pname like ?";
    var keyword = req.body.keyword;

    await db.sequelize.query(query, {
        replacements: ["%" + keyword + "%"],
    })
    .spread(function (products) {
        res.send(products);
    }, function (err) {
        console.error(err);
        next(err);
    })
});

/**상품 상세 정보 조회 - 수정 예정 */
router.get('/:id', async (req, res, next) => {
    var productId = parseInt(req.params.id, 10);
    var query1 = "select * from products where id = ?";
    var selected_product;

    var query2 = "select * from reviews where productId =?";
    var reviews;

    await db.sequelize.query(query1, {
        replacements: [productId]
    })
    .spread(function (product) {
        selected_product = product;
    }, function (err) {
        console.error(err);
        next(err);
    });

    await db.sequelize.query(query2, {
        replacements: [productId]
    })
    .spread(function (reviewlist) {
        reviews = reviewlist;
    }, function (err) {
        console.error(err);
        next(err);
    });

    res.send({ result: selected_product, rows: reviews }); //user정보 아직 안보냄
});

module.exports = router;