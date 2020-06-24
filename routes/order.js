const express = require('express');

const { isLoggedIn } = require('./middlewares');
const { Order, OrderDetail, Delivery, Product, ProductInfo, ShopAdmin } = require('../models');
const { Op } = require('sequelize');
const { db } = require('../models');

const router = express.Router();

//배송정보, 주문자정보 등록(????) / 주문 등록/ 주문내역조회

/**주문자 정보, 주문 상품 정보 정보, 배송지 정보 등록하기 */
router.post('/', isLoggedIn, async (req, res, next) => {
    try {
        const ordererInfo = req.body.ordererInfo; //주문자 정보(이름, 전화번호1, 전화번호2, 이메일) 전화번호1이 핸드폰 번호로 필수입력란입니다.
        const orderProductInfo = req.body.orderProductInfo; //주문한 상품들의 배열 목록
        const deliveryInfo = req.body.deliveryInfo; // 주문자 배송정보
        
        console.log('주문한제품은????', orderProductInfo);
        var price = orderProductInfo.map(r=>r.price);
        console.log('합은?',price.reduce((a,b) => a + b));

        await orderProductInfo.map(product => {
            console.log('정보는!?!?!?',product);
            if(product.size == ''){
                console.log('이거는없엉');
                product.size = null;
                console.log('바뀐정보는????', product);
            }

            ProductInfo.findOne({ //재고 줄어듬
                where: { productId: product.id, size: product.size, color: product.color },
            }).then(productInfo => {

                if(product.cnt <= productInfo.cnt){
                    console.log('살 수 있음');
                    return productInfo.decrement('cnt', {by: product.cnt});
                }
                else {
                    console.error('수량부족');
                    throw new Error('수량부족한 상품');
                }
            })
        });

        const newOrder = await Order.create({
            name: ordererInfo.name,
            email: ordererInfo.email,
            phone: ordererInfo.phone,
            phone2: ordererInfo.phone2,
            total: price.reduce((a,b) => a + b),
            userId: req.user.id
        });

        console.log(newOrder.id);
        
    
        await Promise.all(orderProductInfo.map(order => OrderDetail.create({
            price: order.price,
            cnt: order.cnt,
            size: order.size,
            color: order.color,
            orderId: newOrder.id,
            productId: order.id
        })));

        

        await Delivery.create({
            email: deliveryInfo.email,
            name: deliveryInfo.name,
            phone: deliveryInfo.phone,
            addr1: deliveryInfo.addr1,
            addr2: deliveryInfo.addr2,
            zipCode: deliveryInfo.zipCode,
            message: deliveryInfo.message,
            orderId: newOrder.id
        });
    
        res.send('success');
    
    } catch (err) {
        console.error(err);
        res.status(403).send('Error');
    }

});

/**사용자별 주문정보 전체 조회 */
router.get('/', isLoggedIn, async (req, res, next) => {
    try {
        await Order.findAll({
            include: [{
                model: OrderDetail,
                include: [{
                    model: Product,
                    attributes: ['img', 'pname', 'price', 'shopAdminId'],
                    include: {
                        model: ShopAdmin,
                    }
                }]
            }],
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
        })
        .then((orders) => {
            res.send(orders);
        })

    } catch (err) {
        console.error(err);
        res.status(403).send('Error');
    }
});

/**각 주문의 하나하나에 들어갈때 ..? 이게 필요한지 모르겠네 .. */
// router.get('/:id', async (req, res, next) => {

// })

module.exports = router;