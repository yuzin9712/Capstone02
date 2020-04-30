const express = require('express');
const db = require('../models');

const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

const router = express.Router();

/**장바구니 조회 */
router.get('/', isLoggedIn, async (req, res, next) => {
    var query = "select * from carts where userId = ?";

    db.sequelize.query(query, {
        replacements: [req.user.id]
    })
    .spread(function (carts) {
        res.send(carts);
    },function (err) {
        console.error(err);
        next(err);
    });
});

/**툴바에서 장바구니 담기*/
router.post('/toolbar', async (req, res, next) => {
    var query1 = "select * from imgByColors where img = ?";
    var imgurl = req.body.img;
    var selectedProduct;

    await db.sequelize.query(query1, {
        replacements: [imgurl]
    })
    .spread(function (newproduct) {
        selectedProduct = newproduct[0];
        res.send(selectedProduct);
    },function (err) {
        console.error(err);
        next(err);
    });

    

    // var query2 = "select * from products where id =?";
    // var thumbnail;
    // var pname;

    // await db.sequelize.query(query2, {
    //     replacements: [selectedProduct.id]
    // })
    // .spread(function (product) {
    //     thumbnail = produtct.img;
    //     pname = product.pname;
    // },function (err) {
    //     console.error(err);
    //     next(err);
    // });

    // var data = [ 2, selectedProduct.productId, pname, 1, thumbnail, selectedProduct.color ];

    // var query3 = "insert into carts(userId, productId, pname, cnt, img, color) values (?)";
    
    // await db.sequelize.query(query3, {
    //     replacements: [data]
    // })
    // .spread(function () {
    //     res.send('success');
    // },function (err) {
    //     console.error(err);
    //     next(err);
    // });

});

/**장바구니 담기 - 상품 아이디 값이 파라미터로 넘어옴 - 사이즈 색깔도 넘어오도록 수정예정! */
router.post('/:id', isLoggedIn, async (req, res, next) => {
    var query = "insert into carts(userId, productId, pname, cnt, img) values (?)";
    var data = [ req.user.id, parseInt(req.params.id, 10), req.body.productname, req.body.cnt, req.body.img ];

    db.sequelize.query(query, {
        replacements: [ data ]
    })
    .spread(function () {
        res.send('success');
    }, function (err) {
        console.error(err);
        next(err);
    })
});

module.exports = router;