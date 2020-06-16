const express = require('express');
const db = require('../models');

const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

const router = express.Router();

//판매량많은순서대로 상품들 보냄 
router.get('/main', isLoggedIn, async(req, res, next) => {
    var query1 = "select productId from orderDetails where deletedAt is null";
    var query2 = "select cnt from orderDetails where deletedAt is null";
    var query3 = "select * from shopAdmins, products where products.shopAdminId = shopAdmins.id and products.id IN(:pArr)";
    var query4 = "select * from `imgByColors` where `productId` IN(:pArr)";
    var pidArr = [];
    var uniquePidArr = []; //pidArr의 중복을 제거한 배열
    var cntArr = [];
    var uniqueCntArr = []; //중복된 판매수는 누적시킨 배열
    var query3result;
    var query4result;

    try{

        await db.sequelize.query(query2)
        .spread(function(result){
            
            for(let i=0; i<result.length; i++){
                cntArr.push(result[i].cnt);
            }

            console.log(cntArr);

        }, function(err){
            console.error(err);
            res.status(403).send('Error');
        });

        await db.sequelize.query(query1)
        .spread(function(result){
            
            for(let i=0; i<result.length; i++){
                pidArr.push(result[i].productId);
            }

            uniquePidArr = Array.from(new Set(pidArr));
            console.log(uniquePidArr);

            for(let i = 0; i<uniquePidArr.length; i++){
                uniqueCntArr[i] = 0;
            }

            for(let i=0; i<uniquePidArr.length; i++){
                for(let j=0; j<pidArr.length; j++){
                    if(uniquePidArr[i] == pidArr[j]){
                        uniqueCntArr[i] += cntArr[j]; //parseInt(req.params.id, 10)

                    }
                }
            }
            let temp = 0;
            let temp2 = 0;
            for(let i=0; i<uniqueCntArr.length; i++){
                for(let j=0; j<uniqueCntArr.length-i-1; j++){
                    if(uniqueCntArr[j] < uniqueCntArr[j+1]){
                        temp = uniqueCntArr[j+1];
                        uniqueCntArr[j+1] = uniqueCntArr[j];
                        uniqueCntArr[j] = temp;
                        
                        temp2 = uniquePidArr[j+1];
                        uniquePidArr[j+1] = uniquePidArr[j];
                        uniquePidArr[j] = temp2;
                    }
                }
            }
        }, function (err) {
            console.error(err);
            res.status(403).send('Error');
        });

        let temp3;
        await db.sequelize.query(query3, { replacements:{pArr:uniquePidArr} })
        .spread(function(result){
            //query3result = result;
            for(let i=0; i<uniquePidArr.length; i++){
                for(let j=0; j<uniquePidArr.length; j++){
                    if(uniquePidArr[i] == result[j].id){
                        temp = result[i];
                        result[i] = result[j];
                        result[j] = temp;
                    }
                }
            }
            query3result = result;
        }, function(err){
            console.error(err);
            res.status(403).send('Error');
        });

        await db.sequelize.query(query4, { replacements:{pArr:uniquePidArr} })
        .spread(function(result){
            query4result = result;

            res.send({uniqueCntArr:uniqueCntArr, products:query3result, imgs:query4result});

        }, function(err){
            console.error(err);
            res.status(403).send('Error');
        });

    }catch(err){
        console.error(err);
        res.status(403).send('Error');
    }
});

//쇼핑몰랭킹보냄
router.get('rank', isLoggedIn, async (req, res, next) => {
    var query1 = "select productId from orderDetails where deletedAt is null";
    var query2 = "select cnt from orderDetails where deletedAt is null";
    
});



/**상품 목록 조회 */
router.get('/', isLoggedIn, async (req, res, next) => {

    var query = "select * from shopAdmins, products where products.shopAdminId = shopAdmins.id";

    var query2 = "select * from imgByColors";

    try {
        const [products, metadata1 ] = await db.sequelize.query(query);
        const [imgs, metadata2 ] = await db.sequelize.query(query2);

        res.send({ productRows: products.reverse(), imgArr: imgs });
    } catch (err) {
        console.error(err);
        res.status(403).send('Error');
    }

});

/**카테고리별 조회 */
router.get('/category/:id', isLoggedIn, async (req, res, next) => {
    var pid = [];
    var imgArr = [];
    var productRows;
    var query = "select * from shopAdmins, products where products.shopAdminId = shopAdmins.id and products.categoryId= ?";
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
        res.status(403).send('Error');
    });

    await db.sequelize.query(query2, {
        replacements: { productId: pid }
    })
    .spread(function (imgs) {
        if(imgs.length > 0) {
            for(let i = 0; i < imgs.length; i++) {
                imgArr.push(imgs[i]);
            }

            res.send({productRows: productRows.reverse(), imgArr: imgArr });
        }
        else {
            res.send({productRows: productRows.reverse(), imgArr: [] });
        }
    }, function (err) {
        console.error(err);
        res.status(403).send('Error');
    })
})

/**검색 */
router.post('/search', isLoggedIn, async (req, res, next) => {
    var query = "select * from shopAdmins, products where products.shopAdminId = shopAdmins.id and products.pname like ?";
    var keyword = req.body.keyword;

    await db.sequelize.query(query, {
        replacements: ["%" + keyword + "%"],
    })
    .spread(function (searchedProducts) {
        res.send({productRows: searchedProducts.reverse()});
    }, function (err) {
        console.error(err);
        res.status(403).send('Error');
    })
});

/**상품 상세 정보 조회*/
router.get('/:id', isLoggedIn, async (req, res, next) => {
    var productId = parseInt(req.params.id, 10);
    var query1 = "select * from shopAdmins, products where products.id = ? and products.shopAdminId = shopAdmins.id";
    var query2 = "select * from productInfos where productId =?";
    var query3 = "select * from imgByColors where productId =?";
    var query4 = "select * from reviews where productId =?";

    try {
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
    } catch (err) {
        console.error(err);
        res.status(403).send('Error');
    }


});

module.exports = router;