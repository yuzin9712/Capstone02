const express = require('express');
const db = require('../models');

const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

const router = express.Router();

// 테스트
function getCartByUserId(uid) {
    return new Promise((resolve, reject) => {
        let pidArr = new Array();
        let uniquePidArr = new Array();

        var query = "select * from carts where userId = ?";

        db.sequelize.query(query, {
            replacements: [uid]
        })
        .spread(function (cartsByUid) {
            if(cartsByUid.length > 0) {
                for(let i = 0; i < cartsByUid.length; i++) {
                    pidArr[i] = cartsByUid[i].productId;
                }

                uniquePidArr = Array.from(new Set(pidArr));

                resolve({ uniquePidArr: uniquePidArr, cartsByUid: cartsByUid });
            }
        })
    });
}

function getProInfoByPidQuery(productid) {
    return new Promise((resolve, reject) => {
        var query = "select * from productInfos where productId=?";

        db.sequelize.query(query, {
            replacements: [productid]
        })
        .spread(function (selected_productInfos) {
            resolve(selected_productInfos);
        }, function (err) {
            console.error(err);
            next(err);
        })
    });
}

function getProInfoByPid(productids) {
    return new Promise(async (resolve, reject) => {

        console.log('이거는뭐야..', productids);
        let result2 = [];

        for(let j = 0; j < productids.length; j++) {
            let selected_productInfos = await getProInfoByPidQuery(productids[j]);

            if(selected_productInfos.length > 0) {
                for(let k = 0; k < selected_productInfos.length; k++) {
                    result2.push(selected_productInfos[k]);
                }
            }
        }
        resolve({ result2: result2 });
    });
}

/**장바구니 조회 */
router.get('/', isLoggedIn, async (req, res, next) => {
    let uid = req.user.id;
    try {
        let result1 = await getCartByUserId(uid);
        console.log('result1 : ');
        console.dir(result1);
        console.log('result1.uniquePidArr : ');
        console.log(result1.uniquePidArr);
        console.log('result1.cartsByUid : '); 
        console.dir(result1.cartsByUid);

        let result2 = await getProInfoByPid(result1.uniquePidArr);
        console.log('results2 : '); 
        console.dir(result2);
        
        res.json({ cartsByUid : result1.cartsByUid, result2 : result2 });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'error발생' });
    }
});

/**툴바에서 장바구니 담기*/
router.post('/toolbar', isLoggedIn, async (req, res, next) => {
    var query1 = "select * from imgByColors where img = ?";
    var query2 = "select * from products, shopAdmins where products.shopAdminId = shopAdmins.id";
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
router.put('/:id', isLoggedIn, async (req, res, next) => {
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
router.post('/:id', isLoggedIn, async (req, res, next) => {
    var query1 = "select * from products, shopAdmins where products.shopAdminId = shopAdmins.id";
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
        var data = [ req.user.id, selectedProduct.id, selectedProduct.pname, req.body.cnt, selectedProduct.img, req.body.size, req.body.color ];

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