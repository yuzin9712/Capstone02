const express = require('express');
const db = require('../models');
const multer = require('multer');
const path = require('path');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');

const { isLoggedIn } = require('./middlewares');
const { ShopAdmin, Order, OrderDetail, Product, User, ProductInfo, ImgByColor } = require('../models');

const router = express.Router();

AWS.config.update({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: 'ap-northeast-2',
});
//AWS.config.loadFromPath(__dirname + "/config/awsconfig.json");

const upload = multer({
    storage: multerS3({
        s3: new AWS.S3(),
        bucket: 'swcap02',
        key: function (req, file, cb) {
            // var extension = path.extname(file.originalname);
            // var basename = path.basename(file.originalname, extension);
            // cb(null, 'product/' + basename + '-' + Date.now().toString() + extension);
            cb(null, `product/${Date.now()}${path.basename(file.originalname)}`);
        },
        acl: 'public-read-write'
    })
});

// router.post('/new', async (req, res, next) => {
//     const products = req.body.products;
//     const productInfo = req.body.productInfo;

//     try {
//         const newProduct = await Product.create({
//             pname: products.productname,
//             price: products.price,
//             categoryId: products.categoryId,
//             gender: products.gender,
//             description: products.description,
//             img: products.img,
//             seller: "일단 테스트"
//         });

//         await productInfo.map(r=> ImgByColor.create({
//             color: r.color,
//             img: r.img,
//             productId: newProduct.id
//         }));

//         /**순서가..안ㅁㅏㅈ아..... */
//         await productInfo.map(async (r)=> {
//             const detail = r.detailInfo;

//            await detail.map(async (r2) => await ProductInfo.create({
//                                 color: r.color,
//                                 size: r2.size,
//                                 cnt: r2.cnt,
//                                 productId: newProduct.id 
//                             })
//         )})

//         res.send('success');

//     } catch (err) {
//         console.error(err);
//         res.status(403).send('Error');
//     }
// });

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
                where: { seller: '프롬비기닝' } //일단 이렇게 하고 db 정리 후 다시 바꿀게요!
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