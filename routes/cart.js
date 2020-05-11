const express = require('express');
const db = require('../models');

const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

const router = express.Router();

function getCartByUserId(uid) {
    return new Promise((resolve, reject) => {
        let products = new Array();
        let newProducts = new Array();

        var query = "select * from carts where userId = ?";

        db.sequelize.query(query, {
            replacements: [uid]
        })
        .spread(function (rows) {
            if(rows.length > 0) {
                for(let i = 0; i < rows.length; i++) {
                    products[i] = rows[i].productId;
                }

                newProducts = Array.from(new Set(products));

                resolve({ newProducts: newProducts, rows: rows});
            }
        })
    });
}

function getProInfoByPidQuery(productid) {
    return new Promise((resolve, reject) => {
        var query = "select * from productInfo where productId=?";

        db.sequelize.query(query, {
            replacements: [productid]
        })
        .spread(function (data) {
            resolve(data);
        }, function (err) {
            console.error(err);
            next(err);
        })
    });
}

function getProInfoByPid(productids) {
    return new Promise(async (resolve, reject) => {

        console.log('이거는뭐야..', productids);
        let results = [];

        for(let j = 0; j < productids.length; j++) {
            let dataArr = await getProInfoByPidQuery(productids[j]);

            if(dataArr.length > 0) {
                for(let k = 0; k < dataArr.length; k++) {
                    results.push(dataArr[k]);
                }
            }
        }

        console.log('이게results@@@@@@@@@@@@@', results);

        resolve({results: results});

    });
}

/**장바구니 조회 */
router.get('/', async (req, res, next) => {
    // var query = "select * from carts where userId = ?";

    // try {
    //     await db.sequelize.query(query, {
    //         replacements: [req.user.id]
    //     })
    //     .spread(function (carts) {
    //         res.send(carts);
    //     },function (err) {
    //         console.error(err);
    //         next(err);
    //     });   
    // } catch (err) {
    //     console.error(err);
    //     next(err);
    // }
    let uid = 3;
    try {
        let result = await getCartByUserId(uid);
        console.log('result : ');
        console.dir(result);
        console.log(result.newProducts);

        let results = await getProInfoByPid(result.newProducts);
        
        console.log('results2 : '); console.dir(results);
        console.log('result.rows2 : '); console.dir(result.rows);
        res.json({ resultrows: result.rows, results: results });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'error발생' });
    }
});

/**툴바에서 장바구니 담기*/
router.post('/toolbar', async (req, res, next) => {
    var query1 = "select * from imgByColors where img = ?";
    var query2 = "select * from rows where id =?";
    var query3 = "insert into carts(userId, productId, pname, cnt, img, color) values (?)";
    var imgurl = req.body.img;
    var selectedProduct;
    var selectedProductInfo;

    try {
        await db.sequelize.query(query1, { replacements: [imgurl] })
        .spread(function(product) {
            selectedProduct = product[0];
        }, function (err) {
            console.error(err);
            next(err);
        });
        
        console.log(selectedProduct);
    
        await db.sequelize.query(query2, { replacements: [selectedProduct.productId] })
        .spread(function(productInfo) {
            selectedProductInfo = productInfo[0];
        }, function(err) {
            console.error(err);
            next(err);
        });
    
        var data = [ req.user.id, selectedProductInfo.id, selectedProductInfo.pname, 1, selectedProductInfo.img, selectedProduct.color ];
    
        await db.sequelize.query(query3, {
        replacements: [data]
        })
        .spread(function () {
            res.send('success');
        },function (err) {
            console.error(err);
            next(err);
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

/**장바구니 수정하기 - cart아이디값이 파라미터로 온다. */
router.put('/:id', async (req, res, next) => {
    var query =  "update carts set cnt=?, color=?, size=? where id = ?";
    var cnt = req.body.cnt;
    var color = req.body.color;
    var size = req.body.size;
    
    db.sequelize.query(query, {
        replacements: [cnt, color, size, parseInt(req.params.id, 10)]
    })
    .spread(function (modified) {
        console.log(modified);
        res.send('success');
    })
});

/**장바구니 담기 - 상품 아이디 값이 파라미터로 넘어옴 - 사이즈 색깔도 넘어오도록 수정예정! */
router.post('/:id', async (req, res, next) => {
    var query1 = "select * from rows where id = ?";
    var query2 = "insert into carts(userId, productId, pname, cnt, img, size, color) values (?)";
    var selectedProduct;

    try {
        await db.sequelize.query(query1, {
            replacements: [parseInt(req.params.id, 10)]
        })
        .spread(function (product) {
            selectedProduct = product[0];
        }, function (err) {
            console.error(err);
            next(err);
        });

        console.log(selectedProduct);
        var data = [ 2, selectedProduct.id, selectedProduct.pname, req.body.cnt, selectedProduct.img, req.body.size, req.body.color ];

        await db.sequelize.query(query2, {
            replacements: [ data ]
        })
        .spread(function () {
            res.send('success');
        }, function (err) {
            console.error(err);
            next(err);
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;