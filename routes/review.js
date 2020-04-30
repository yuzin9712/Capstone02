const express = require('express');
const db = require('../models');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');

const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

const router = express.Router();

var upload = multer({
    storage: multerS3({
        s3: new AWS.S3(),
        bucket: 'swcap02',
        key: function (req, file, cb) {
            cb(null, `review/${Date.now()}${path.basename(file.originalname)}`);
        },
        acl: 'public-read-write'
    })
});

/**리뷰 작성하기 - 상품 아이디값이 파라미터로 옴 */
// router.post('/:id', upload.array('photo', 3), async (req, res, next) => {
//     var productId = parseInt(req.params.id, 10);
//     var content = req.body.content;

//     var data = [ req.user.id, parseInt(req.params.id, 10), req.body.productname, req.body.cnt, req.body.img ];
// })

module.exports = router;