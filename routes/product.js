const express = require('express');
const db = require('../models');

const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

const router = express.Router();

/**상품 목록 조회 */
router.get('/', isLoggedIn, async (req, res, next) => {

    var query = "select * from products";

    var query2 = "select * from imgByColors";

    try {
        const [products, metadata1 ] = await db.sequelize.query(query);
        const [imgs, metadata2 ] = await db.sequelize.query(query2);

        res.send({ productRows: products.reverse(), imgArr: imgs });
    } catch (err) {
        console.error(err);
        next(err);
    }

});

/**카테고리별 조회 */
router.get('/category/:id', isLoggedIn, async (req, res, next) => {
    var pid = [];
    var imgArr = [];
    var productRows;
    var query = "select * from products where categoryId= ?";
    var query2 = "select * from `imgByColors` where `productId` IN(:productId)";

    await db.sequelize.query(query, {
        replacements: [parseInt(req.params.id, 10)]
    })
    .spread(function (rows) {
        productRows = rows;

        for(var i = 0; i < productRows.length; i++) {
            pid[i] = productRows[i].id;
        }
    }, function (err) {
        console.error(err);
        next(err);
    });

    await db.sequelize.query(query2, {
        replacements: { productId: pid }
    })
    .spread(function (imgs) {
        if(imgs.length > 0) {
            for(let i = 0; i < imgs.length; i++) {
                imgArr.push(imgs[i]);
            }

            res.send({productRows: productRows, imgArr: imgArr });
        }
        else {
            res.send({productRows: productRows, imgArr: [] });
        }
    }, function (err) {
        console.error(err);
        next(err);
    })
})

/**검색 */
router.post('/search', isLoggedIn, async (req, res, next) => {
    var query = "select * from products where pname like ?";
    var keyword = req.body.keyword;

    await db.sequelize.query(query, {
        replacements: ["%" + keyword + "%"],
    })
    .spread(function (searchedProducts) {
        res.send({searched_products: searchedProducts});
    }, function (err) {
        console.error(err);
        next(err);
    })
});

/**상품 상세 정보 조회*/
router.get('/:id', isLoggedIn, async (req, res, next) => {
    var productId = parseInt(req.params.id, 10);
    var query1 = "select * from products where id = ?";
    var query2 = "select * from productInfo where productId =?";
    var query3 = "select * from imgByColors where productId =?";
    var query4 = "select * from reviews where productId =?";

    const [selectedProduct, metadata1] = await db.sequelize.query(query1, {
        replacements: [productId]
    });

    const [detail, metadata2] = await db.sequelize.query(query2, {
        replacements: [productId]
    });

    const [colors, metadata3] = await db.sequelize.query(query3, {
        replacements: [productId]
    });

    const [review, meatadata4] = await db.sequelize.query(query4, {
        replacements: [productId]
    });

    res.send({selected_product: selectedProduct, detail: detail, reviews: review, colors: colors});
});

module.exports = router;