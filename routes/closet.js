const express = require('express');
const multer = require('multer');
const path = require('path');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');

const { Closet, Product, ImgByColor } = require('../models');
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

/**옷장 이미지 S3에 업로드 */
router.post('/img', isLoggedIn, upload.single('img'), (req, res, next) => {
    console.log('/img로 들어왔음!!!');
    console.log(req.file);
    res.json({ url: req.file.location }); //S3버킷에 이미지주소 front에 보내서 미리보기로 보여주는 역할
});

const upload2 = multer();

/**나의 옷장에 사진과 함께 사용된 제품 아이디 저장*/
router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => {
    try {
        console.log('---------------시작------------')
        //사용된 물품의 아이디를 배열로 받아온다 ? 그리고 받아온 사진도 저장한다.
        const closet = await Closet.create({
            img: req.body.url,
            userId: req.user.id,
        });

        // const products = [ 1, 3, 5, 6 ]; //사용된 제품의 아이디를 배열로 담아와서 저장하겠다.
        const products = ['testurl', 'testtest'];//이미지 url 배열이 들어오기로 되었음!!!                                                                 

        //그러면 imgbycolor테이블에서 img url이 받아온 값과 같은 걸 찾아내고...
        const result = await Promise.all(products.map(product => ImgByColor.findOne({
            where: { img: product },
        }))); //id 맞는 제품들을 조회하겠다!!
        //
        // res.send(result);
        // console.log("1번: ???????????????????", result);
        await closet.addProducts(result.map(r=>Number(r.productId)));
        // console.log("2번: !!!!!!!!!!!!!!!!!!", result.map(r => r[0]));
        
        //relation 테이블에 제품의 아이디가 담기게 하기
        res.redirect('/closet');
    } catch (err) {
        console.error(err);
        next(err);
    }
});

/**나의 옷장에 저장된 게시물들의 사진을 조회 - 나의옷장에서 선택하기 실행시 */
router.get('/all', isLoggedIn, async (req, res, next) => {
    Closet.findAll({
        where: { userId: req.user.id },
        attributes: ['id', 'img'],
        order: [['createdAt', 'DESC']],
    })
    .then((imgs) => {
        res.send(imgs);
    })
    .catch((err) => {
        console.error(err);
        next(err);
    })
})

/**선택한 옷장 게시물 1개의 사진 및 상세 내용(사용된 제품 정보) 조회 */
router.get('/:id', isLoggedIn, async (req, res, next) => {
    Closet.findAll({
        include: {
            model: Product, //사용된 제품 정보도 같이 나온다.
            through: {
                attributes: [] //relation table의 attribute는 안뽑히게함!
            }
        },
        where: { id: parseInt(req.params.id,10), userId: req.user.id }, //자기가 올린것만 볼 수 있음
        order: [['createdAt', 'DESC']],
    })
    .then((closets) => {
        if(closets[0] == undefined) {
            console.log('그런거 없어 메인 화면으로 돌아감');
            res.redirect('/');
        } else  {
            res.send(closets);
        }
    })
    .catch((err) => {
        console.error(err);
        next(err);
    });
});

/**나의 옷장에 등록된 특정 게시물을 삭제한다. 사용된 제품과의 연결도 삭제된다. */
router.delete('/:id', isLoggedIn, async (req, res, next) => { //옷장 아이디값이 파라미터로 온다.
    try {
        const closet = await Closet.findOne({ 
            include: [{
                model: Product,
                attributes: ['id'],
            }],
            where: { id: parseInt(req.params.id,10), userId: req.user.id }});

        console.log('이게무슨값일까?????',closet.products.map(r=>Number(r.id))); //사용된 상품들의 아이디를 배열로 만들어버리기
        
        await closet.removeProducts(closet.products.map(r=>Number(r.id))); //다대다 관계의 가운데 테이블은 직접 접근할 수 없음!!!!
        await closet.destroy({});
        res.send('success');

    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;