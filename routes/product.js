const express = require('express');
const db = require('../models');
const { Product, ShopAdmin, OrderDetail, ImgByColor, ProductInfo } = require('../models');
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
                        temp3 = result[i];
                        result[i] = result[j];
                        result[j] = temp3;
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
            console.dir(query3result);
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
router.get('/rank', isLoggedIn, async (req, res, next) => {
    var query1 = "select productId from orderDetails where deletedAt is null";
    var query2 = "select cnt from orderDetails where deletedAt is null";
    var query3 = "select shopAdminId from products where id IN(:pArr)";
    var query4 = "select * from shopAdmins where id IN(:sArr)";
    var pidArr = [];
    var uniquePidArr = []; //pidArr의 중복을 제거한 배열
    var cntArr = [];
    var uniqueCntArr = []; //중복된 판매수는 누적시킨 배열
    var shopAdminIdArr = [];
    var uniqueShopAdminIdArr = [];
    var cntByShopIdArr = [];
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
        });

        await db.sequelize.query(query3, { replacements:{pArr:uniquePidArr}})
        .spread(function(result){

            for(let i=0; i<result.length; i++){
                shopAdminIdArr.push(result[i].shopAdminId);
            }

            uniqueShopAdminIdArr = Array.from(new Set(shopAdminIdArr));
            console.log(uniqueShopAdminIdArr);

            for(let i=0; i<uniqueShopAdminIdArr.length; i++){
                cntByShopIdArr[i] = 0;
            }

            for(let i=0; i<uniqueShopAdminIdArr.length; i++){
                for(let j=0; j<shopAdminIdArr.length; j++){
                    if(uniqueShopAdminIdArr[i] == shopAdminIdArr[j]){
                        cntByShopIdArr[i] += uniqueCntArr[j];
                    }
                }
            }

            //uniqueShopIdArr와 cntByShopArr를 내림차순으로 정렬
            let t;
            let u;
            for(let i=0; i<cntByShopIdArr.length; i++){
                for(let j=0; j<cntByShopIdArr.length-i-1; j++){
                    if(cntByShopIdArr[j] < cntByShopIdArr[j+1]){
                        t = cntByShopIdArr[j];
                        cntByShopIdArr[j] = cntByShopIdArr[j+1];
                        cntByShopIdArr[j+1] = t;

                        u = uniqueShopAdminIdArr[j];
                        uniqueShopAdminIdArr[j] = uniqueShopAdminIdArr[j+1];
                        uniqueShopAdminIdArr[j+1] = u;
                    }
                }
            }
        });

        let k;
        await db.sequelize.query(query4, { replacements:{sArr:uniqueShopAdminIdArr}})
        .spread(function(result){
            for(let i=0; i<uniqueShopAdminIdArr.length; i++){
                for(let j=0; j<result.length; j++){
                    if(uniqueShopAdminIdArr[i] == result[j].id){
                        t = result[j];
                        result[j] = result[i];
                        result[i] = t;
                    }
                }
            }
            query4result = result;
            res.send({shoprank : query4result, uniqueShopAdminIdArr:uniqueShopAdminIdArr, cntByShopIdArr:cntByShopIdArr});
        });
    }catch(err){
        console.error(err);
        res.status(403).send('Error');
    }
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
    var query = "select * from shopAdmins, products where products.shopAdminId = shopAdmins.id and products.categoryId = ?";
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
});

//카테고리별 베스트상품리스트 조회
router.get('/categoryBest/:id', isLoggedIn, async(req, res, next) => {

    var query1 = "select productId from orderDetails where deletedAt is null";
    var query2 = "select cnt from orderDetails where deletedAt is null";
    var query5 = "select categoryId from products where id = ?";

    var query3 = "select * from shopAdmins, products where products.shopAdminId = shopAdmins.id and products.id IN(:pArr)";
    var query4 = "select * from `imgByColors` where `productId` IN(:pArr)";
    //var query4 = "select * from imgByColors, products where imgByColors.productId = products.id and products.categoryId = ?";
    //var query5 = "select * from products where categoryId = ?";
    var query6 = "select * from shopAdmins, products where products.shopAdminId = shopAdmins.id and products.categoryId = ?";

    var pidArr = [];
    var uniquePidArr = []; //pidArr의 중복을 제거한 배열
    var cntArr = [];
    var uniqueCntArr = []; //중복된 판매수는 누적시킨 배열
    var categoryArr = [];
    
    var query3result = [];
    var query4result = [];
    var query6result = [];

    var cid = req.params.id;
    var realPidArr = [];
    var realCntArr = [];

    var pid = [];
    var productsRemainder = [];

    console.log('cid : '+cid);

    try{

        await db.sequelize.query(query2)
        .spread(function(result){
            
            for(let i=0; i<result.length; i++){
                cntArr.push(result[i].cnt);
            }

            console.log(cntArr);

        }, function(err){
            console.error(err);
            res.status(403).send('query2 Error');
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

            console.log('uniqueCntArr : '+uniqueCntArr);

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
            res.status(403).send('query1 Error');
        });

        console.log('uniqueCntArr : ' + uniqueCntArr);
        console.log('uniquePidArr : ' + uniquePidArr);

        for (let i = 0; i < uniquePidArr.length; i++) {
            await db.sequelize.query(query5, { replacements: [uniquePidArr[i]] })
            .spread(function (result) {
                categoryArr.push(result[0].categoryId);     
            });
        }
        console.log('categoryArr : '+categoryArr);

        for(let i=0; i < categoryArr.length; i++){
            if(parseInt(cid, 10) == categoryArr[i]){
                realPidArr.push(uniquePidArr[i]);
                realCntArr.push(uniqueCntArr[i]);
            }
        }

        console.log('realPidArr : '+realPidArr);
        console.log('realCntArr : '+realCntArr);

        let pro;
        if (realPidArr.length != 0) {
            await db.sequelize.query(query3, { replacements: { pArr: realPidArr } })
                .spread(function (result) {
                    for (let i = 0; i < result.length; i++) {
                        for (let j = 0; j < result.length; j++) {
                            if (realPidArr[i] == result[j].id) {
                                pro = result[i];
                                result[i] = result[j];
                                result[j] = pro;
                            }
                        }
                    }
                    query3result = result;
                    console.log(query3result);
                }, function (err) {
                    console.error(err);
                    res.status(403).send('query3 Error');
                });
        }
        
        await db.sequelize.query(query6, { replacements : [parseInt(cid, 10)]})
        .spread(function(result){

            for(let k = 0; k<result.length; k++){
                pid.push(result[k].id);
            }

            query6result = result;

        },  function(err){
            console.error(err);
            res.status(403).send('query6 Error');
        });

        if (query3result.length > 0) {
            let index = 0;
            await db.sequelize.query(query6, { replacements: [parseInt(cid, 10)] })
                .spread(function (result) {

                    for (let i = 0; i < result.length; i++) {
                        for (let j = 0; j < query3result.length; j++) {
                            index = j;
                            if (result[i].id == query3result[j].id) {      
                                break;
                            }
                        }
                        if(index >= query3result.length - 1){
                            query3result.push(result[i]);
                        }
                    }

                }, function (err) {
                    console.error(err);
                    res.status(403).send('query6 Error');
                });
        }

        await db.sequelize.query(query4, { replacements : {pArr : pid}})
        .spread(function(result){
            if(realPidArr.length > 0){
                res.send({products : query3result, imgs : result});
            }
            else{
                res.send({products : query6result, imgs : result});
            }
        }, function(err){
            console.error(err);
            res.status(403).send('query4 Error');
        });

    }catch(err){
        console.error(err);
        res.status(403).send('catch Error');
    }

});


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

/**판매순 정렬 아직 imgbycolor랑 productinfo는 같이 안보내주고 있음 ..아직 ㄴㄴ */
// router.get('/sales/:id', async (req, res, next) => {
//     try {
//         await Product.findAll({
//             attributes: {
//                 include: [
//                     [db.sequelize.fn('ifnull', db.sequelize.fn('sum', db.sequelize.col('orderDetails.cnt')),0), 'salesnum']
//                 ]
//             },
//             include: [{
//                 model: ShopAdmin,
//                 attributes: ['id','shopurl','shopname'],
//             },{
//                 model: OrderDetail,
//                 attributes: []
//             }],
//             group: ['product.id'],
//             order: [[db.sequelize.col('salesnum'), 'DESC']],
//             where: { categoryId: parseInt(req.params.id, 10)}
//         })
//         .then((products) => {
//             res.send(products);
//         })
//     } catch (err) {
//         console.error(err);
//         res.status(403).send('Error');
//     }
// })

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