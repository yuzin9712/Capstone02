const express = require('express');
const db = require('../models');
const multer = require('multer');
const path = require('path');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');

const { isLoggedIn } = require('./middlewares');
const { ShopAdmin, OrderDetail, Product, User } = require('../models');

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

/**카테고리별 판매 제품 */
router.get('/', async (req, res, next) => {
    /**deserialize 이걸로 바꾸기 */
    // await User.findOne({ where: { id: 12 },
    //     include: [
    //     {
    //         model: ShopAdmin,
    //         attributes: ['id', 'shopname']
    //     },{
    //         model: User,
    //         attributes: ['id','name'],
    //         as: 'Followers',
    //     }, {
    //         model: User,
    //         attributes: ['id','name'],
    //         as: 'Followings',
    //     }],
    //  })

    console.log(req.user);
    res.send(req.user);


});

router.post('/test', async (req, res, next) => {
    console.log(req.body.productInfo[0].detailInfo);
    res.send(req.body);
})

/**이미지 업로드 */
// router.post('/img', isLoggedIn, upload.array('photo', 8), async (req, res, next) => {
//     console.log('/img로 들어왔음!!!!');
//     console.log(req.file);

//     const s3Imgs = req.files;
//     const imgs = s3Imgs.map(img => img.location);

//     res.json(imgs);
// });

//상품업로드2
// router.post('/addproduct', isLoggedIn, async (req, res, next) => {

//     const productname = req.body.productname;
//     const price = req.body.price;
//     const categoryId = req.body.categoryId;
//     const createdAt = req.body.createdAt;
//     const gender = req.body.gender;
//     const seller = '테스트샾';

//     const color = req.body.color;
//     const S = req.body.S;
//     const M = req.body.M;
//     const L = req.body.L;
//     const XL = req.body.XL;
//     var colorCnt = 0;

//     console.log('color : ');
//     console.log(color);
//     console.log('실제 컬러 수 :');
//     for(var i=0;i<color.length;i++){
//         if(color[i]!=''){
//             colorCnt++;
//         }
//     }
//     console.log(colorCnt);

//     console.log('S : ');
//     console.log(S);
//     console.log('M : ');
//     console.log(M);
//     console.log('L : ');
//     console.log(L);
//     console.log('XL : ');
//     console.log(XL);

//     // console.log("files : ");
//     // console.log(req.files);
//     // console.log("file 갯수 : "+req.files.length);
//     // console.log('대표이미지 : ');
//     // console.log(req.files[0].location);
//     // console.log('상품설명이미지 : ');
//     // console.log(req.files[1].location);

//     var query1 = "insert into products(pname, price, categoryId, gender, img, description) VALUES(?)";
//     var query2 = "select id from products";
//     var query3 = "insert into productInfo set ?";
//     var query4 = "insert into imgByColors set ?";
//     var data; //products테이블에 들어갈 row
//     var data2 = []; //productInfo테이블에 들어갈 배열
//     var data3 = []; //imgByColors테이블에 들어갈 배열 
//     var pid;
//     data = [productname, price, categoryId, gender, req.body.photo[0], req.body.photo[1]];

//     try{
//         await db.sequelize.query(query1, {replacements: [data]})
//         .spread(function(inserted){
//             if(inserted){
//                 console.log('inserted : ');
//                 console.dir(inserted);
//             }   
//         }, function(err){
//             console.error(err);
//             next(err);
//         });

//         await db.sequelize.query(query2)
//         .spread(async (pids) => {
//             console.log('pids : ');
//             console.dir(pids);
//             if(pids.length > 0){
//                 pid = pids.length;
//                 console.log('pid :'+pid);
//             }else{
//                 pid = 1;
//                 console.log('pid :'+pid);
//             }
//             var k = 0;
//             for(var i=0; i<colorCnt; i++){
//                 for(var j=0; j<4; j++){
//                     if(j==0){
//                         data2[k] = {productId:pid, color:color[i], size:'S', cnt:S[i]};
//                     }
//                     if(j==1){
//                         data2[k] = {productId:pid, color:color[i], size:'M', cnt:M[i]};
//                     }
//                     if(j==2){
//                         data2[k] = {productId:pid, color:color[i], size:'L', cnt:L[i]};
//                     }
//                     if(j==3){
//                         data2[k] = {productId:pid, color:color[i], size:'XL', cnt:XL[i]};
//                     }
//                     k++;
//                 }
//             }
//             console.log('data2 : ');
//             console.log(data2);

//             for(var i=0; i<k; i++){
//                 await db.sequelize.query(query3, {replacements:[data2[i]]})
//                 .spread(function(inserted){
//                     if(inserted){
//                         console.log('productInfo_inserted : ');
//                         console.dir(inserted);
//                     }
//                 }, function(err){
//                     console.error(err);
//                     next(err);
//                 });
//             }
            
//             var d = 0;
//             for(var i=0; i<colorCnt; i++){
//                 data3[d] = {productId:pid, img:req.body.photo[i+2], color:color[i]};
//                 d++;
//             }
//             console.log('data3 : ');
//             console.log(data3);

//             for(var i=0; i<d; i++){
//                 await db.sequelize.query(query4, {replacements:[data3[i]]})
//                 .spread(function(inserted){
//                     if(inserted){
//                         console.log('imgByColors_inserted : ');
//                         console.dir(inserted);
//                         res.send('<h2>ADD PRODUCT SUCCESS</h2>');
//                     }
//                 }, function(err){
//                     console.error(err);
//                     next(err);
//                 });
//             }
            
//         }, function(err){
//             console.log(err);
//             next(err);
//         });

//     }catch (err) {
//         console.error(err);
//         next(err);
//     }
// });





module.exports = router;