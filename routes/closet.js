const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');

const { Closet, Product } = require('../models');
const { isLoggedIn } = require('./middlewares');

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
        key(req, file, cb) {
            cb(null, `closet/${Date.now()}${path.basename(file.originalname)}`);
        },
    }),
    limits: { fileSize: 25 * 1024 * 1024 }, //25MB
});

router.post('/img', isLoggedIn, upload.single('img'), (req, res, next) => {
    console.log('/img로 들어왔음!!!');
    console.log(req.file);
    res.json({ url: req.file.location }); //S3버킷에 이미지주소
});

const upload2 = multer();

/**나의 옷장에 저장하기!!!!!!!
 * 옷 입히기 해서 사진은 저장하고 제품 내용도 저장!! */
router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => {
    try {
        console.log('---------------시작------------')
        //사용된 물품의 아이디를 배열로 받아온다 ? 그리고 받아온 사진도 저장한다.
        const closet = await Closet.create({
            img: req.body.url,
            userId: req.user.id,
        });

        const products = [ 1, 2, 3 ]; //사용된 제품의 아이디를 배열로 담아와서 저장하겠다.

        const result = await Promise.all(products.map(product => Product.findOne({
            where: { id: product },
        })));
        // console.log("1번: ", result);
        await closet.addProducts(result.map(r => r[0])); //2차원 배열에서 1차원 배열로 만들어줌?
        // console.log("2번: ", result.map(r => r[0]));
        
        //relation 테이블에 제품의 아이디가 담기게 하기
        res.redirect('/mycloset');
    } catch (err) {
        console.error(err);
        next(err);
    }
});

/**해당 코디에 사용된 제품 불러오기!!!! */
router.get('/:id', isLoggedIn, async(req, res, next) => {

    try {
        // const hashtag = await Hashtag.findOne({ where: { title: tags } });

        // let posts = [];

        // if (hashtag) {
        //     posts = await hashtag.getPosts({ include: [{ model: User }] });
        // }
        // return res.render('main', {
        //     title: `${tags} 찾기`,
        //     user: req.user,
        //     twits: posts,
        // });
        
    } catch (err) {
        console.error(err);
        return next(err);
    }
    
})

module.exports = router;