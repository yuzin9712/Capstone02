const express = require('express');
const db = require('../models');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const multer = require('multer');
const path = require('path');

const { isLoggedIn } = require('./middlewares');
const { ShopAdmin, Product, ProductInfo, Order, OrderDetail, User, ImgByColor } = require('../models');

const router = express.Router();

AWS.config.update({
    accessKeyId: process.env["S3_ACCESS_KEY_ID"],
    secretAccessKey: process.env["S3_SECRET_ACCESS_KEY"],
    region: 'ap-northeast-2',
});

const upload = multer({
    storage: multerS3({
        s3: new AWS.S3(),
        bucket: 'swcap02',
        key: function (req, file, cb) {
            cb(null, `product/${Date.now()}${path.basename(file.originalname)}`);
        },
        acl: 'public-read-write'
    })
});


/**S3에 업로드 */
router.post('/img', isLoggedIn, upload.array('photo', 8), async (req, res, next) => {
    console.log('/img로 들어왔음!!!!');
    console.log(req.file);

    const s3Imgs = req.files;
    const imgs = s3Imgs.map(img => img.location);

    console.log('보내는 데이터는???', imgs);

    res.json(imgs);
});

//상품업로드2
router.post('/addproduct', isLoggedIn, async (req, res, next) => {

    const shopInfo = await ShopAdmin.findOne({
        where: { userId: req.user.id, alianced: 1 }
    });

    const productname = req.body.productname;
    const price = req.body.price;
    const categoryId = req.body.categoryId;
    const gender = req.body.gender;
    const color = req.body.color;
    var colorCnt = 0;

    console.log('color : ');
    console.log(color);
    console.log('실제 컬러 수 :');
    for (var i = 0; i < color.length; i++) {
        if (color[i] != '') {
            colorCnt++;
        }
    }
    console.log(colorCnt);

    var query1 = "insert into products(pname, price, categoryId, gender, img, description, shopAdminId, createdAt) VALUES(?)";
    var query3 = "insert into productInfos(productId, color, size, cnt) VALUES (?)";
    var query4 = "insert into imgByColors(productId, img, color) VALUES (?)";
    var data; //products테이블에 들어갈 row
    var data2 = []; //productInfo테이블에 들어갈 배열
    var data3 = []; //imgByColors테이블에 들어갈 배열 
    var pid;

    if ((req.body.categoryId == 1) || (req.body.categoryId == 2)) {

        const S = req.body.S;
        const M = req.body.M;
        const L = req.body.L;
        const XL = req.body.XL;

        console.log('S : ');
        console.log(S);
        console.log('M : ');
        console.log(M);
        console.log('L : ');
        console.log(L);
        console.log('XL : ');
        console.log(XL);

        data = [productname, price, categoryId, gender, req.body.photo[0], req.body.photo[1], shopInfo.id, new Date()];

        try {

            await db.sequelize.query(query1, { replacements: [data] })
                .spread(function (inserted) {
                    if (inserted) {
                        console.log('inserted : ');
                        console.dir(inserted);
                        pid = inserted;
                    }
                }, function (err) {
                    console.error(err);
                    res.status(403).send('Error');
                });


            var k = 0;
            for (var i = 0; i < colorCnt; i++) {
                for (var j = 0; j < 4; j++) {
                    if (j == 0) {
                        if(S[i]!=0 || S[i]!=''){
                            data2[k] = [pid, color[i], 'S', S[i]];
                            k++;
                        }
                    }
                    if (j == 1) {
                        if(M[i]!=0 || M[i]!=''){
                            data2[k] = [pid, color[i], 'M', M[i]];
                            k++;
                        }
                    }
                    if (j == 2) {
                        if(L[i]!=0 || L[i]!=''){
                            data2[k] = [pid, color[i], 'L', L[i]];
                            k++;
                        }
                    }
                    if (j == 3) {
                        if(XL[i]!=0 || XL[i]!=''){
                            data2[k] = [pid, color[i], 'XL', XL[i]];
                            k++;
                        }
                    }
                }
            }
            console.log('data2 : ');
            console.log(data2);

            for (var i = 0; i < data2.length; i++) {
                await db.sequelize.query(query3, { replacements: [data2[i]] })
                    .spread(function (inserted) {
                        if (inserted) {
                            console.log('productInfo_inserted : ');
                            console.dir(inserted);
                        }
                    }, function (err) {
                        console.error(err);
                        res.status(403).send('Error');
                    });
            }

            var d = 0;
            for (var i = 0; i < colorCnt; i++) {
                data3[d] = [pid, req.body.photo[i + 2], color[i]];
                d++;
            }
            console.log('data3 : ');
            console.log(data3);

            for (var i = 0; i < d; i++) {
                await db.sequelize.query(query4, { replacements: [data3[i]] })
                    .spread(function (inserted) {
                        if (inserted) {
                            console.log('imgByColors_inserted : ');
                            console.dir(inserted);
                            //res.send('<h2>ADD PRODUCT SUCCESS</h2>');
                        }
                    }, function (err) {
                        console.error(err);
                        res.status(403).send('Error');
                    });
            }

            res.send('add product success');

        } catch (err) {
            console.error(err);
            res.status(403).send('Error');
        }
    }

    if (req.body.categoryId == 3) {//패션잡화인경우
        var cnt = req.body.cnt;
        data = [productname, price, categoryId, gender, req.body.photo[0], req.body.photo[1], shopInfo.id, new Date()];

        try {
            await db.sequelize.query(query1, { replacements: [data] })
                .spread(function (inserted) {
                    if (inserted) {
                        console.log('inserted : ');
                        console.dir(inserted);
                        pid = inserted;
                    }
                }, function (err) {
                    console.error(err);
                    res.status(403).send('Error');
                });

            var k = 0;
            for (var i = 0; i < colorCnt; i++) {

                data2[k] = [ pid, color[i], 'F', cnt[k] ];
                k++;

            }
            console.log('data2 : ');
            console.log(data2);

            for (var i = 0; i < data2.length; i++) {
                await db.sequelize.query(query3, { replacements: [data2[i]] })
                    .spread(function (inserted) {
                        if (inserted) {
                            console.log('productInfo_inserted : ');
                            console.dir(inserted);
                        }
                    }, function (err) {
                        console.error(err);
                        res.status(403).send('Error');
                    });
            }

            var d = 0;
            for (var i = 0; i < colorCnt; i++) {
                data3[d] = [pid, req.body.photo[i + 2], color[i]];
                d++;
            }
            console.log('data3 : ');
            console.log(data3);

            for (var i = 0; i < data3.length; i++) {
                await db.sequelize.query(query4, { replacements: [data3[i]] })
                    .spread(function (inserted) {
                        if (inserted) {
                            console.log('imgByColors_inserted : ');
                            console.dir(inserted);
                            //res.send('<h2>ADD PRODUCT SUCCESS</h2>');
                        }
                    }, function (err) {
                        console.error(err);
                        res.status(403).send('Error');
                    });
            }

            res.send('add product success');

        } catch (err) {
            console.error(err);
            res.status(403).send('Error');
        }

    }

    if (req.body.categoryId == 4) {//신발일 경우 
        var size = req.body.size;
        var cnt = req.body.cnt;
        var newCnt = []; //cnt에서 ''를 제거한 배열

        var sizeCnt = 0;
        console.log('size : ');
        console.log(size);
        console.log(size.length);
        for (var i = 0; i < size.length; i++) {
            if (size[i] != '') {
                sizeCnt++;
            }
        }
        console.log(sizeCnt);

        for (var i = 0; i < cnt.length; i++) {
            if ((cnt[i] != '') && (cnt[i] != 0)) {
                newCnt.push(cnt[i]);
            }
        }
        console.log(newCnt);

        data = [productname, price, categoryId, gender, req.body.photo[0], req.body.photo[1], shopInfo.id, new Date()];

        try {
            await db.sequelize.query(query1, { replacements: [data] })
                .spread(function (inserted) {
                    if (inserted) {
                        console.log('inserted : ');
                        console.dir(inserted);
                        pid = inserted;
                    }
                }, function (err) {
                    console.error(err);
                    res.status(403).send('Error');
                });

            var k = 0;
            for (var i = 0; i < colorCnt; i++) {
                for (var j = 0; j < sizeCnt; j++) {

                    data2[k] = [ pid, color[i], size[j], newCnt[k] ];
                    k++;
                }
            }
            console.log('data2 : ');
            console.log(data2);

            for (var i = 0; i < data2.length; i++) {
                await db.sequelize.query(query3, { replacements: [data2[i]] })
                    .spread(function (inserted) {
                        if (inserted) {
                            console.log('productInfo_inserted : ');
                            console.dir(inserted);
                        }
                    }, function (err) {
                        console.error(err);
                        res.status(403).send('Error');
                    });
            }

            var d = 0;
            for (var i = 0; i < colorCnt; i++) {
                data3[d] = [pid, req.body.photo[i + 2], color[i]];
                d++;
            }
            console.log('data3 : ');
            console.log(data3);

            for (var i = 0; i < data3.length; i++) {
                await db.sequelize.query(query4, { replacements: [data3[i]] })
                    .spread(function (inserted) {
                        if (inserted) {
                            console.log('imgByColors_inserted : ');
                            console.dir(inserted);
                            //res.send('<h2>ADD PRODUCT SUCCESS</h2>');
                        }
                    }, function (err) {
                        console.error(err);
                        res.status(403).send('Error');
                    });
            }

            res.send('add product success');

        } catch (err) {
            console.error(err);
            res.status(403).send('Error');
        }
    }
});

//각 쇼핑몰의 올린 모든 상품들 조회 
router.get('/productListBySeller', isLoggedIn, async(req, res, next) => {
    
    const shopInfo = await ShopAdmin.findOne({
        where: { userId: req.user.id, alianced: 1 }
    });

    var query1 = "select * from products where shopAdminId = ?";
    var query2 = "select * from `imgByColors` where `productId` IN(:productId)";
    var query3 = "select * from `productInfos` where `productId` IN(:productId)";

    var data1;//products테이블에서 꺼낸 데이터
    var pidArr = [];
    var data2;//imgByColors테이블에서 꺼낸 데이터;
    var data3;//productInfos테이블에서 꺼낸 데이터;
    
    try{
        await db.sequelize.query(query1, { replacements:[shopInfo.id] })
        .spread(function(products){
            data1 = products;
            for(var i =0; i<products.length; i++){
                pidArr.push(products[i].id);
            }
        }, function(err){
            console.error(err);
        });

        await db.sequelize.query(query2, { replacements:{productId:pidArr} })
        .spread(function(imgs){
            data2 = imgs;
        }, function(err){
            console.error(err);
        });

        await db.sequelize.query(query3, {replacements:{productId:pidArr}})
        .spread(function(infos){
            data3 = infos;
        }, function(err){
            console.error(err);
        })

        res.send({products:data1, imgs:data2, productInfos:data3});

    }catch(err){
        console.error(err);
        res.status(403).send('Error');
    }
});

//각 쇼핑몰의 올린 상품들 재고 수정
router.post('/updateCntBySeller', isLoggedIn, async(req, res) => {
    var productInfo = req.body.productInfo;
    console.log('받은 상품 정보 : ');
    console.dir(productInfo);

    var pid = productInfo.productId;
    var cnt = productInfo.cnt;
    var query = "update productInfos set cnt=? where id = ?";

    try{
        await db.sequelize.query(query, {replacements:[parseInt(cnt, 10), pid]})
        .spread(function(updated){
            console.log(updated);
        }, function(err){
            console.error(err);
        });

        res.send('update success');

    }catch(err){
        console.error(err);
        res.status(403).send('Error');
    }

});

//각 쇼핑몰의 올린 상품 삭제 
router.post('/deleteProductBySeller', isLoggedIn, async(req, res, nex) => {
    var query1 = "UPDATE productInfos SET deletedAt = NOW() WHERE productId = ?";
    var query2 = "UPDATE products SET deletedAt = NOW() WHERE id = ?";
    //var query3 = "delete from imgByColors where productId = ?";

    var pid = req.body.productId;

    try{
        await db.sequelize.query(query1, {replacements : [pid]})
        .spread(function(deleted1){
            console.log(deleted1);
        }, function(err){
            console.log(err);
        });

        await db.sequelize.query(query2, {replacements : [pid]})
        .spread(function(deleted2){
            console.log(deleted2);
            res.send('delete product success');
        }, function(err){
            console.log(err);
        });

    }catch(err){
        console.error(err);
        res.status(403).send('Error');
    }
});


/**운송장 번호 등록 - orderdetail 아이디 값이 파라미터로 옴 */
router.post('/delivery/:id', isLoggedIn, async (req, res, next) => {
    const t_invoice = req.body.invoice; //운송장 번호 입력
    const zipCode = req.body.zipCode;

    try {

        const orderdetail = await OrderDetail.findOne({
            where: { id: parseInt(req.params.id, 10) }
        });

        await orderdetail.update({
            t_invoice: t_invoice,
            zipCode: zipCode,
            status: 4 //발송
        });

        res.status(200).send('Success');

    } catch (err) {
        console.error(err);
        res.status(403).send('Error');
    }
});


// /**주문 내역  */
//미결제 -> 결제완료 -> ..
//status 상관 안하고 일단 다뽑았음 .. 무슨데이터가 필요한지 모르겠음
router.get('/orders', isLoggedIn, async (req, res, next) => {
    try {
        const shopInfo = await ShopAdmin.findOne({
            where: { userId: req.user.id, alianced: 1 }
        });

        await OrderDetail.findAll({
            include: [{
                model: Order,
                attributes: ['userId'],
                include: {
                    model: User,
                    attributes: ['id', 'name']
                }
            }, {
                model: Product,
                where: { shopAdminId: shopInfo.id }
            }],
            order: [['createdAt', 'DESC']]
        })
            .then((orders) => {
                res.send(orders);
            })
            .catch((err) => {
                console.error(err);
            })

    } catch (err) {
        console.error(err);
        res.status(403).send('Error');
    }
});

// /** 상태별 주문 조회 */
// router.get('/orders/status', async (req, res, next) => {

// })

/**각 쇼핑몰이 올린 제품 조회/ 카테고리별 x */
router.get('/products', async (req, res, next) => {
    try {
        const shopInfo = await ShopAdmin.findOne({ where: { userId: 1, alianced: 1 } });

        await Product.findAll({
            where: { shopAdminId: shopInfo.id },
            order: [['createdAt', 'DESC']]
        })
            .then((products) => {
                res.send(products);
            })

    } catch (err) {
        console.error(err);
        res.status(403).send('Error');
    }
});

module.exports = router;