const express = require('express');
const multer = require('multer');
const path = require('path');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');

const { Closet, Product, ImgByColor } = require('../models');
const { isLoggedIn } = require('./middlewares');

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
        key(req, file, cb) {
            cb(null, `closet/${Date.now()}${path.basename(file.originalname)}.PNG`);
        },
    }),
    limits: { fileSize: 25 * 1024 * 1024 }, //25MB
});

router.post('/img',isLoggedIn, upload.single('image'), async (req, res, next) => {
  console.log('/img로 들어왔음!!!!');
  console.log(req.file);

  // const s3Imgs = req.file;
  // const imgs = s3Imgs.map(img => img.location);

  // console.log('보내는 데이터는???', imgs);

  res.json(req.file.location);
});

const upload2 = multer();

/**나의 옷장에 사진과 함께 사용된 제품 아이디 저장*/
router.post('/', isLoggedIn, async (req, res, next) => {
    try {
        console.log('---------------시작------------'); 
        //사용된 물품의 아이디를 배열로 받아온다 ? 그리고 받아온 사진도 저장한다.
        const closet = await Closet.create({
            img: req.body.image,
            userId: req.user.id
        });
        // console.log(req.file);
        // const url = req.body.product; //url이 여러개 담겨있음
        // const products = await url.split(','); //얘가 상품 url이 담긴 배열이고  
        
        // console.log(url);
        // console.log('전!!!!!!: ',products);

        // var uniqueProducts = await products.reduce(function(a,b) {
        //     if(a.indexOf(b) < 0)
        //         a.push(b);
        //         return a;
        // }, []);

        // console.log('후!!!!!!!: ',uniqueProducts);

        // //그러면 imgbycolor테이블에서 img url이 받아온 값과 같은 걸 찾아내고.
        const result = await Promise.all(req.body.products.map(product => Product.findOne({
            where: { id: product },
        }))); //id 맞는 제품들을 조회하겠다!!
        console.log(result)

        await closet.addProducts(result.map(r=>Number(r.id))); //relation 테이블에 제품의 아이디가 담기게 하기
        
        res.send('success');
    } catch (err) {
        console.error(err);
        res.status(403).send('Error');
    }
});

/**나의 옷장에 저장된 게시물들의 사진을 조회 - 나의옷장에서 선택하기 실행시 */
router.get('/all', async (req, res, next) => {
    await Closet.findAll({
        where: { userId: req.user.id },
        attributes: ['id', 'img'],
        order: [['createdAt', 'DESC']],
    })
    .then((imgs) => {
        res.send(imgs);
    })
    .catch((err) => {
        console.error(err);
        res.status(403).send('Error');
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
        res.status(403).send('Error');
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
        
        //await closet.removeProducts(closet.products.map(r=>Number(r.id))); //다대다 관계의 가운데 테이블은 직접 접근할 수 없음!!!!
        await closet.destroy({});
        res.send('success');

    } catch (err) {
        console.error(err);
        res.status(403).send('Error');
    }
});

module.exports = router;