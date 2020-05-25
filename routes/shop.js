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
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
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
router.post('/addproduct', async (req, res, next) => {

    const productname = req.body.productname;
    const price = req.body.price;
    const categoryId = req.body.categoryId;
    const gender = req.body.gender;
    //const seller = req.body.seller;
    const shopAdminId = req.user.id;

    const color = req.body.color;
    const S = req.body.S;
    const M = req.body.M;
    const L = req.body.L;
    const XL = req.body.XL;
    var colorCnt = 0;

    console.log('color : ');
    console.log(color);
    console.log('실제 컬러 수 :');
    for(var i=0;i<color.length;i++){
        if(color[i]!=''){
            colorCnt++;
        }
    }
    console.log(colorCnt);

    console.log('S : ');
    console.log(S);
    console.log('M : ');
    console.log(M);
    console.log('L : ');
    console.log(L);
    console.log('XL : ');
    console.log(XL);

    // console.log("files : ");
    // console.log(req.files);
    // console.log("file 갯수 : "+req.files.length);
    // console.log('대표이미지 : ');
    // console.log(req.files[0].location);
    // console.log('상품설명이미지 : ');
    // console.log(req.files[1].location);

    var query1 = "insert into products(pname, price, categoryId, gender, img, description, shopAdminId, createdAt) VALUES(?)";
    //var query2 = "select id from products";
    // var query3 = "insert into productInfo set ?";
    // var query4 = "insert into imgByColors set ?";
    var query3 = "insert into productInfos (productId, color, size, cnt) VALUES (?)";
    var query4 = "insert into imgByColors (productId, img, color) VALUES (?)";
    var data; //products테이블에 들어갈 row
    var data2 = []; //productInfo테이블에 들어갈 배열
    var data3 = []; //imgByColors테이블에 들어갈 배열 
    var pid;

    data = [productname, price, categoryId, gender, req.body.photo[0], req.body.photo[1], shopAdminId, new Date()];

    try{
        
        await db.sequelize.query(query1, {replacements: [data]})
        .spread(function(inserted){
            if(inserted){
                console.log('inserted : ');
                console.dir(inserted);
                pid = inserted;
            }   
        }, function(err){
            console.error(err);
            next(err);
        });

        var k = 0;
        for (var i = 0; i < colorCnt; i++) {
            for (var j = 0; j < 4; j++) {
                if (j == 0) {
                    data2[k] = [pid, color[i], 'S', S[i]];
                }
                if (j == 1) {
                    data2[k] = [pid, color[i], 'M', M[i]];
                }
                if (j == 2) {
                    data2[k] = [pid, color[i], 'L', L[i]];
                }
                if (j == 3) {
                    data2[k] = [pid, color[i], 'XL', XL[i]];
                }
                k++;
            }
        }
        console.log('data2 : ');
        console.log(data2);

        for(var i=0; i<data2.length; i++){
            await db.sequelize.query(query3, {replacements:[data2[i]]})
            .spread(function(inserted){
                if(inserted){
                    console.log('productInfo_inserted : ');
                    console.dir(inserted);
                }
            }, function(err){
                console.error(err);
                next(err);
            });
        }
        
        var d = 0;
        for(var i=0; i<colorCnt; i++){
            data3[d] = [pid, req.body.photo[i+2], color[i]];
            d++;
        }
        console.log('data3 : ');
        console.log(data3);

        for(var i=0; i<d; i++){
            await db.sequelize.query(query4, {replacements:[data3[i]]})
            .spread(function(inserted){
                if(inserted){
                    console.log('imgByColors_inserted : ');
                    console.dir(inserted);
                    //res.send('<h2>ADD PRODUCT SUCCESS</h2>');
                }
            }, function(err){
                console.error(err);
                next(err);
            });
        }

        res.send('add product success');

    }catch (err) {
        console.error(err);
        next(err);
    }
});


/**운송장 번호 등록 - orderdetail 아이디 값이 파라미터로 옴 */
//??한번에 여러 개를 업데이트 할건지 물어봐야됨...
router.post('/delivery/:id', isLoggedIn, async (req, res, next) => {
    const t_invoice = req.body.invoice; //운송장 번호 입력.. --> 배송상태를 직접 수정해야하는건가..? api로 하는게아니구?

    try {
        await OrderDetail.update({
            t_invoice: t_invoice,
            status: 4 //발송
        });

    } catch (err) {
        console.error(err);
        res.status(403).send('Error');
    }
});

/**주문 내역  */
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
            },{
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
})


module.exports = router;